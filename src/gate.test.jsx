import { describe, it, expect, beforeEach, vi } from "vitest";
import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { act } from "react";
import App from "./App.jsx";
import { setLang } from "./i18n.js";

// jsdom da React 18 "act" mujitini talab qiladi
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// ─────────────────────────────────────────────
// KIRISH GATE — majburiy obuna + bir martalik kod
//
// Oqim:  loading (splash) -> obuna -> kod -> ilova
// Test maqsadi: kirmagan foydalanuvchi ilovani KO'RA olmasin va
// kod serverda tekshirilsin (faqat localStorage emas).
// ─────────────────────────────────────────────

const WORKER_CODE = "PLXAB12CD34EF56";

const jsonResponse = (body, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => body,
});

beforeEach(() => {
  setLang("uz");
  localStorage.clear();
});

const mount = async () => {
  const el = document.createElement("div");
  document.body.appendChild(el);
  const root = createRoot(el);
  await act(async () => { root.render(<StrictMode><App /></StrictMode>); });
  return { el, root, text: () => el.textContent.replace(/\s+/g, " ") };
};

const click = async (el) => {
  await act(async () => { el.dispatchEvent(new MouseEvent("click", { bubbles: true })); });
};
const wait = async (ms) => { await act(async () => { await new Promise(r => setTimeout(r, ms)); }); };
const findByText = (el, re) => [...el.querySelectorAll("button")].find(b => re.test(b.textContent || ""));

// barcha so'rovlarni qayd etib, /auth/* ga maxsus javob beradi
const stubFetch = ({ subOk = true, join } = {}) => {
  const calls = [];
  globalThis.fetch = (url, opt = {}) => {
    const path = String(url).replace(/^https?:\/\/[^/]+/, "");
    const method = opt.method || "GET";
    calls.push(`${method} ${path}`);
    if (path === "/auth/check-sub") {
      return subOk ? Promise.resolve(jsonResponse({ ok: true, missing: [] }))
                   : Promise.resolve(jsonResponse({ code: "sub_required", missing: ["PremoLux"] }, 428));
    }
    if (path === "/auth/join") {
      const code = JSON.parse(opt.body || "{}").code;
      return join ? join(code) : Promise.resolve(jsonResponse({ invite: { kind: "worker", by: "owner" } }));
    }
    if (path === "/settings") return Promise.resolve(jsonResponse({ streams: 8 }));
    if (path === "/auth/verify") return Promise.resolve(jsonResponse({ ok: true }));
    if (path === "/people") return Promise.resolve(jsonResponse([]));
    if (path === "/auth/invites") {
      return Promise.resolve(jsonResponse(
        { ok: true, kind: "partner", codes: ["PLXAB12CD34EF56"] }));
    }
    return Promise.resolve(jsonResponse({}));
  };
  return calls;
};

const typeInto = async (input, value) => {
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
};

