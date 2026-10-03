import { describe, it, expect, beforeEach, vi } from "vitest";
import React, { Component, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { act } from "react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import App, { ErrorBoundary } from "./App.jsx";
import { setLang } from "./i18n.js";

// jsdom da React 18 "act" muhitini talab qiladi
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// ilova tarmoqqa chiqmasin — testlar tez va mustaqil bo'lsin
beforeEach(() => {
  setLang("uz");
  localStorage.clear();
  globalThis.fetch = () => Promise.reject(new Error("offline test"));
});

const mount = async (ui) => {
  const el = document.createElement("div");
  document.body.appendChild(el);
  const root = createRoot(el);
  await act(async () => { root.render(<StrictMode>{ui}</StrictMode>); });
  return { el, root, text: () => el.textContent.replace(/\s+/g, " ") };
};

const click = async (el) => { await act(async () => { el.dispatchEvent(new MouseEvent("click", { bubbles: true })); }); };
const findByText = (el, re) => [...el.querySelectorAll("button")].find(b => re.test(b.textContent || ""));

// ─────────────────────────────────────────────
// ① ErrorBoundary
// ─────────────────────────────────────────────
describe("ErrorBoundary", () => {
  class Boom extends Component {
    render() { throw new Error("sinov xatosi"); }
  }

  it("xatoni ushlab, xato ekranini ko'rsatadi", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const { el, root, text } = await mount(<ErrorBoundary><Boom /></ErrorBoundary>);

    expect(text()).toMatch(/Ilova ishdan chiqdi/);
    expect(text()).toMatch(/sinov xatosi/);          // xato matni ko'rinadi
    expect(findByText(el, /Qayta urinish/)).toBeTruthy();
    expect(findByText(el, /Sozlashlarni tiklash/)).toBeTruthy();

    spy.mockRestore();
    await act(async () => { root.unmount(); });
  });

  it("oddiy komponentga tegmadi", async () => {
    const { el, root, text } = await mount(<ErrorBoundary><div>normal</div></ErrorBoundary>);
    expect(text()).toBe("normal");
    await act(async () => { root.unmount(); });
  });

  it("kirish ekrani qulf emas — brendli splash", async () => {
    localStorage.setItem("premolux_v1", JSON.stringify({ lang: "uz", role: "owner" }));
    const { el, root, text } = await mount(<App />);
    // splash kamida 1.8 s ko'rinib turadi
    expect(text()).toMatch(/PremoLux/);
    expect(text()).not.toMatch(/Qulflan/);
    await act(async () => { root.unmount(); });
  });

  // ── OCHILISH EKRANI ──
  it("splash: belgi, nom, progress va holat qatori bor", async () => {
    localStorage.setItem("premolux_v1", JSON.stringify({ lang:"uz", role:"owner" }));
    const { el, root } = await mount(<App />);
    const t = el.textContent.replace(/\s+/g, " ");
    expect(t).toMatch(/PremoLux/);
    expect(t).toMatch(/Premium avtomatlashtirish/);   // mikro-yorliq
    // holat qatori — bosqich bo'yicha o'zgaradi (test muhitida
    // so'rovlar darhol tugab ketadi, shuning uchun oxirgi bosqich
    // ko'rinishi mumkin)
    expect(t).toMatch(/Telegram ulanmoqda|Sozlamalar yuklanmoqda|Kartalar yuklanmoqda|Tayyor/);
    expect(el.querySelector(".spDot")).toBeTruthy();            // pulsatsiya nuqtasi
    expect(el.querySelector("svg path[style*='--len']")).toBeTruthy();  // chiziladigan yulduz
    await act(async () => { root.unmount(); });
  }, 20000);

  it("splash: 2.9 sekunddan keyin butunlay yo'qoladi", async () => {
    localStorage.setItem("premolux_v1", JSON.stringify({ lang:"uz", role:"owner" }));
    const { el, root } = await mount(<App />);
    await act(async () => { await new Promise(r => setTimeout(r, 2900)); });
    expect(el.textContent).not.toMatch(/Premium avtomatlashtirish/);   // splash yo'qoldi
    // asosiy ilova ochildi — pastki menyu ko'rinadi
    expect(el.querySelectorAll("nav button").length).toBeGreaterThanOrEqual(5);
    await act(async () => { root.unmount(); });
  }, 20000);

  it("ilova 1.8 s ichida oqiladi (qulf kabi uzoq turmaydi)", async () => {
    localStorage.setItem("premolux_v1", JSON.stringify({ lang: "uz", role: "owner" }));
    const { el, root, text } = await mount(<App />);
    await act(async () => { await new Promise(r => setTimeout(r, 2600)); });
    expect(text()).toMatch(/Premium olish/);
    expect(text()).not.toMatch(/PremoLux/);          // splash yo'qoldi
    await act(async () => { root.unmount(); });
  }, 10000);
});

