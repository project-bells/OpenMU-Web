import assert from "node:assert/strict";
import { createServer } from "node:http";
import test from "node:test";
import { createHandler, loadConfig, validateRegistration } from "./app.mjs";

async function listen(handler) {
  const server = createServer(handler);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  return { server, url: `http://127.0.0.1:${address.port}` };
}

test("valid registration is mapped to the OpenMU contract", () => {
  assert.deepEqual(validateRegistration({ loginName: "Hero01", password: "Good Pass9!", email: "hero@example.com" }), { loginName: "Hero01", password: "Good Pass9!", eMail: "hero@example.com" });
});

test("client protocol limits are enforced", () => {
  assert.equal(typeof validateRegistration({ loginName: "name-is-too-long", password: "GoodPass9!", email: "hero@example.com" }), "string");
  assert.equal(typeof validateRegistration({ loginName: "Hero", password: "password-that-is-over-twenty", email: "hero@example.com" }), "string");
  assert.equal(typeof validateRegistration({ loginName: "Hero", password: "GoodPass9!", email: "invalid" }), "string");
});

test("configuration fails closed when credentials are absent", () => {
  assert.throws(() => loadConfig({}), /OPENMU_API_URL/);
  assert.throws(() => loadConfig({ OPENMU_API_URL: "https://openmu.local", OPENMU_API_KEY: "short" }), /OPENMU_API_KEY/);
});

test("registration forwards the official contract and keeps the API key server-side", async (context) => {
  let received;
  const upstream = await listen(async (request, response) => {
    const chunks = [];
    for await (const chunk of request) chunks.push(chunk);
    received = { url: request.url, key: request.headers["x-api-key"], body: JSON.parse(Buffer.concat(chunks)) };
    response.writeHead(201).end();
  });
  const gateway = await listen(createHandler({ apiUrl: upstream.url, apiKey: "x".repeat(32), trustProxy: false, requestTimeoutMs: 1000 }));
  context.after(() => { gateway.server.close(); upstream.server.close(); });

  const result = await fetch(`${gateway.url}/api/account/register`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ loginName: "Hero01", password: "GoodPass9!", email: "hero@example.com" }),
  });
  assert.equal(result.status, 201);
  assert.deepEqual(received, { url: "/api/accounts", key: "x".repeat(32), body: { loginName: "Hero01", password: "GoodPass9!", eMail: "hero@example.com" } });
  assert.doesNotMatch(await result.text(), /x{32}|GoodPass9/);
});

test("server status normalizes OpenMU's JSON-string response", async (context) => {
  const upstream = await listen((_request, response) => {
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify(JSON.stringify({ state: "Online", players: 42, playersList: ["private-name"] })));
  });
  const gateway = await listen(createHandler({ apiUrl: upstream.url, apiKey: "x".repeat(32), trustProxy: false, requestTimeoutMs: 1000 }));
  context.after(() => { gateway.server.close(); upstream.server.close(); });

  const result = await fetch(`${gateway.url}/api/server/status`);
  const body = await result.json();
  assert.equal(body.state, "online");
  assert.equal(body.players, 42);
  assert.equal("playersList" in body, false);
});

test("malformed and traversal-like static paths never escape the dist root", async (context) => {
  const gateway = await listen(createHandler({ apiUrl: "https://openmu.invalid", apiKey: "x".repeat(32), trustProxy: false, requestTimeoutMs: 1000 }));
  context.after(() => gateway.server.close());

  const malformed = await fetch(`${gateway.url}/%E0%A4%A`);
  assert.equal(malformed.status, 400);

  const traversal = await fetch(`${gateway.url}/..%2Fserver%2Fapp.mjs`);
  assert.equal(traversal.status, 200);
  assert.doesNotMatch(await traversal.text(), /OPENMU_API_KEY|createHandler/);
});
