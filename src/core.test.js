import { describe, it, expect } from "vitest";
import {
  som, last4, dayKey, last, bumpDay,
  cardHealth, DEFAULT_CARD_CAP, maskTail, isMasked,
  makeBackup, readBackup, BACKUP_VERSION,
  normCode, fmtCode, codeUsed, isUsedCodeError, isBadCodeError,
  readJoinResult, markCodeUsed, CODE_MIN,
} from "./core.js";

// ─────────────────────────────────────────────
// Karta holati — eng ko'p ishlatiladigan mantiq
// ─────────────────────────────────────────────
describe("cardHealth", () => {
  const now = new Date(2026, 9, 3);            // 2026-10-03
  // ESDA: muddat "OM/YY" shaklida — YY 2 xonali yil (28 = 2028)
  const far  = "12/29";                          // 2029-yil dekabr — uzoq
  const near = "11/26";                          // 2026-yil noyabr — ~2 oy

  it("ishlatilmagan karta 'fresh' bo'ladi", () => {
    const h = cardHealth({ used: 0, exp: far }, now);
    expect(h.state).toBe("fresh");
    expect(h.left).toBe(DEFAULT_CARD_CAP);
  });

  it("ishlatilgan karta 'active' bo'ladi", () => {
    const h = cardHealth({ used: 1, limit: 3, exp: far }, now);
    expect(h.state).toBe("active");
    expect(h.left).toBe(2);
  });

  it("limit to'lganda 'limit' bo'ladi", () => {
    expect(cardHealth({ used: 3, limit: 3, exp: far }, now).state).toBe("limit");
    expect(cardHealth({ used: 5, limit: 3, exp: far }, now).left).toBe(0);
  });

  it("muddati o'tgan karta 'expired' bo'ladi", () => {
    expect(cardHealth({ used: 1, limit: 3, exp: "01/20" }, now).state).toBe("expired");
  });

  it("muddat tugagan bo'lsa limitdan ustun turadi", () => {
    // ikkalasi ham to'g'ri bo'lsa — muddat birinchi
    expect(cardHealth({ used: 3, limit: 3, exp: "01/20" }, now).state).toBe("expired");
  });

  it("muddat yaqin bo'lsa 'soon' bo'ladi", () => {
    expect(cardHealth({ used: 1, limit: 3, exp: near }, now).state).toBe("soon");
  });

  it("karta oy oxirigacha amal qiladi", () => {
    // "01/27" = 2027-yil yanvar — karta YANVAR OXIRGUNCHA ishlatiladi
    // (majburiy emas: 27-yanvar emas, 31-yanvar ham emas)
    const jan27 = cardHealth({ used:1, limit:3, exp:"01/27" }, new Date(2027, 0, 31, 12));
    expect(jan27.expired).toBe(false);          // 31-yanvar oxirigacha
    const feb01 = cardHealth({ used:1, limit:3, exp:"01/27" }, new Date(2027, 1, 1, 12));
    expect(feb01.expired).toBe(true);           // 1-fevraldan boshlab tugagan
  });

  it("2 xonali yil 2000+YY deb o'qiladi", () => {
    // "11/28" = 2028-yil noyabr — 2026 emas!
    const h = cardHealth({ used: 1, limit: 3, exp: "11/28" }, new Date(2026, 9, 3));
    expect(h.expired).toBe(false);
    expect(h.state).toBe("active");   // juda uzoq
  });

  it("limit kiritilmasa standart qo'llaniladi", () => {
    expect(cardHealth({ used: 2 }, now).cap).toBe(DEFAULT_CARD_CAP);
  });

  it("noto'g'ri ma'lumot bilan yiqilmaydi", () => {
    expect(() => cardHealth(undefined, now)).not.toThrow();
    expect(() => cardHealth({}, now)).not.toThrow();
    expect(() => cardHealth({ exp: "not-a-date" }, now)).not.toThrow();
  });

  it("ishlatilgan son limitdan oshsa ham chegaradan oshmaydi", () => {
    expect(cardHealth({ used: 99, limit: 3 }, now).used).toBe(3);
  });
});

// ─────────────────────────────────────────────
// Sana yordamchilari
// ─────────────────────────────────────────────
describe("dayKey", () => {
  it("to'g'ri formatda qaytaradi", () => {
    expect(dayKey(new Date(2026, 0, 5))).toBe("2026-01-05");
  });

  it("oy va kun ikki xonali", () => {
    expect(dayKey(new Date(2026, 11, 25))).toBe("2026-12-25");
  });
});