describe("kirish gate — majburiy obuna", () => {
  it("loading tugagach obuna ekrani chiqadi, ilova emas", async () => {
    stubFetch();
    const { el, root, text } = await mount();
    await wait(2700);                                    // splash o'tadi

    // majburiy obuna ekrani
    expect(text()).toMatch(/Kanalga obuna bo'ling/);
    expect(text()).toMatch(/@PremoLux/);                 // yangiliklar kanali
    expect(text()).toMatch(/@Premolux_chat/);            // guruhimiz

    // hali kirilmagan foydalanuvchi ilova sahifasini KO'RMASIN
    expect(el.querySelectorAll("nav button").length).toBe(0);
    await act(async () => { root.unmount(); });
  }, 20000);

  it("obuna tasdiqlangach kod bosqichiga o'tadi", async () => {
    stubFetch();
    const { el, root, text } = await mount();
    await wait(2700);

    const btn = findByText(el, /Obuna bo'ldim/);
    expect(btn).toBeTruthy();
    await click(btn);
    await wait(1200);                                    // server javobi + 0.9 s

    expect(text()).toMatch(/Taklif kodini kiriting/);
    expect(el.querySelector("input")).toBeTruthy();
    await act(async () => { root.unmount(); });
  }, 20000);

  it("obuna tasdiqlanmasa kod bosqichiga O'TMAYDI", async () => {
    stubFetch({ subOk: false });
    const { el, root, text } = await mount();
    await wait(2700);

    await click(findByText(el, /Obuna bo'ldim/));
    await wait(400);

    // hali kanal/guruhga a'zo emasiz — kod so'ralmaydi
    expect(text()).not.toMatch(/Taklif kodini kiriting/);
    await act(async () => { root.unmount(); });
  }, 20000);
});

describe("kirish gate — bir martalik kod", () => {
  const toCodeStep = async () => {
    const calls = stubFetch();
    const m = await mount();
    await wait(2700);
    await click(findByText(m.el, /Obuna bo'ldim/));
    await wait(1200);
    return { ...m, calls };
  };

  it("ishchi kodi serverda tekshiriladi va foydalanuvchi kiradi", async () => {
    const seen = [];
    const { el, root, text } = await toCodeStep();
    // endi kodni kiritamiz
    const joinCalls = stubFetch({ join: (code) => {
      seen.push(code);
      return Promise.resolve(jsonResponse({ invite: { kind: "worker", by: "owner" } }));
    }});

    const input = el.querySelector("input");
    await typeInto(input, "plx-ab12-cd34-ef56");       // kichik harf + chiziqcha
    await click(findByText(el, /^Tasdiqlash$/));
    await wait(1600);                                    // server + 1.2 s

    // serverga BIR MARTALIK tekshiruv uchun so'rov ketdi
    expect(joinCalls).toContain("POST /auth/join");
    expect(seen[0]).toBe(WORKER_CODE);                  // registr/chiziqcha tozalangan

    // foydalanuvchi ilovaga KIRDI
    expect(text()).toMatch(/Premium olish/);
    // ishchi roli: faqat 3 tab (premium/kartalar/statistika) + profil
    expect(el.querySelectorAll("nav button").length).toBe(4);
    expect(text()).not.toMatch(/Botlar/);              // ishchiga ko'rinmaydi
    await act(async () => { root.unmount(); });
  }, 25000);

  it("ishlatilgan kod qayta qabul qilinmaydi", async () => {
    const { el, root, text } = await toCodeStep();
    // backend "kod allaqal ishlatilgan" deb rad etadi
    stubFetch({ join: () => Promise.resolve(
      jsonResponse({ code: "code_used", message: "Kod allaqal ishlatilgan" }, 400)) });

    await typeInto(el.querySelector("input"), "PLXAB12CD34EF56");
    await click(findByText(el, /^Tasdiqlash$/));
    await wait(900);

    expect(text()).toMatch(/allaqal ishlatilgan/);
    // ilovaga KIRMADI
    expect(el.querySelectorAll("nav button").length).toBe(0);
    await act(async () => { root.unmount(); });
  }, 25000);

  it("noto'g'ri kod xatosi ko'rsatiladi", async () => {
    const { el, root, text } = await toCodeStep();
    stubFetch({ join: () => Promise.resolve(
      jsonResponse({ code: "not_found", message: "Kod topilmadi" }, 404)) });

    await typeInto(el.querySelector("input"), "PLXFFFFFFFFFFFF");
    await click(findByText(el, /^Tasdiqlash$/));
    await wait(900);

    expect(text()).toMatch(/Bunday kod topilmadi/);
    expect(el.querySelectorAll("nav button").length).toBe(0);
    await act(async () => { root.unmount(); });
  }, 25000);

  it("to'ldirilmagan kod bilan tasdiqlash tugmasi o'chqin", async () => {
    const { el, root } = await toCodeStep();
    const btn = findByText(el, /^Tasdiqlash$/);
    expect(btn.disabled).toBe(true);
    await act(async () => { root.unmount(); });
  }, 25000);
});

describe("gate — allaqachon kirmagan foydalanuvchi", () => {
  it("rol saqlangan bo'lsa gate ko'rsatilmaydi", async () => {
    stubFetch();
    localStorage.setItem("premolux_v1", JSON.stringify({ lang: "uz", role: "owner" }));
    const { el, root } = await mount();
    await wait(2700);

    // to'g'ridan-to'g'ri ilova — oraliq oyna yo'q
    expect(el.textContent).not.toMatch(/Kanalga obuna bo'ling/);
    expect(el.querySelectorAll("nav button").length).toBeGreaterThanOrEqual(5);
    await act(async () => { root.unmount(); });
  }, 20000);
});

// ─────────────────────────────────────────────
// OWNER KOD YARATADI
//
// Kod boshqa odamda ishlashi uchun SERVERDA bo'lishi kerak —
// /auth/join bazadan izlaydi. Bu test shu server yo'lini tekshiradi.
// ─────────────────────────────────────────────
describe("owner — taklif kodi yaratish", () => {
  const bootOwner = () => localStorage.setItem("premolux_v1", JSON.stringify({
    lang: "uz", role: "owner", cfg: { nOk: true, nErr: true, nLimit: true, daily: false },
  }));

  // Jamoa sahifasi va "Kod yaratish" tugmasi
  const openTeam = async (el, root) => {
    const nav = [...el.querySelectorAll("nav button")];
    const team = nav.find(b => /Jamoa/.test(b.textContent || "")) || nav[3];
    await click(team);
    await wait(200);
  };
  const makeBtn = (el) => findByText(el, /Kod yaratish/);

  it("kod serverda yaratiladi — boshqa odamda ishlaydi", async () => {
    bootOwner();
    const calls = stubFetch();
    const { el, root, text } = await mount();
    await wait(2700);
    await openTeam(el, root);

    const btn = makeBtn(el);
    expect(btn).toBeTruthy();
    await click(btn);
    await wait(700);

    // serverga so'rov ketdi
    expect(calls).toContain("POST /auth/invites");
    // server bergan kod chiziqchali ko'rinadi (PLX-XXXX-XXXX-XXXX)
    expect(text()).toMatch(/PLX-AB12-CD34-EF56/);
    await act(async () => { root.unmount(); });
  }, 25000);

  it("endpoint yo'q bo'lsa ilova buzilmaydi — mahalliy rejim", async () => {
    bootOwner();
    // backend hali yangilanmagan: /auth/invites -> 404
    const calls = stubFetch();
    globalThis.fetch = (url, opt = {}) => {
      const path = String(url).replace(/^https?:\/\/[^/]+/, "");
      const method = opt.method || "GET";
      calls.push(`${method} ${path}`);
      if (path === "/auth/invites") {
        return Promise.resolve(jsonResponse({ detail: "Not Found" }, 404));
      }
      if (path === "/auth/check-sub") return Promise.resolve(jsonResponse({ ok: true }));
      if (path === "/settings") return Promise.resolve(jsonResponse({ streams: 8 }));
      if (path === "/auth/verify") return Promise.resolve(jsonResponse({ ok: true }));
      if (path === "/people") return Promise.resolve(jsonResponse([]));
      return Promise.resolve(jsonResponse({}));
    };

    const { el, root, text } = await mount();
    await wait(2700);
    await openTeam(el, root);
    await click(makeBtn(el));
    await wait(700);

    // kod baribir yaratildi + owner ogohlantirildi
    expect(text()).toMatch(/PLX-/);
    expect(text()).toMatch(/faqat SHU qurilmada ishlaydi/);
    await act(async () => { root.unmount(); });
  }, 25000);

  it("backend bitta 400 qaytarsa — xabar ikkala holatni ham qamrab oladi", async () => {
    // backend noto'g'ri va ishlatilgan kod uchun BIR XIL xato beradi
    bootOwner();
    stubFetch();
    const { el, root } = await mount();
    await wait(2700);
    await openTeam(el, root);
    await click(makeBtn(el));
    await wait(700);

    // endi yangi foydalanuvchi sifatida kod kiritamiz
    await act(async () => { root.unmount(); });
    localStorage.clear();
    setLang("uz");

    const calls = [];
    globalThis.fetch = (url, opt = {}) => {
      const path = String(url).replace(/^https?:\/\/[^/]+/, "");
      calls.push(`${(opt.method || "GET")} ${path}`);
      if (path === "/auth/check-sub") return Promise.resolve(jsonResponse({ ok: true }));
      if (path === "/auth/join") {
        return Promise.resolve(jsonResponse(
          { detail: "Kod noto'g'ri yoki allaqachon ishlatilgan" }, 400));
      }
      if (path === "/settings") return Promise.resolve(jsonResponse({ streams: 8 }));
      if (path === "/auth/verify") return Promise.resolve(jsonResponse({ ok: true }));
      if (path === "/people") return Promise.resolve(jsonResponse([]));
      return Promise.resolve(jsonResponse({}));
    };

    const m = await mount();
    await wait(2700);
    await click(findByText(m.el, /Obuna bo'ldim/));
    await wait(1200);
    await typeInto(m.el.querySelector("input"), "PLXAB12CD34EF56");
    await click(findByText(m.el, /^Tasdiqlash$/));
    await wait(800);

    // xato "noto'g'ri" va "ishlatilgan" ni ikkalasini ham aytadi
    expect(m.text()).toMatch(/noto'g'ri yoki allaqal ishlatilgan/);
    expect(m.el.querySelectorAll("nav button").length).toBe(0);
    await act(async () => { m.root.unmount(); });
  }, 30000);
});
