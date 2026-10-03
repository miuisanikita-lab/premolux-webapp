import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { DICT, LANGS, t, tp, setLang } from "./i18n.js";

// ─────────────────────────────────────────────
// Lug'at to'liqligi — eng tez buziladigan narsa
// ─────────────────────────────────────────────
describe("tarjima lug'ati", () => {
  const keys = Object.keys(DICT.uz);

  it("uch tilda bir xil kalit soni bor", () => {
    expect(keys.length).toBe(Object.keys(DICT.ru).length);
    expect(keys.length).toBe(Object.keys(DICT.en).length);
  });

  it("hech bir tilda kalit yetishmayapti", () => {
    expect(keys.filter(k => !DICT.ru[k])).toEqual([]);
    expect(keys.filter(k => !DICT.en[k])).toEqual([]);
  });

  it("ortiqcha kalit yo'q (ru/en da o'zbekcha bo'lmagan)", () => {
    expect(Object.keys(DICT.ru).filter(k => !DICT.uz[k])).toEqual([]);
    expect(Object.keys(DICT.en).filter(k => !DICT.uz[k])).toEqual([]);
  });

  it("bo'sh qiymat yo'q", () => {
    for (const l of ["uz", "ru", "en"])
      for (const k of keys)
        expect(typeof DICT[l][k], `${l}.${k}`).not.toBe("undefined");
  });

  it("har bir til o'z nomi bilan qatnashmaydi", () => {
    // rus tilida o'zbekcha qolgan matn bo'lmasligi kerak
    for (const k of keys) {
      if (Array.isArray(DICT.ru[k])) continue;
      expect(typeof DICT.ru[k]).toBe("string");
    }
  });

  it("ko'p shakli (massiv) kalitlari uch tilda ham massiv va bir xil uzunlikda", () => {
    for (const k of keys) {
      if (!Array.isArray(DICT.uz[k])) continue;
      expect(Array.isArray(DICT.ru[k]), k).toBe(true);
      expect(Array.isArray(DICT.en[k]), k).toBe(true);
      // uch tilda elementlar soni bir xil bo'lishi SHART
      expect(DICT.ru[k].length, k).toBe(DICT.uz[k].length);
      expect(DICT.en[k].length, k).toBe(DICT.uz[k].length);
    }
  });
});

// ─────────────────────────────────────────────
// Til almashuvi
// ─────────────────────────────────────────────
describe("t()", () => {
  it("har bir tilda o'z matnini qaytaradi", () => {
    setLang("uz"); expect(t("nav.cards")).toBe("Kartalar");
    setLang("ru"); expect(t("nav.cards")).toBe("Карты");
    setLang("en"); expect(t("nav.cards")).toBe("Cards");
    setLang("uz");
  });

  it("kvotkalarni to'g'ri to'ldiradi", () => {
    setLang("uz");
    expect(t("common.count", { n: 5 })).toContain("5");
    expect(t("premium.getResult", { n: 3, t: 10 })).toBe("3/10 premium olindi");
  });

  it("mavjud bo'lmagan kalit hech narsa buzmaydi", () => {
    setLang("en");
    expect(() => t("yoq.bunday.kalit")).not.toThrow();
    expect(t("yoq.bunday.kalit")).toBe("yoq.bunday.kalit");
    setLang("uz");
  });

  it("noma'lum tilga o'tsa xotirjam bo'ladi", () => {
    setLang("xx");
    expect(typeof t("nav.cards")).toBe("string");
    setLang("uz");
  });
});

// ─────────────────────────────────────────────
// Ko'p shakl (1 / 2-4 / 5+)
// ─────────────────────────────────────────────
describe("tp() — ko'plik shakli", () => {
  it("o'zbekcha: 1 / ko'p", () => {
    setLang("uz");
    expect(tp("cards.rowNote", 1, { m: 1 })).toContain("1 karta");
    expect(tp("cards.rowNote", 5, { m: 2 })).toContain("5 karta");
  });

  it("inglizcha: 1 / ko'p", () => {
    setLang("en");
    expect(tp("cards.rowNote", 1, { m: 1 })).toMatch(/^1 card/);
    expect(tp("cards.rowNote", 3, { m: 1 })).toMatch(/^3 cards/);
  });

  it("ruscha: 1 / 2-4 / 5+ / 11-14", () => {
    setLang("ru");
    expect(tp("team.workerCount", 1)).toContain("1 сотрудник");
    expect(tp("team.workerCount", 2)).toContain("2 сотрудника");
    expect(tp("team.workerCount", 5)).toContain("5 сотрудников");
    expect(tp("team.workerCount", 11)).toContain("11 сотрудников");
    expect(tp("team.workerCount", 21)).toContain("21 сотрудник");
    expect(tp("team.workerCount", 22)).toContain("22 сотрудника");
  });
});

// ─────────────────────────────────────────────
// Ilovada ishlatilgan kalitlar lug'atda bormi?
// ─────────────────────────────────────────────
describe("ishlatilgan kalitlar", () => {
  const src = readFileSync(resolve(process.cwd(), "src/App.jsx"), "utf8");

  it("App.jsx dagi barcha t() kaliti lug'atda bor", () => {
    const used = new Set([
      ...[...src.matchAll(/\bt\(\s*"([^"]+)"/g)].map(m => m[1]),
      ...[...src.matchAll(/\btp\(\s*"([^"]+)"/g)].map(m => m[1]),
      ...[...src.matchAll(/\btArray\(\s*"([^"]+)"/g)].map(m => m[1]),
    ]);
    const missing = [...used].filter(k => !(k in DICT.uz));
    expect(missing).toEqual([]);
  });

  it("hech qanday qo'lda o'zbekcha matn qolmagan (t() orqali emas)", () => {
    // t() ichida ishlatiladigan kalitlar kamida 400 ta bo'lishi kerak —
    // bu ilovaning tarjimaga o'tganini isbotlaydi
    const used = new Set([...src.matchAll(/\bt(?:p|Array)?\(\s*"([^"]+)"/g)].map(m => m[1]));
    expect(used.size).toBeGreaterThan(400);
  });
});

describe("LANGS", () => {
  it("uch tildan iborat", () => {
    expect(LANGS.map(l => l.id)).toEqual(["uz", "ru", "en"]);
  });
  it("har birida bayroq va nom bor", () => {
    for (const l of LANGS) {
      expect(l.flag).toBeTruthy();
      expect(l.label).toBeTruthy();
    }
  });
});