describe("bumpDay", () => {
  it("bugungi kuni oshiradi", () => {
    const k = dayKey();
    const h = bumpDay([], 2);
    expect(h).toHaveLength(1);
    expect(h[0].d).toBe(k);
    expect(h[0].n).toBe(2);
    expect(h[0].h).toHaveLength(24);
  });

  it("mavjud kunni oshiradi (yangi yozuv qo'shmaydi)", () => {
    const k = dayKey();
    const h1 = bumpDay([], 1);
    const h2 = bumpDay(h1, 1);
    expect(h2).toHaveLength(1);
    expect(h2[0].n).toBe(2);
  });

  it("undefined bilan ishlaydi", () => {
    expect(() => bumpDay(undefined, 1)).not.toThrow();
    expect(bumpDay(undefined, 1)[0].n).toBe(1);
  });
});

describe("last", () => {
  it("oxirgi k elementni qaytaradi", () => {
    expect(last([1, 2, 3, 4, 5], 2)).toEqual([4, 5]);
  });
  it("massiv qisqa bo'lsa butunlay qaytaradi", () => {
    expect(last([1], 5)).toEqual([1]);
  });
  it("undefined bilan ishlaydi", () => {
    expect(last(undefined, 3)).toEqual([]);
  });
});

// ─────────────────────────────────────────────
// Matn va niqoblash
// ─────────────────────────────────────────────
describe("matn yordamchilari", () => {
  it("raqamni guruhlaydi", () => {
    // ru-RU formatida "oddiy" bo'shliq emas, ingilizcha keng
    // (narrow no-break) bo'shliq ishlatiladi — shuning uchun
    // testda uni oddiygacha keltiramiz
    const norm = v => v.replace(/\u202f|\u00a0/g, " ");
    expect(norm(som(1234567))).toBe("1 234 567");
    expect(som(0)).toBe("0");
    expect(som()).toBe("0");
  });

  it("oxirgi 4 ta raqamni qaytaradi", () => {
    expect(last4("8600 1234 5678 9011")).toBe("9011");
    expect(last4("9011")).toBe("9011");
    expect(last4("")).toBe("");
    expect(last4(undefined)).toBe("");
  });

  it("niqoblangan qiymatni aniqlaydi", () => {
    expect(isMasked("•••• 9011")).toBe(true);
    expect(isMasked("8600 **** **** 9011")).toBe(true);
    expect(isMasked("8600123456789011")).toBe(false);
    expect(isMasked("")).toBe(false);
  });

  it("ro'yxat uchun niqoblangan ko'rinish", () => {
    expect(maskTail("8600 1234 5678 9011")).toBe("•••• 9011");
    expect(maskTail("")).toBe("•••• ????");
  });
});

// ─────────────────────────────────────────────
// Zaxira nusxasi
// ─────────────────────────────────────────────
describe("zaxira nusxasi", () => {
  const data = {
    people: [{ id: "p1", name: "Alisher", cards: [{ id: "c1", num: "8600123456789011" }] }],
    bots: [{ id: 1, username: "@bot", connected: true }],
    cfg: { streams: 8 },
    role: "owner", lang: "uz", themeId: "amoled",
  };

  it("eksport qiladi", () => {
    const b = makeBackup(data);
    expect(b.v).toBe(BACKUP_VERSION);
    expect(b.people).toHaveLength(1);
    expect(b.bots).toHaveLength(1);
    expect(b.cfg.streams).toBe(8);
  });

  it("eksport -> import aylanmasi ma'lumotni yo'qotmaydi", () => {
    const round = readBackup(JSON.stringify(makeBackup(data)));
    expect(round.ok).toBe(true);
    expect(round.data.people).toHaveLength(1);
    expect(round.data.people[0].name).toBe("Alisher");
    expect(round.data.bots[0].username).toBe("@bot");
    expect(round.data.lang).toBe("uz");
  });

  it("buzilgan JSON ni qabul qilmaydi", () => {
    expect(readBackup("{buzilgan").ok).toBe(false);
    expect(readBackup("{buzilgan").error).toBe("PARSE");
  });

  it("noto'g'ri shaklni qabul qilmaydi", () => {
    expect(readBackup("null").ok).toBe(false);
    expect(readBackup('{"v":1}').error).toBe("SHAPE");
    expect(readBackup('{"v":1,"people":[],"bots":[]}').ok).toBe(true);
  });

  it("eski versiya faylini rad etadi", () => {
    expect(readBackup('{"v":0,"people":[],"bots":[]}').error).toBe("VERSION");
  });

  it("cards maydonsi yo\'q shaxslarni tozalaydi", () => {
    const r = readBackup('{"v":1,"people":[{"id":"p1"},{"id":"p2","cards":[]}],"bots":[]}');
    expect(r.ok).toBe(true);
    expect(r.data.people).toHaveLength(1);
    expect(r.data.people[0].id).toBe("p2");
  });
});

