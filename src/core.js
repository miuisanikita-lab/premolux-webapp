// ═════════════════════════════════════════════════════════════
// SOF MANTIQ — komponentlarsiz, testlanadigan yordamchilar
// ═════════════════════════════════════════════════════════════
// Bu faylda joylashgan funksiyalar hech qanday React yoki
// brauzer API'siga bog'liq emas — shuning uchun ularni to'g'ridan
// test qilish mumkin. (Ilova qog'ozi 6400+ qator, testlash
// imkonini yo'qotmasligi uchun mantiq shu yerda ajratilgan.)

/** 1234567 -> "1 234 567" (ru-RU formatida) */
export const som = (n) => (n || 0).toLocaleString("ru-RU");

/** "8600 1234 5678 9011" -> "9011" */
export const last4 = (num) => (num || "").replace(/\s/g, "").slice(-4);

/** Sana -> "2026-10-03" */
export const dayKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** Tarix massivining oxirgi k elementi */
export const last = (arr, k) => (arr || []).slice(-k);

/** Bir kunlik kalit bo'yicha o'sish (bugungi kun uchun yangi yozuv) */
export const bumpDay = (hist, n = 1) => {
  const k = dayKey();
  const l = [...(hist || [])];
  const i = l.findIndex(x => x.d === k);
  if (i === -1) l.push({ d: k, n, h: new Array(24).fill(0) });
  else l[i] = { ...l[i], n: (l[i].n || 0) + n };
  return l;
};

/** Sozlanadigan karta limiti (bitta kartadan nechta premium) */
export const DEFAULT_CARD_CAP = 3;

/**
 * Karta holati.
 *  fresh   — hali ishlatilmagan
 *  active  — ishlatilgan, limiti va muddati qolyapti
 *  soon    — muddati yaqin (75 kundan kam)
 *  limit   — limiti tugagan
 *  expired — muddati tugagan
 */
export const cardHealth = (c, now = new Date()) => {
  const card = c || {};
  const cap = card.limit || DEFAULT_CARD_CAP;
  const used = Math.min(cap, card.used || 0);
  const left = cap - used;

  let expired = false, soon = false;
  const m = /^(\d{2})\/(\d{2})$/.exec(card.exp || "");
  if (m) {
    const mm = +m[1], yy = 2000 + +m[2];
    // oyning OXIRGI kuni (masalan 09/28 -> 28-sentabr 23:59)
    const end = new Date(yy, mm, 0, 23, 59, 59);
    expired = end < now;
    soon = !expired && end - now < 1000 * 60 * 60 * 24 * 75;
  }

  const state = expired ? "expired"
              : left <= 0 ? "limit"
              : soon ? "soon"
              : used === 0 ? "fresh"
              : "active";

  return { cap, used, left, state, expired, soon };
};

/** "•••• 9011" yoki "9011" — ro'yxatda ko'rsatish uchun */
export const maskTail = (num) => `•••• ${last4(num) || "????"}`;

/** Xotiradagi maxfiy qiymatni to'liq ko'rsatish kerakmi? */
export const isMasked = (v) => /[•*]/.test(v || "") || /\*{2,}/.test(v || "");

// ── zaxira nusxa (backup / restore) ──────────────────────────
export const BACKUP_VERSION = 1;

/** Eksport: saqlanadigan ma'lumotni tayyorlaydi */
export const makeBackup = ({ people = [], bots = [], cfg = {}, role, lang, themeId }) => ({
  v: BACKUP_VERSION,
  app: "PremoLux",
  at: new Date().toISOString(),
  people, bots, cfg, role, lang, themeId,
});

/**
 * Import: zaxira faylini tekshiradi va tozalaydi.
 * Noto'g'ri yoki eskirgan faylda xato qaytaradi — ilova buzilmaydi.
 */
export const readBackup = (raw) => {
  let d;
  try { d = typeof raw === "string" ? JSON.parse(raw) : raw; }
  catch { return { ok: false, error: "PARSE" }; }
  if (!d || typeof d !== "object") return { ok: false, error: "SHAPE" };
  if (d.v !== BACKUP_VERSION) return { ok: false, error: "VERSION" };
  if (!Array.isArray(d.people) || !Array.isArray(d.bots))
    return { ok: false, error: "SHAPE" };
  return {
    ok: true,
    data: {
      v: d.v, at: d.at,
      people: d.people.filter(p => p && p.id && Array.isArray(p.cards)),
      bots: d.bots.filter(b => b && b.id),
      cfg: (d.cfg && typeof d.cfg === "object") ? d.cfg : {},
      role: d.role || "owner",
      lang: d.lang, themeId: d.themeId,
    },
  };
};
