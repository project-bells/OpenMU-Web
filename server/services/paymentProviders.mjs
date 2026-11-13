import crypto from "node:crypto";
import { StoreError } from "../db/errors.mjs";

function formatTlv(tag, value) {
  const len = String(value.length).padStart(2, "0");
  return `${tag}${len}${value}`;
}

function crc16Ccitt(payload) {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i += 1) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j += 1) {
      crc = (crc & 0x8000) !== 0 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

/**
 * Builds an EMVCo Thai PromptPay QR payload (CRC16-CCITT) when PROMPTPAY_ID is configured.
 */
export function buildPromptPayPayload(targetId, amountThb) {
  const sanitized = String(targetId || "").replace(/[^0-9]/g, "");
  if (!sanitized) return null;

  let formattedTarget = sanitized;
  if (sanitized.length === 10 && sanitized.startsWith("0")) {
    formattedTarget = `0066${sanitized.slice(1)}`;
  }

  const subTag = sanitized.length >= 13 ? "02" : sanitized.length === 15 ? "03" : "01";
  const merchantInfo =
    formatTlv("00", "A000000677010111") +
    formatTlv(subTag, formattedTarget);

  const amountStr = Number(amountThb).toFixed(2);
  const bodyWithoutCrc =
    formatTlv("00", "01") +
    formatTlv("01", "12") +
    formatTlv("29", merchantInfo) +
    formatTlv("53", "764") +
    formatTlv("54", amountStr) +
    formatTlv("58", "TH") +
    "6304";

  return bodyWithoutCrc + crc16Ccitt(bodyWithoutCrc);
}

/**
 * Verifies HMAC-SHA256 webhook signature (`X-Webhook-Signature: t=<unix>,v1=<hex>` or `<hex>`).
 */
export function verifyWebhookHmacSignature({ rawBody, headers, secret, nowSeconds = Math.floor(Date.now() / 1000) }) {
  if (!secret) {
    return { valid: false, reason: "PAYMENT_WEBHOOK_SECRET is not configured." };
  }

  const sigHeader = String(headers["x-webhook-signature"] ?? headers["x-signature-sha256"] ?? "").trim();
  if (!sigHeader) {
    return { valid: false, reason: "Missing webhook signature header." };
  }

  let timestamp = null;
  let signatureHex = sigHeader;
  if (sigHeader.includes("v1=")) {
    const parts = Object.fromEntries(
      sigHeader.split(",").map((part) => {
        const [k, v] = part.trim().split("=");
        return [k, v];
      })
    );
    timestamp = Number.parseInt(parts.t ?? "", 10);
    signatureHex = parts.v1 ?? "";
    if (!Number.isFinite(timestamp) || Math.abs(nowSeconds - timestamp) > 300) {
      return { valid: false, reason: "Webhook timestamp expired or invalid." };
    }
  }

  const signedPayload = timestamp !== null ? `${timestamp}.${rawBody}` : rawBody;
  const expectedHex = crypto.createHmac("sha256", secret).update(signedPayload).digest("hex");
  const a = Buffer.from(signatureHex.toLowerCase(), "utf8");
  const b = Buffer.from(expectedHex.toLowerCase(), "utf8");
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return { valid: false, reason: "Invalid webhook HMAC signature." };
  }

  return { valid: true, reason: null };
}

export function createPayPalClient(config, fetchImpl = fetch) {
  const baseUrl = config.paypalEnv === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";

  function isConfigured() {
    return Boolean(config.paypalClientId && config.paypalClientSecret);
  }

  async function getAccessToken() {
    if (!isConfigured()) {
      throw new StoreError(503, "PAYPAL_NOT_CONFIGURED", "PayPal checkout is not configured on this server.");
    }
    const creds = Buffer.from(`${config.paypalClientId}:${config.paypalClientSecret}`).toString("base64");
    const response = await fetchImpl(`${baseUrl}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${creds}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });
    const data = await response.json();
    if (!response.ok || !data?.access_token) {
      throw new StoreError(502, "PAYPAL_AUTH_FAILED", "Failed to obtain PayPal access token.");
    }
    return data.access_token;
  }

  async function createOrder({ order, packageDef }) {
    const token = await getAccessToken();
    const response = await fetchImpl(`${baseUrl}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        "PayPal-Request-Id": order.id,
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            reference_id: order.orderCode,
            custom_id: order.id,
            description: `OpenMU-Origins ${packageDef.name} (${packageDef.id})`,
            amount: {
              currency_code: "THB",
              value: Number(packageDef.priceThb).toFixed(2),
            },
          },
        ],
        application_context: {
          return_url: `${config.publicWebUrl}/user/donate?paypal_order=${encodeURIComponent(order.id)}`,
          cancel_url: `${config.publicWebUrl}/user/donate?paypal_cancelled=${encodeURIComponent(order.id)}`,
        },
      }),
    });
    const data = await response.json();
    if (!response.ok || !data?.id) {
      throw new StoreError(502, "PAYPAL_CREATE_FAILED", data?.message || "Failed to create PayPal order.");
    }
    const approvalUrl = data.links?.find((l) => l.rel === "approve")?.href || null;
    return { providerOrderId: data.id, approvalUrl, rawStatus: data.status };
  }

  async function captureOrder({ providerOrderId, expectedAmountThb }) {
    const token = await getAccessToken();
    const response = await fetchImpl(`${baseUrl}/v2/checkout/orders/${encodeURIComponent(providerOrderId)}/capture`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: "{}",
    });
    const data = await response.json();
    if (!response.ok) {
      throw new StoreError(502, "PAYPAL_CAPTURE_FAILED", data?.message || "Failed to capture PayPal payment.");
    }
    if (data.status !== "COMPLETED") {
      throw new StoreError(400, "PAYPAL_NOT_COMPLETED", `PayPal capture status is ${data.status}.`);
    }
    const capture = data.purchase_units?.[0]?.payments?.captures?.[0];
    const paidValue = Number(capture?.amount?.value);
    const currency = capture?.amount?.currency_code;
    if (currency !== "THB" || Math.abs(paidValue - Number(expectedAmountThb)) > 0.01) {
      throw new StoreError(400, "PAYPAL_AMOUNT_MISMATCH", "Captured PayPal amount or currency does not match the order.");
    }
    return {
      providerTransactionId: capture?.id || providerOrderId,
      raw: data,
    };
  }

  return { isConfigured, createOrder, captureOrder };
}

