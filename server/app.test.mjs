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

test("character rankings normalize OpenMU class numbers, GUIDs, 3rd classes, and StatAttributes", async (context) => {
  const upstream = await listen((request, response) => {
    response.writeHead(200, { "Content-Type": "application/json" });
    if (request.url.startsWith("/api/rankings/characters")) {
      response.end(JSON.stringify({
        total: 3,
        characters: [
          {
            name: "ArchMage",
            className: "Grand Master",
            classShort: "DK", // upstream broken fallback
            attributes: [
              { definition: { id: "560931ad-0901-4342-b7f4-fd2e2f056332", designation: "Level" }, value: 398 },
              { definition: { id: "70cd8c10-391a-4c51-9aa4-a8d4600e3a9f", designation: "Master Level" }, value: 185 },
              { definition: { id: "89a891a7-f9f9-4ab5-af36-12056e53a5f7", designation: "Resets" }, value: 42 },
            ],
          },
          {
            name: "EmperorDL",
            characterClassId: "00000000-0000-0001-0000-000000000017",
            cLevel: "400",
            mLevel: "120",
            resets: "30",
          },
          {
            name: "ElfQueen",
            characterClassNumber: 11,
            level: 365,
          },
        ],
      }));
    } else {
      response.writeHead(404).end();
    }
  });
  const gateway = await listen(createHandler({ apiUrl: upstream.url, apiKey: "x".repeat(32), trustProxy: false, requestTimeoutMs: 1000 }));
  context.after(() => { gateway.server.close(); upstream.server.close(); });

  const res = await fetch(`${gateway.url}/api/rankings/characters`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.characters.length, 3);

  assert.equal(body.characters[0].classId, "dw");
  assert.equal(body.characters[0].classShort, "GM");
  assert.equal(body.characters[0].className, "Grand Master");
  assert.equal(body.characters[0].level, 398);
  assert.equal(body.characters[0].masterLevel, 185);
  assert.equal(body.characters[0].resets, 42);

  assert.equal(body.characters[1].classId, "dl");
  assert.equal(body.characters[1].classShort, "LE");
  assert.equal(body.characters[1].className, "Lord Emperor");
  assert.equal(body.characters[1].level, 400);
  assert.equal(body.characters[1].masterLevel, 120);

  assert.equal(body.characters[2].classId, "elf");
  assert.equal(body.characters[2].classShort, "HE");
  assert.equal(body.characters[2].className, "High Elf");
  assert.equal(body.characters[2].level, 365);
  assert.equal(body.characters[2].masterLevel, 0);
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

test("users search returns matching users for autocomplete", async (context) => {
  const gateway = await listen(createHandler({ apiUrl: "http://127.0.0.1:9", apiKey: "x".repeat(32), trustProxy: false, requestTimeoutMs: 1000 }));
  context.after(() => { gateway.server.close(); });

  const result = await fetch(`${gateway.url}/api/users/search?q=wizard`);
  assert.equal(result.status, 200);
  const body = await result.json();
  assert.equal(body.success, true);
  assert.ok(Array.isArray(body.users));
  assert.ok(body.users.some((u) => u.username === "magic_wizard"));
});

test("admin grant balance validates permissions and updates player balance", async (context) => {
  const gateway = await listen(createHandler({ apiUrl: "http://127.0.0.1:9", apiKey: "x".repeat(32), trustProxy: false, requestTimeoutMs: 1000 }));
  context.after(() => { gateway.server.close(); });

  // Non-admin rejected
  const rejected = await fetch(`${gateway.url}/api/admin/grant-balance`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ adminUser: "player1", targetUser: "lorencia_pro", credits: 100, wcoin: 50 }),
  });
  assert.equal(rejected.status, 403);

  // Admin approved
  const approved = await fetch(`${gateway.url}/api/admin/grant-balance`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ adminUser: "admin", targetUser: "lorencia_pro", credits: 500, wcoin: 200, note: "Test Reward" }),
  });
  assert.equal(approved.status, 200);
  const data = await approved.json();
  assert.equal(data.success, true);
  assert.equal(data.targetUser, "lorencia_pro");
  assert.equal(data.addedCredits, 500);
  assert.equal(data.addedWcoin, 200);
});

test("player topup donation processes harmonized package bonus", async (context) => {
  const gateway = await listen(createHandler({ apiUrl: "http://127.0.0.1:9", apiKey: "x".repeat(32), trustProxy: false, requestTimeoutMs: 1000 }));
  context.after(() => { gateway.server.close(); });

  const result = await fetch(`${gateway.url}/api/topup/donate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "lorencia_pro", packageId: "tier-300", channel: "truemoney" }),
  });
  assert.equal(result.status, 200);
  const body = await result.json();
  assert.equal(body.success, true);
  assert.equal(body.addedCredits, 2160);
  assert.equal(body.addedWcoin, 650);
  assert.ok(body.txnId.startsWith("TXN-"));
});

