import assert from "node:assert/strict";
import { createServer } from "node:http";
import { basename } from "node:path";
import test from "node:test";
import { createHandler, loadConfig, resolveStaticFile, validateRegistration } from "./app.mjs";

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
    response.end(JSON.stringify(JSON.stringify({
      state: "Online",
      players: 42,
      playersList: ["private-name"],
      realms: [{ id: 0, name: "Origins-1", online: 42, max: 2500, loadPct: 2, pvp: true, status: "Normal" }],
    })));
  });
  const gateway = await listen(createHandler({ apiUrl: upstream.url, apiKey: "x".repeat(32), trustProxy: false, requestTimeoutMs: 1000 }));
  context.after(() => { gateway.server.close(); upstream.server.close(); });

  const result = await fetch(`${gateway.url}/api/server/status`);
  const body = await result.json();
  assert.equal(body.state, "online");
  assert.equal(body.players, 42);
  assert.equal("playersList" in body, false);
  assert.equal(body.realms.length, 1);
  assert.equal(body.realms[0].name, "Origins-1");
});

test("malformed and traversal-like static paths never escape the dist root", () => {
  assert.equal(resolveStaticFile("/%E0%A4%A"), null);
  const traversal = resolveStaticFile("/..%2Fserver%2Fapp.mjs");
  assert.ok(traversal);
  assert.equal(basename(traversal), "index.html");
});

test("character and guild rankings proxy to OpenMU and return data", async (context) => {
  const upstream = await listen((request, response) => {
    response.writeHead(200, { "Content-Type": "application/json" });
    if (request.url.startsWith("/api/rankings/characters")) {
      response.end(JSON.stringify({
        total: 1,
        characters: [{ rank: 1, name: "Hero", classId: "dk", className: "Blade Master", classShort: "DK", level: 400, masterLevel: 250, resets: 98, grandResets: 3, guild: "ORIGINS", isOnline: true }]
      }));
    } else if (request.url.startsWith("/api/rankings/guilds")) {
      response.end(JSON.stringify({
        total: 1,
        guilds: [{ rank: 1, name: "ORIGINS", master: "Hero", score: 12000, totalResets: 350, members: "25/40", siegeStatus: "Castle Lord" }]
      }));
    } else {
      response.writeHead(404).end();
    }
  });
  const gateway = await listen(createHandler({ apiUrl: upstream.url, apiKey: "x".repeat(32), trustProxy: false, requestTimeoutMs: 1000 }));
  context.after(() => { gateway.server.close(); upstream.server.close(); });

  const charsRes = await fetch(`${gateway.url}/api/rankings/characters?search=Hero&class=DK`);
  assert.equal(charsRes.status, 200);
  const charsBody = await charsRes.json();
  assert.equal(charsBody.total, 1);
  assert.equal(charsBody.characters[0].name, "Hero");

  const guildsRes = await fetch(`${gateway.url}/api/rankings/guilds?search=ORIGINS`);
  assert.equal(guildsRes.status, 200);
  const guildsBody = await guildsRes.json();
  assert.equal(guildsBody.total, 1);
  assert.equal(guildsBody.guilds[0].name, "ORIGINS");
});

test("unhandled api paths return 404 JSON instead of HTML fallback", async (context) => {
  const gateway = await listen(createHandler({ apiUrl: "http://127.0.0.1:9", apiKey: "x".repeat(32), trustProxy: false, requestTimeoutMs: 1000 }));
  context.after(() => { gateway.server.close(); });

  const result = await fetch(`${gateway.url}/api/nonexistent`);
  assert.equal(result.status, 404);
  assert.equal(result.headers.get("content-type"), "application/json; charset=utf-8");
  const body = await result.json();
  assert.deepEqual(body, { error: "Not found." });
});
