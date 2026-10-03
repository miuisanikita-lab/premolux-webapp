import { describe, it, expect, beforeEach } from "vitest";
import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { act } from "react";
import App from "./App.jsx";
import { setLang } from "./i18n.js";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const noop = () => {};
const click = async (el) => {
  await act(async () => { el.dispatchEvent(new MouseEvent("click", { bubbles: true })); });
};

// soxta server: qaysi endpoint chaqirilganini yozib boradi
const mockServer = (settings = {}) => {
  const calls = [];
  globalThis.fetch = (url, opts = {}) => {
    const path = String(url).replace(/^https?:\/\/[^/]+/, "");
    const method = (opts.method || "GET").toUpperCase();
    calls.push({ path, method, body: opts.body ? JSON.parse(opts.body) : null });
    const json = (data) => Promise.resolve({
      ok: true, status: 200,
      json: async () => data,
    });
    if (path === "/settings" && method === "GET") {
      return json({ streams: 8, retry: 1, cardCap: 3, pin: false, lockAfter: 5,
                    maskPan: true, nOk: true, nLimit: true, nErr: true,
                    daily: false, dailyAt: 21, haptic: true, calm: false, ...settings });
    }
    if (path === "/settings" && method === "PUT") {
      return json({ streams: 8, retry: 1, cardCap: 3, pin: false, lockAfter: 5,
                    maskPan: true, nOk: true, nLimit: true, nErr: true,
                    daily: false, dailyAt: 21, haptic: true, calm: false, ...settings,
                    ...(opts.body ? JSON.parse(opts.body) : {}) });
    }
    if (path === "/auth/verify") return json({ id: 1, tgId: 7, name: "Alisher", role: "owner" });
    if (path === "/people") return json([]);
    return Promise.reject(new Error("offline"));
  };
  return calls;
};

const boot = (over = {}) => localStorage.setItem("premolux_v1", JSON.stringify({
  lang: "uz", role: "owner",
  cfg: { streams: 8, retry: 1, cardCap: 3, maskPan: true, nOk: true, nLimit: true,
         nErr: true, daily: false, dailyAt: 21, haptic: true, calm: false, ...over },
  people: [], bots: [], account: "+998905890192",
}));

const mountApp = async () => {
  const el = document.createElement("div");
  document.body.appendChild(el);
  const root = createRoot(el);
  await act(async () => { root.render(<StrictMode><App /></StrictMode>); });
  await act(async () => { await new Promise(r => setTimeout(r, 2400)); });  // splash
  return { el, root, unmount: () => act(async () => { root.unmount(); el.remove(); }) };
};

beforeEach(() => { setLang("uz"); localStorage.clear(); });

describe("sozlamalarning server bilan sinxroni", () => {
  it("ilova ochilishida GET /settings chaqiriladi", async () => {
    const calls = mockServer();
    boot();
    const { unmount } = await mountApp();
    const get = calls.find(c => c.path === "/settings" && c.method === "GET");
    expect(get, "GET /settings chaqirilmadi").toBeTruthy();
    await unmount();
  }, 20000);

  it("serverdagi qiymatlar ilovaga qo'llaniladi", async () => {
    // serverda streams: 5, retry: 3 — frontendda 8/1 bo'lishi kerak
    const calls = mockServer({ streams: 5, retry: 3 });
    boot();
    const { unmount } = await mountApp();
    for (const w of [200, 600, 1500]) {
      await act(async () => { await new Promise(r => setTimeout(r, w)); });
      const s2 = JSON.parse(localStorage.getItem("premolux_v1") || "{}");
      console.log("   kutib turgan:", w, "ms -> streams:", s2.cfg?.streams, "| GETlar:", calls.filter(c=>c.path==="/settings").length);
    }
    console.log("   BARCHA so'rovlar:", JSON.stringify(calls.map(c=>c.method+" "+c.path)));
    const saved = JSON.parse(localStorage.getItem("premolux_v1") || "{}");
    expect(saved.cfg.streams).toBe(5);
    expect(saved.cfg.retry).toBe(3);
    await unmount();
  }, 20000);

  it("server qiymat olganda qayta yuborilmaydi (chiziqli ping-pong yo'q)", async () => {
    const calls = mockServer({ streams: 5 });
    boot();
    const { unmount } = await mountApp();
    await act(async () => { await new Promise(r => setTimeout(r, 1200)); });
    const puts = calls.filter(c => c.path === "/settings" && c.method === "PUT");
    expect(puts.length, "serverdan olingan qiymat qayta yuborildi").toBe(0);
    await unmount();
  }, 20000);

  it("foydalanuvchi o'zgartirsa — PUT /settings yuboriladi", async () => {
    const calls = mockServer();
    boot();
    const { el, unmount } = await mountApp();

    // Sozlamalar sahifasiga o'tamiz
    const nav = [...el.querySelectorAll("nav button")];
    await click(nav[nav.length - 1]);                       // profil
    await act(async () => { await new Promise(r => setTimeout(r, 120)); });
    const row = [...el.querySelectorAll("button")].find(b => /Sozlamalar/.test(b.textContent));
    await click(row);
    await act(async () => { await new Promise(r => setTimeout(r, 150)); });

    // "Bir vaqtda oqim" qatoridagi "+" tugmasi
    const streamRow = [...el.querySelectorAll("button")].find(b => /Bir vaqtda oqim/.test(b.textContent))
      || el.querySelector("main");
    const plus = [...el.querySelectorAll("button")].find(b => (b.getAttribute("aria-label") || "") === "+1");
    expect(plus, "'+' tugmasi topilmadi").toBeTruthy();
    await click(plus);
    await act(async () => { await new Promise(r => setTimeout(r, 1000)); });   // debounce 700ms

    const put = calls.find(c => c.path === "/settings" && c.method === "PUT");
    expect(put, "PUT /settings yuborilmadi").toBeTruthy();
    expect(put.body.streams).toBe(9);
    expect(put.body).toHaveProperty("maskPan");
    expect(put.body).toHaveProperty("cardCap");
    expect(put.body.pin).toBe(false);            // PIN olib tashlangan
    await unmount();
  }, 25000);

  it("serverga ulanib bo'lmasa ilova ishlayveradi (oflayn)", async () => {
    globalThis.fetch = () => Promise.reject(new Error("offline"));
    boot();
    const { el, unmount } = await mountApp();
    expect(el.textContent).toMatch(/Premium olish/);       // ilova oqildi
    await unmount();
  }, 20000);
});
