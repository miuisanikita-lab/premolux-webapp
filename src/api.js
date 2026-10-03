// ═════════════════════════════════════════════════════════════
// API QATLAMI — server bilan muloqot
// ═════════════════════════════════════════════════════════════
// Backend: miuisanikita-lab/premolux (FastAPI).
//
// Server manzilini o'zgartirish uchun FAQAT shu faylni tahrirlang —
// ilovaning boshqa hech qayerida URL yo'q.
//
// Endpoint'lar (backend bilan mos):
//   POST /auth/verify            · POST /auth/join
//   POST /auth/send-code         · /verify-code · /verify-2fa
//   GET  /people                  · POST /people
//   POST /people/{id}/cards      · DELETE /people/{id}
//   GET  /cards/{id}/secret      · DELETE /cards/{id}
//   GET  /settings                · PUT /settings
//   POST /orders/start            · GET /orders/{id}
//   GET  /bots                    · POST /bots/connect
//   POST /access/connect          · /status · /disconnect
//   POST /relay/register          · /sms · GET /relay/status
//   WS   /ws/orders/{id}?token=<initData>

import { logErr } from "./logger";

export const API_BASE = "https://premolux-beckend.onrender.com";
// WebSocket manzili (backend /ws/orders/{id} endi token talab qiladi)
export const WS_BASE = API_BASE.replace(/^http/, "ws");
export const MOCK = false;                // backend ulandi

export class ApiError extends Error {
  constructor(status, code, message) {
    super(message || code || t("err.title"));
    this.status = status; this.code = code;
  }
}

// Telegram initData — har so'rovga qo'shiladi, server shu bilan foydalanuvchini tekshiradi
export const authHeader = () => {
  try {
    const raw = window.Telegram?.WebApp?.initData;
    return raw ? { "Authorization": `tma ${raw}` } : {};
  } catch { return {}; }
};

// ── mock javob generatori — backend bo'lmasa shu ishlaydi ──
const mockNet = async (path, body) => {
  const lag = 260 + Math.random()*420;
  await new Promise(r=>setTimeout(r, lag));
  if (Math.random() < 0.025) throw new ApiError(0, "NETWORK", "Tarmoqqa ulanib bo'lmadi");

  // hozircha hamma mock so'rov "muvaffaqiyatli" deb qaytadi —
  // haqiqiy holat baribir mahalliy state orqali boshqariladi
  return { ok:true, path, body, mock:true };
};

export const request = async (path, { method="GET", body, timeout=25000 } = {}) => {
  if (MOCK) return mockNet(path, body);

  const ctrl = new AbortController();
  const t = setTimeout(()=>ctrl.abort(), timeout);
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: { "Content-Type":"application/json", ...authHeader() },
      body: body ? JSON.stringify(body) : undefined,
      signal: ctrl.signal,
    });
    clearTimeout(t);

    let data = null;
    try { data = await res.json(); } catch (e) { logErr("clipboard/parse", e); }

    if (!res.ok) {
      const err = new ApiError(res.status, data?.code, data?.message || `Server xatosi (${res.status})`);
      // backend detail obyektini saqlab qolamiz (masalan sub_required uchun missing[])
      if (data && typeof data === "object") {
        err.detail = data;
        if (Array.isArray(data.missing)) err.missing = data.missing;
      }
      throw err;
    }
    return data;
  } catch (e) {
    clearTimeout(t);
    if (e.name === "AbortError") throw new ApiError(0, "TIMEOUT", t("err.timeout"));
    if (e instanceof ApiError) throw e;
    throw new ApiError(0, "NETWORK", "Tarmoqqa ulanib bo'lmadi");
  }
};

export const api = {
  get:  (p)      => request(p),
  post: (p, b)   => request(p, { method:"POST",  body:b }),
  put:  (p, b)   => request(p, { method:"PUT",   body:b }),
  del:  (p)      => request(p, { method:"DELETE" }),
  // Majburiy obuna tekshiruvi — backend Telegram'da
  // foydalanuvchi kanal/guruhga a'zoligini tekshiradi.
  // 428 + sub_required — hali a'zo emas (missing[] ro'yxati)
  checkSub: async () => {
    try {
      await request("/auth/check-sub", { method:"POST", body:{} });
      return { ok: true, missing: [] };
    } catch (e) {
      if (e.status === 428 && e.code === "sub_required") {
        // ApiError xabari — backend detail.code ni qo'llab-quvvatlash uchun
        const missing = e.missing || [];
        return { ok: false, missing };
      }
      throw e;
    }
  },
};

// ═════════════════════════════════════════════════════════════
// HAPTIK JAVOB
// ═════════════════════════════════════════════════════════════

let HAPTIC_ON = true;
export const setHaptic = v => { HAPTIC_ON = v; };

export const hap = (() => {
  const H = () => window.Telegram?.WebApp?.HapticFeedback;
  const safe = fn => { if (!HAPTIC_ON) return; try { fn(); } catch (e) { logErr("haptics", e); } };
  return {
    tap:    () => safe(()=>H()?.impactOccurred("light")),
    press:  () => safe(()=>H()?.impactOccurred("medium")),
    heavy:  () => safe(()=>H()?.impactOccurred("heavy")),
    soft:   () => safe(()=>H()?.impactOccurred("soft")),
    ok:     () => safe(()=>H()?.notificationOccurred("success")),
    warn:   () => safe(()=>H()?.notificationOccurred("warning")),
    err:    () => safe(()=>H()?.notificationOccurred("error")),
    select: () => safe(()=>H()?.selectionChanged()),
  };
})();