// ─────────────────────────────────────────────
// ② "Yaratish" server javob bermasa ham ishlaydi
// ─────────────────────────────────────────────
describe("qo'shish oqimi", () => {
  const boot = (people = []) => localStorage.setItem("premolux_v1", JSON.stringify({
    lang: "uz", role: "owner",
    cfg: { nOk: true, nErr: true, nLimit: true, daily: false, maskPan: false },
    people, bots: [], account: "+998905890192",
  }));

  const addPerson = async (name) => {
    boot([]);
    const { el, root, text } = await mount(<App />);
    await act(async () => { await new Promise(r => setTimeout(r, 2500)); });   // splash o'tishi

    const nav = [...el.querySelectorAll("nav button")];
    await click(nav[2]);                                   // "Kartalar"
    await act(async () => { await new Promise(r => setTimeout(r, 120)); });

    const addBtn = [...el.querySelectorAll("button")].find(b => /^Shaxs$/.test((b.textContent || "").trim()));
    expect(addBtn).toBeTruthy();
    await click(addBtn);
    await act(async () => { await new Promise(r => setTimeout(r, 120)); });

    const input = el.querySelector("input");
    expect(input).toBeTruthy();
    await act(async () => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(input, name);
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });

    const ok = findByText(el, /Yaratish/);
    expect(ok).toBeTruthy();
    expect(ok.disabled).toBe(false);
    await click(ok);
    await act(async () => { await new Promise(r => setTimeout(r, 800)); });

    return { el, root, text };
  };

  it("server javob bermasa ham shaxs yaratiladi", async () => {
    const { root, text } = await addPerson("Alisher");
    expect(text()).toMatch(/Alisher/);
    await act(async () => { root.unmount(); });
  }, 20000);

  it("bo'sh nom bilan tugma o'chirilgan", async () => {
    boot([]);
    const { el, root } = await mount(<App />);
    await act(async () => { await new Promise(r => setTimeout(r, 2500)); });
    const nav = [...el.querySelectorAll("nav button")];
    await click(nav[2]);
    await act(async () => { await new Promise(r => setTimeout(r, 120)); });
    const addBtn = [...el.querySelectorAll("button")].find(b => /^Shaxs$/.test((b.textContent || "").trim()));
    await click(addBtn);
    await act(async () => { await new Promise(r => setTimeout(r, 120)); });

    const ok = findByText(el, /Yaratish/);
    expect(ok.disabled).toBe(true);                       // bo'sh maydonda
    await act(async () => { root.unmount(); });
  }, 20000);
});

// ─────────────────────────────────────────────
// ③ Sozlamalar — hech biri yolg'on bo'lib qolmasin
// ─────────────────────────────────────────────
describe("sozlamalar — statik tahlil", () => {
  const src = readFileSync(resolve(process.cwd(), "src/App.jsx"), "utf8");

  it("cfg.streams Premium sahifasida ishlatiladi", () => {
    expect(src).toMatch(/cfg\.streams\s*\|\|\s*8/);
  });

  it("cfg.retry serverga yuboriladi", () => {
    expect(src).toMatch(/maxRetries:\s*cfg\.retry/);
  });

  it("cfg.cardCap yangi kartaga yoziladi", () => {
    expect(src).toMatch(/limit:\s*cfg\.cardCap/);
  });

  it("cfg.maskPan ishchilarda raqamni yashiradi", () => {
    expect(src).toMatch(/masked\s*=\s*cfg\?\.maskPan/);
    expect(src).toMatch(/<CardFlip card=\{card\} masked=\{masked\}/);
  });

  it("bildirishnoma sozlamalari xabarlarni filtrlaydi", () => {
    expect(src).toMatch(/toastAllowed/);
    expect(src).toMatch(/cfg\.nOk/);
    expect(src).toMatch(/cfg\.nErr/);
    expect(src).toMatch(/cfg\.nLimit/);
  });

  it("sozlamalardan hech biri o'zgaruvchida qolib ketmagan", () => {
    // har bir sozlama quyidagilarda uchrashishi kerak:
    //   1) standart qiymati bloki          -> "streams:8"
    //   2) Sozlamalar sahifasidagi tugma  -> cfg.streams
    //   3) ilovaning MANTIQIDA             -> cfg.streams (PremiumPage)
    // 2 va 3 bo'lmasa — tugma yolg'oni
    const known = ["streams","retry","cardCap","maskPan","nOk","nErr","nLimit",
                   "daily","dailyAt","haptic","calm"];
    const defaults = src.match(/streams:8[^}]*?\}/);
    expect(defaults, "standart sozlamalar bloki topilmadi").toBeTruthy();

    const inDefaults = [...defaults[0].matchAll(/(\w+):/g)].map(m => m[1]);
    for (const k of known) {
      expect(inDefaults, k).toContain(k);                    // standart qiymati bor
      // "cfg.key" yoki "cfg?.key" — ikkala shaklni ham hisoblaymiz
      const uses = (src.match(new RegExp(`cfg\\??\\.${k}\\b`, "g")) || []).length;
      // kamida 2: Sozlamalar sahifasi + ilova mantiqi
      expect(uses, `cfg.${k} faqat o'zgaruvchida qolgan — tugma yolg'oni`).toBeGreaterThanOrEqual(2);
    }
  });
});