// ─────────────────────────────────────────────
// BIR MARTALIK TAKLIF KODI
// Kiritish oqimi: 1) obuna tekshiruvi 2) kod — bir marta ishlatiladi
// ─────────────────────────────────────────────
describe("taklif kodi — bir martalik", () => {
  const CODE = "PLXAB12CD34EF56";

  it("normCode registr va bo'shliqni yo'qotadi", () => {
    expect(normCode("plx-ab12 cd34 ef56")).toBe(CODE);
    expect(normCode(" PLXAB12CD34EF56 ")).toBe(CODE);
    expect(normCode(null)).toBe("");
  });

  it("fmtCode har 4 belgidan keyin chiziqcha qo'yadi", () => {
    expect(fmtCode("plxab12cd34ef56")).toBe("PLX-AB12-CD34-EF56");
    // "PLX" allaqachon yozilgan bo'lsa, takrorlanmaydi
    expect(fmtCode("PLX-AB12-CD34-EF56")).toBe("PLX-AB12-CD34-EF56");
  });

  it("fmtCode ishchi prefiksini (PLW) SAQLAYDI", () => {
    // AVVAL bu yerda xato bor edi: har doim "PLX" qo'yilardi, ya'ni
    // PLW bilan boshlangan ishchi kodi kiritilganda BUZILARDI va
    // hech qachon topilmasdi.
    expect(fmtCode("plwab12cd34ef56")).toBe("PLW-AB12-CD34-EF56");
    expect(fmtCode("PLW-AB12-CD34-EF56")).toBe("PLW-AB12-CD34-EF56");
    // prefiks bo'lmasa — standart PLX
    expect(fmtCode("ab12cd34ef56")).toBe("PLX-AB12-CD34-EF56");
  });

  it("PLW va PLX kodlari bir-biriga aralashmaydi", () => {
    // backend PLW=ishchi, PLX=hamkor deb saqlaydi
    expect(normCode(fmtCode("PLWAB12CD34EF56"))).toBe("PLWAB12CD34EF56");
    expect(normCode(fmtCode("PLXAB12CD34EF56"))).toBe("PLXAB12CD34EF56");
  });

  it("codeUsed eski (0) va yangi (true) shaklni ikkalasini ham ushlaydi", () => {
    expect(codeUsed({ used: 0 })).toBe(false);
    expect(codeUsed({ used: 1 })).toBe(true);
    expect(codeUsed({ used: true })).toBe(true);
    expect(codeUsed({})).toBe(false);
    expect(codeUsed(null)).toBe(false);
  });

  it("ishlatilgan kod xatosi to'g'ri aniqlanadi", () => {
    expect(isUsedCodeError({ status: 400, message: "Kod allaqal ishlatilgan" })).toBe(true);
    expect(isUsedCodeError({ status: 409, message: "already used" })).toBe(true);
    // noto'g'ri kod "ishlatilgan" deb hisoblanmasin
    expect(isUsedCodeError({ status: 404, message: "topilmadi" })).toBe(false);
  });

  it("noto'g'ri kod xatosi to'g'ri aniqlanadi", () => {
    expect(isBadCodeError({ status: 404, message: "Kod topilmadi" })).toBe(true);
    expect(isBadCodeError({ status: 422, message: "invalid" })).toBe(true);
    // tarmoq xatosi "noto'g'ri kod" bo'lib ketmasin
    expect(isBadCodeError({ status: 0, code: "NETWORK" })).toBe(false);
  });

  it("server javobidan rol aniqlanadi", () => {
    // ishchi kodi — oddiy foydalanuvchi ishchi bo'lib kiradi
    expect(readJoinResult({ kind: "worker" }).role).toBe("worker");
    expect(readJoinResult({ role: "partner" }).role).toBe("partner");
    expect(readJoinResult({ kind: "owner" }).role).toBe("owner");
    // kind yo'q bo'lsa — xavfsizlik uchun ishchi
    expect(readJoinResult({}).role).toBe("worker");
  });

  it("server 'invite' ichida kodni qaytarsa ham rol olinadi", () => {
    const r = readJoinResult({ invite: { kind: "partner", by: "owner" } });
    expect(r.role).toBe("partner");
    expect(r.by).toBe("owner");
  });

  it("markCodeUsed faqat berilgan koding o'zini belgilaydi", () => {
    const list = [
      { code: "PLX-AAAA-BBBB-CCCC", kind: "worker" },
      { code: "PLX-DDDD-EEEE-FFFF", kind: "worker" },
    ];
    const out = markCodeUsed(list, "plx aaaa bbbb cccc", "Alisher");
    expect(out[0].used).toBe(true);
    expect(out[0].usedBy).toBe("Alisher");
    expect(out[1].used).toBeUndefined();          // ikkinchisi tegilmadi
  });

  it("markCodeUsed belgisiz ro'yxatni ham ko'taradi", () => {
    const out = markCodeUsed(undefined, "PLXAAAA", "Kim");
    expect(out).toEqual([]);
  });

  it("CODE_MIN qisqa bo'lmagan kod talab qiladi", () => {
    expect(CODE_MIN).toBeGreaterThanOrEqual(11);
    expect(normCode("PLXAB12CD34EF56").length).toBeGreaterThanOrEqual(CODE_MIN);
  });
});
