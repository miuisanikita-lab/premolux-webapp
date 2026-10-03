// ═════════════════════════════════════════════════════════════
// XATO KUZATUVCHI (logger)
// ═════════════════════════════════════════════════════════════
// Avval ilovada 20 ta `catch {}` bor edi — xatolar jimgina
// yo'qolardi. Telegram ichida muammo chiqsa, sabahini topish
// umuman mumkin emas bo'lardi (konsolga ham chiqmasdi).
//
// Endi har bir xato bitta markaziy funksiyadan o'tadi:
//   · konsolga yoziladi
//   · oxirgi 30 ta xato xotirada saqlanadi
//   · xato ekrani (ErrorBoundary) shularni ko'rsatadi
//   · "Texnik ma'lumot" ochilganda shu ro'yxat chiqadi

const LOG_LIMIT = 30;

export const errorLog = {
  items: [],
  push(entry) {
    this.items.unshift({
      at: new Date().toISOString(),
      where: entry.where,
      msg: entry.msg,
      kind: entry.kind || "error",
    });
    if (this.items.length > LOG_LIMIT) this.items.length = LOG_LIMIT;
    try {
      localStorage.setItem("premolux_errors",
        JSON.stringify(this.items.slice(0, LOG_LIMIT)));
    } catch {}
  },
  load() {
    try {
      const raw = localStorage.getItem("premolux_errors");
      this.items = raw ? (JSON.parse(raw) || []) : [];
    } catch { this.items = []; }
    return this.items;
  },
  clear() {
    this.items = [];
    try { localStorage.removeItem("premolux_errors"); } catch {}
  },
};

/** Xatoni ushlashtiradi va konsolga yozadi. Ishlashni to'xtatmaydi. */
export const logErr = (where, e) => {
  const msg = e instanceof Error ? e.message : (typeof e === "string" ? e : JSON.stringify(e));
  errorLog.push({ where, msg });
  if (typeof console !== "undefined") console.warn(`[PremoLux:${where}]`, e);
  return null;
};

/**
 * Xatoni ushlashtirib, ilovani buzmaydi — "uzrli" yo'l uchun.
 * Misol: localStorage yopiq bo'lsa, bo'sh qiymat qaytaradi.
 */
export const tryOr = (where, fn, fallback = undefined) => {
  try { return fn(); }
  catch (e) { logErr(where, e); return fallback; }
};

if (typeof window !== "undefined") {
  errorLog.load();
  // Telegram ichida konsol yo'q — bu hodisalar ilova ichida qamrab olinadi
  window.addEventListener("error", e => errorLog.push({
    where: "window.error", msg: e.message || String(e.error || ""),
  }));
  window.addEventListener("unhandledrejection", e => errorLog.push({
    where: "promise", msg: String(e.reason?.message || e.reason || ""),
  }));
}