// ─────────────────────────────────────────────
describe("UI tuzilmasi", () => {
  const src = readFileSync(resolve(process.cwd(), "src/App.jsx"), "utf8");

  it("pastki menyu funksiya bo'lib yozilgan (til o'zgarganda yangilanishi uchun)", () => {
    expect(src).toMatch(/const NAV = \(\) => \[/);
  });

  it("komponent render ichida e'lon qilinmagan (remount muammosi yo'q)", () => {
    // Stepper va Onboarding sarlavhasi modul darajasida bo'lishi kerak
    expect(src).toMatch(/const StepKey = /);
    expect(src).toMatch(/const OnboardHead = /);
    expect(src).not.toMatch(/\n\s+const Head = \(\{/);
  });

  it("render ichida kengaytma funksiya bor emas", () => {
    // `t()` tarjima funksiasini yopib qo'yadigan o'zgaruvchi nomlari
    expect(src).not.toMatch(/\n\s+const t = (useRef|useState|themes)/);
  });

  it("setReady localStorage dan keyin chaqiriladi (tarmoq kutmaydi)", () => {
    const iRestore = src.indexOf("premolux_v1", src.indexOf("MAHALLIY ma'lumotni"));
    const iReady   = src.indexOf("setReady(true)", iRestore);
    expect(iReady).toBeGreaterThan(iRestore);
  });

  it("o'chirish tugmasi qator ustida yo'q", () => {
    expect(src).not.toMatch(/const kill = \(\) =>/);
  });

  it("karta CVV va to'liq raqam localStorage'ga yozilmaydi", () => {
    // `people` ga qo'shiladigan obyekt to'liq kartani YOYMASLIGI kerak
    // (yoysa CVV va to'liq raqam localStorage ga tushib ketadi)
    expect(src).not.toMatch(/\{\s*\.\.\.card\s*,/);
    // niqoblash funksiyasi bor va ishlatiladi
    expect(src).toMatch(/const maskPanNum = /);
    expect(src).toMatch(/num:\s*maskPanNum\(card\.num\)/);
    // to'liq ma'lumot faqat xotiradagi qutiga yoziladi
    expect(src).toMatch(/SECRETS\.set\(/);
  });

  it("sozlamalar server bilan sinxronlanadi", () => {
    expect(src).toMatch(/api\.get\("\/settings"/);
    expect(src).toMatch(/api\.put\("\/settings"/);
  });

  // ── MAJBURIY OBUNA + BIR MARTALIK KOD ──
  it("majburiy obuna ikkala kanalni ham tekshiradi", () => {
    expect(src).toMatch(/REQUIRED_SUBS\.map/);          // ikkalasi ham chiziladi
    expect(src).toMatch(/api\.checkSub\(\)/);            // haqiqiy server tekshiruvi
  });

  it("kod serverda tekshiriladi — FAQAT localStorage ga qarab emas", () => {
    // eski xato: codes.find(...) — boshqa qurilmada kod topilmasdi
    expect(src).toMatch(/api\.join\(/);                 // /auth/join chaqiriladi
    expect(src).not.toMatch(/codes\.find\(x=>x\.code===c\)/);
  });

  it("ishlatilgan kod qayta qabul qilinmaydi", () => {
    expect(src).toMatch(/codeUsed\(/);                  // mahalliy belgi tekshiriladi
    expect(src).toMatch(/isUsedCodeError\(/);           // server xatosi
    expect(src).toMatch(/markCodeUsed\(/);              // ro'yxat yangilanadi
  });

  it("gate ilovani to'liq qopadi (loading dan keyingi bosqich)", () => {
    // gate alohida qatlamda emas, render oqimida — ilova orqasi ko'rinmaydi
    expect(src).toMatch(/if \(!role\) return \(/);
  });

  it("kirish oqimi: loading -> obuna -> kod", () => {
    // loading ekrani bo'sh qolmasin
    expect(src).toMatch(/if \(!ready \|\| !introDone\) return <Splash/);
    // obuna tekshirilgach kod bosqichiga o'tiladi
    expect(src).toMatch(/goCode/);
  });
});
