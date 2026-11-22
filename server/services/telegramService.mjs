export function createTelegramService(config, fetchImpl = fetch) {
  const enabled = Boolean(config.telegramBotToken && config.telegramChatId);

  async function notifySlip({ order, bytes, contentType, approveUrl }) {
    if (!enabled) return { sent: false, reason: "disabled" };
    const caption = [
      "🧾 สลิปเติมเงินใหม่",
      `Order: ${order.orderCode || order.id}`,
      `Account: @${order.loginName}`,
      `Amount: ฿${Number(order.amountThb).toLocaleString("en-US")}`,
      `Credits: ${Number(order.creditsAmount).toLocaleString("en-US")}`,
      "",
      "ตรวจยอดและล็อกอิน Admin ก่อนอนุมัติ:",
      approveUrl,
    ].join("\n");
    const form = new FormData();
    form.set("chat_id", config.telegramChatId);
    form.set("caption", caption);
    form.set("photo", new Blob([bytes], { type: contentType }), "payment-slip");
    const response = await fetchImpl(`https://api.telegram.org/bot${config.telegramBotToken}/sendPhoto`, {
      method: "POST",
      body: form,
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) throw new Error(`Telegram notification failed with HTTP ${response.status}`);
    return { sent: true };
  }

  return { enabled, notifySlip };
}
