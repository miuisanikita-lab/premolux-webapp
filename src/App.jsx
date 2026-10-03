import { useState, useEffect, useRef, createContext, useContext, Component } from "react";
import { LANGS, t, tp, tArray, setLang as setLangGlobal, getLang } from "./i18n";
// sof mantiq — testlanadigan yordamchilar core.js da
import {
  som, last4, dayKey, last, bumpDay, cardHealth,
  DEFAULT_CARD_CAP, maskTail, isMasked, makeBackup, readBackup,
  normCode, fmtCode, codeUsed, isUsedCodeError, isBadCodeError,
  readJoinResult, markCodeUsed, CODE_MIN,
} from "./core";
// xatolarni yig'ish — avval 20 ta `catch {}` xatoni jimgina yo'qotardi
import { logErr, tryOr, errorLog } from "./logger";
import { themes, ThemeCtx, useTheme, Css, glass, CHANNEL, REQUIRED_SUBS } from "./theme.jsx";
import { API_BASE, WS_BASE, MOCK, ApiError, api, hap, setHaptic, authHeader } from "./api";

// ─────────────────────────────────────────────
// THEME SYSTEM
// ─────────────────────────────────────────────

// ═════════════════════════════════════════
// OCHILISH EKRANI (Splash)
// ═════════════════════════════════════════
// Avval bu yerda faqat pulsatsiya qiladigan QULF belgisi bor edi va u
// server javob berguncha (ba'zan 25 soniyaga qadar) ushlab turilardi —
// foydalanuvchi nima bo'layotganini bilmasdi. Endi:
//   • brend belgisi + ilova nomi + progress chizig'i
//   • eng ko'pi bilan 2.6 soniyada o'z-o'zidan o'tadi
const SPLASH_MIN = 2400;   // animatsiya kamida shuncha ko'rinib turadi
const SPLASH_FADE = 520;   // puflab o'chish davomiyligi
const Splash = ({ theme, done, stage = 0 }) => {
  const [pct, setPct] = useState(0);
  const [out, setOut] = useState(false);

  // progress haqiqiy o'tish tezligiga emas, balki vaqtga bog'liq —
  // shunda u silliq va "inson tomonidan boshqarilgandek" ko'rinadi
  useEffect(()=>{
    let raf = 0;
    const t0 = performance.now();
    const paint = now => {
      const raw = Math.min(1, (now - t0) / SPLASH_MIN);
      // easeOutCubic — boshida tez, oxirida sekin (sekinlashuv hissi)
      const e = 1 - Math.pow(1 - raw, 3);
      setPct(e * 88);
      if (raw < 1) raf = requestAnimationFrame(paint);
    };
    raf = requestAnimationFrame(paint);
    return ()=>cancelAnimationFrame(raf);
  }, []);

  useEffect(()=>{
    if (!done) return;
    setPct(100);
    const t = setTimeout(()=>setOut(true), SPLASH_FADE);
    return ()=>clearTimeout(t);
  }, [done]);

  // qaysi bosqichda turganimiz — haqiqiy holatdan
  const stageIx = Number.isFinite(stage) ? Math.max(0, Math.min(3, stage)) : 0;
  const status = [t("splash.s1"), t("splash.s2"), t("splash.s3"), t("splash.s4")][stageIx];

  return (
    <ThemeCtx.Provider value={theme}>
      <Css theme={theme}/>
      <div style={{
        position:"fixed", inset:0, display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"center", overflow:"hidden",
        background:theme.bgCss,
        opacity: out ? 0 : 1,
        transform: out ? "scale(1.025)" : "scale(1)",
        transition:`opacity ${SPLASH_FADE}ms cubic-bezier(.4,0,.2,1),
                    transform ${SPLASH_FADE}ms cubic-bezier(.4,0,.2,1)`,
      }}>
        {/* yumshoq yorug'lik dog'i — brend markazida */}
        <span style={{
          position:"absolute", top:"50%", left:"50%",
          width:360, height:360, margin:"-180px 0 0 -180px", borderRadius:"50%",
          background:`radial-gradient(circle, ${theme.acc}1f 0%, transparent 68%)`,
          filter:"blur(26px)", animation:"splashGlow 3.4s ease-in-out infinite",
        }}/>

        {/* ── belgi: chiziladigan yulduz ──
            Ilovadagi Sketch uslubi — chiziq o'zini chizadi. */}
        <span className="spBadge" style={{
          position:"relative", width:84, height:84, borderRadius:27,
          background:`linear-gradient(155deg, ${theme.acc}26, ${theme.acc}0d)`,
          border:`1px solid ${theme.accBd}`,
          display:"flex", alignItems:"center", justifyContent:"center",
          boxShadow:`0 14px 46px ${theme.acc}14, inset 0 1px 0 ${theme.acc}1a`,
        }}>
          <svg width="42" height="42" viewBox="0 0 42 42" fill="none">
            <path className="spDraw" style={{"--len":"168"}}
              d="M21 5.5c1.9 8.2 5.3 11.6 13.5 13.5-8.2 1.9-11.6 5.3-13.5 13.5C19.1 24.3 15.7 20.9 7.5 19 15.7 17.1 19.1 13.5 21 5.5Z"
              stroke={theme.acc} strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round"/>
          </svg>
        </span>

        {/* ── nom ── */}
        <div className="spName" style={{ position:"relative", textAlign:"center", marginTop:22 }}>
          <p style={{
            fontSize:26, fontWeight:800, letterSpacing:"-0.045em",
            color:theme.t1, lineHeight:1,
          }}>PremoLux</p>
        </div>

        {/* ── mikro-yorliq ── */}
        <p className="spTag" style={{
          position:"relative", marginTop:9, fontSize:9.5, fontWeight:600,
          letterSpacing:"0.2em", textTransform:"uppercase", color:theme.t4,
        }}>{t("splash.tag")}</p>

        {/* ── progress ── */}
        <span style={{ position:"relative", marginTop:34, width:168, height:4 }}>
          <span className="spTrack" style={{
            position:"absolute", inset:0, borderRadius:4,
            background:theme.s2, overflow:"hidden",
          }}>
            <span className="spBar" style={{
              position:"absolute", inset:0, width:`${pct}%`,
              borderRadius:4,
              background:`linear-gradient(90deg, ${theme.acc}, ${theme.acc}b3)`,
              overflow:"hidden",
            }}>
              {/* yug'urib boruvchi porlash */}
              <span className="spShine" style={{
                position:"absolute", top:0, bottom:0, width:"38%",
                background:`linear-gradient(90deg, transparent, ${theme.bg}99, transparent)`,
              }}/>
            </span>
          </span>
        </span>

        {/* ── holat qatori ── */}
        <p className="spStatus" key={stage} style={{
          position:"relative", marginTop:15, fontSize:11.5,
          color:theme.t3, display:"flex", alignItems:"center", gap:7,
          height:16,
        }}>
          {!done
            ? <><span className="spDot" style={{
                width:5, height:5, borderRadius:"50%",
                background:theme.acc, display:"inline-block",
              }}/>{status}</>
            : <><Ic.Check s={12} c={theme.acc}/>{status}</>}
        </p>
      </div>
    </ThemeCtx.Provider>
  );
};

// ═════════════════════════════════════════
// XATOLAR EKRANI (Error Boundary)
// ═════════════════════════════════════════
// Oldin ilovada ErrorBoundary yo'q edi: bitta komponent ishdan chiqsa
// (masalan backend noto'g'ri shakl qaytarsa) butun ilova oq ekran
// bo'lib qolardi — nima bo'lganini ko'rish ham, tuzatish ham mumkin
// bo'lmasdi. Endi har bir xato ushlanadi.

const CrashScreen = ({ err, stack }) => {
  const th = themes.amoled;   // DIQQAT: bu t emas — import qilingan t() ni yopib qo'ymaslik uchun
  const [log] = useState(() => errorLog.items.slice(0, 12));
  return (
    <div style={{
      position:"fixed", inset:0, zIndex:99999, background:th.bgCss, color:th.t1,
      display:"flex", alignItems:"center", justifyContent:"center", padding:24,
      fontFamily:"Inter, system-ui, -apple-system, sans-serif",
    }}>
      <div style={{ maxWidth:520, width:"100%" }}>
        <div style={{
          width:54, height:54, borderRadius:16, margin:"0 auto 18px",
          display:"flex", alignItems:"center", justifyContent:"center",
          background:th.err+"18", border:`1px solid ${th.err}35`, color:th.err,
        }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 9v4M12 17h.01"/>
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/>
          </svg>
        </div>

        <p style={{ textAlign:"center", fontSize:21, fontWeight:800, letterSpacing:"-0.03em" }}>
          {t("crash.title")}
        </p>
        <p style={{ textAlign:"center", fontSize:13.5, color:th.t3, marginTop:8, lineHeight:1.55 }}>
          {t("crash.note")}
        </p>

        <div style={{
          marginTop:20, padding:"13px 15px", borderRadius:14,
          background:th.s1, border:`1px solid ${th.b1}`,
          fontFamily:"'SF Mono',ui-monospace,monospace", fontSize:11.5, lineHeight:1.6,
          color:t.t2, wordBreak:"break-word", maxHeight:140, overflowY:"auto",
        }}>
          {String(err?.message || err)}
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:9, marginTop:18 }}>
          <button onClick={()=>location.reload()} style={{
            width:"100%", padding:"13px", borderRadius:13, cursor:"pointer",
            background:th.acc, color:th.accTxt, border:"none",
            fontFamily:"inherit", fontSize:13.5, fontWeight:700,
          }}>{t("crash.retry")}</button>

          <button onClick={CrashScreen.clear} style={{
            width:"100%", padding:"12px", borderRadius:13, cursor:"pointer",
            background:th.s1, color:t.t2, border:`1px solid ${th.b1}`,
            fontFamily:"inherit", fontSize:13, fontWeight:600,
          }}>{t("crash.reset")}</button>
        </div>

        <p style={{ textAlign:"center", fontSize:11, color:th.t4, marginTop:16, lineHeight:1.5 }}>
          {t("crash.resetNote")}
        </p>

        {stack && <details style={{ marginTop:14 }}>
          <summary style={{ cursor:"pointer", fontSize:11.5, color:th.t4, textAlign:"center" }}>
            {t("crash.details")}
          </summary>
          <pre style={{
            marginTop:9, padding:"11px", borderRadius:11, background:th.s1,
            border:`1px solid ${th.b1}`, fontSize:10, lineHeight:1.5, color:th.t3,
            overflowX:"auto", whiteSpace:"pre-wrap", maxHeight:200,
          }}>{stack}</pre>
        </details>}

        {/* yig'ilgan xatolar — Telegram ichida konsol ko'rinmaydi,
            shuning uchun ularni shu yerda ko'rsatamiz */}
        {log.length > 0 && (
          <details style={{ marginTop:10 }}>
            <summary style={{ cursor:"pointer", fontSize:11.5, color:th.t4, textAlign:"center" }}>
              {t("crash.history")} ({log.length})
            </summary>
            <div style={{
              marginTop:9, padding:"10px", borderRadius:11, background:th.s1,
              border:`1px solid ${th.b1}`, maxHeight:210, overflowY:"auto", textAlign:"left",
            }}>
              {log.map((e, i) => (
                <p key={i} style={{
                  fontSize:10.5, lineHeight:1.5, color:th.t3, marginBottom:6,
                  fontFamily:"'SF Mono',monospace",
                }}>
                  <span style={{ color:th.warn }}>{e.where}</span> — {e.msg}
                </p>
              ))}
            </div>
          </details>
        )}
      </div>
    </div>
  );
};
CrashScreen.clear = () => {
  try {
    localStorage.removeItem("premolux_v1");
    localStorage.removeItem("premolux_active_order");
  } catch (e) { logErr("crash/reset", e); }
  location.reload();
};

export class ErrorBoundary extends Component {
  constructor(p) { super(p); this.state = { err:null, stack:"" }; }

  static getDerivedStateFromError(err) {
    return { err, stack: (err?.stack || "").split("\n").slice(0,12).join("\n") };
  }

  componentDidCatch(err, info) {
    // Telegram'da konsol ko'rinmagani uchun logga yozamiz —
    // xato ekranida "Xatolar tarixi" ostida ko'rinadi
    errorLog.push({ where:"render", msg: err?.message || String(err), kind:"fatal" });
    if (this.setState) this.setState({ log: errorLog.items.slice(0, 12) });
    if (typeof console !== "undefined") console.error("[PremoLux]", err, info?.componentStack || "");
  }

  render() {
    if (!this.state.err) return this.props.children;
    return <CrashScreen err={this.state.err} stack={this.state.stack}/>;
  }
}


// barcha sahifalar uchun umumiy ma'lumot
const DataCtx = createContext(null);
const useData = () => useContext(DataCtx);

// ─────────────────────────────────────────────
// ICONS
// ─────────────────────────────────────────────
const Ic = {
  Bot:   ({s=18,c="currentColor"}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="8" width="18" height="13" rx="2.5"/><path d="M9 11v3M15 11v3M9.5 12.5h5"/><circle cx="12" cy="4.5" r="1.5"/><line x1="12" y1="6" x2="12" y2="8"/></svg>,
  Card:  ({s=18,c="currentColor"}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round"><rect x="2" y="5" width="20" height="14" rx="2.5"/><line x1="2" y1="10" x2="22" y2="10"/><line x1="6" y1="15" x2="10" y2="15"/></svg>,
  Lock:  ({s=15,c="currentColor"}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round"><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V6.5a4 4 0 018 0V10"/></svg>,
  Check: ({s=13,c="currentColor"}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>,
  X:     ({s=13,c="currentColor"}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>,
  Plus:  ({s=14,c="currentColor"}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>,
  Trash: ({s=14,c="currentColor"}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round"><path d="M3 6h18M8 6V4h8v2M5 6l1 13h12l1-13"/><path d="M10 10v5M14 10v5"/></svg>,
  Right: ({s=14,c="currentColor"}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>,
  Left:  ({s=14,c="currentColor"}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>,
  User:  ({s=16,c="currentColor"}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round"><circle cx="12" cy="7" r="4"/><path d="M4 20c0-3.9 3.6-7 8-7s8 3.1 8 7"/></svg>,
  Warn:  ({s=13,c="currentColor"}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 22h20L12 2z"/><path d="M12 9v5M12 17.5h.01"/></svg>,
  Sig:   ({s=13,c="currentColor"}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round"><path d="M2 20h2v-4H2zM9 20h2V12H9zM16 20h2V5l-2 1z"/></svg>,
  Sun:   ({s=15,c="currentColor"}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>,
  Moon:  ({s=15,c="currentColor"}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>,
  Globe: ({s=18,c="currentColor"}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18"/></svg>,
  Help:  ({s=18,c="currentColor"}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14v-2a8 8 0 0116 0v2"/><path d="M4 14h2a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1zM20 14h-2a1 1 0 00-1 1v3a1 1 0 001 1h1a1 1 0 001-1z"/><path d="M20 19a3 3 0 01-3 3h-3"/></svg>,
  Info:  ({s=18,c="currentColor"}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>,
  Theme: ({s=18,c="currentColor"}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 3v18"/><path d="M12 3a9 9 0 010 18" fill={c} stroke="none" opacity=".22"/></svg>,
  Copy:  ({s=15,c="currentColor"}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a1 1 0 01-1-1V4a1 1 0 011-1h10a1 1 0 011 1v1"/></svg>,
  Phone: ({s=17,c="currentColor"}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M6.5 3h3l1.5 4-2 1.5a12 12 0 006.5 6.5L17 13l4 1.5v3a2 2 0 01-2.2 2A17 17 0 013.5 5.2 2 2 0 015.5 3z"/></svg>,
  Send:  ({s=17,c="currentColor"}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M21 3L10.5 13.5M21 3l-6.5 18-4-8-8-4z"/></svg>,
  Dot:   ({s=16,c="currentColor",on=false}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6"><circle cx="12" cy="12" r="9"/>{on&&<circle cx="12" cy="12" r="4.5" fill={c} stroke="none"/>}</svg>,
  Chart: ({s=18,c="currentColor"}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M7 15l4-5 3.5 3L20 7"/></svg>,
  Trend: ({s=14,c="currentColor",down}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">{down?<><path d="M4 8l7 7 3-3 6 6"/><path d="M20 12v6h-6"/></>:<><path d="M4 16l7-7 3 3 6-6"/><path d="M20 12V6h-6"/></>}</svg>,
  Clock: ({s=18,c="currentColor"}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5.4l3.4 2"/></svg>,
  Team:  ({s=18,c="currentColor"}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round"><circle cx="9" cy="8" r="3.4"/><path d="M2.5 20c0-3.5 2.9-6 6.5-6s6.5 2.5 6.5 6"/><path d="M16.5 5.4a3.4 3.4 0 010 5.2M18 14.4c2.1.8 3.5 2.9 3.5 5.6"/></svg>,
  Snow:  ({s=14,c="currentColor"}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round"><path d="M12 3v18M4.2 7.5l15.6 9M19.8 7.5l-15.6 9"/><path d="M12 6.5L9.6 4.6M12 6.5l2.4-1.9M12 17.5l-2.4 1.9M12 17.5l2.4 1.9"/></svg>,
  Play:  ({s=14,c="currentColor"}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinejoin="round"><path d="M7 4.5l12 7.5-12 7.5z"/></svg>,
  Star:  ({s=14,c="currentColor"}) => <svg width={s} height={s} viewBox="0 0 24 24" fill={c} stroke="none"><path d="M12 2.5l2.9 6.1 6.6.9-4.8 4.6 1.2 6.6L12 17.6 6.1 20.7l1.2-6.6L2.5 9.5l6.6-.9z"/></svg>,
  Wallet:({s=18,c="currentColor"}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round"><path d="M3 7.5A2.5 2.5 0 015.5 5H18a2 2 0 012 2v1"/><rect x="3" y="8" width="18" height="11" rx="2.5"/><circle cx="16.5" cy="13.5" r="1.3" fill={c} stroke="none"/></svg>,
  Cog:   ({s=18,c="currentColor"}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round"><circle cx="12" cy="12" r="3.2"/><path d="M12 2.6v2.6M12 18.8v2.6M21.4 12h-2.6M5.2 12H2.6M18.6 5.4l-1.8 1.8M7.2 16.8l-1.8 1.8M18.6 18.6l-1.8-1.8M7.2 7.2L5.4 5.4"/></svg>,
  Spin:  ({s=14}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="rgba(255,255,255,0.15)" strokeWidth="2"/><path d="M12 3a9 9 0 019 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{animation:"_sp .65s linear infinite",transformOrigin:"12px 12px"}}/></svg>,
};

// ─────────────────────────────────────────────
// GLOBAL CSS
// ─────────────────────────────────────────────


// ─────────────────────────────────────────────
// BASE UI
// ─────────────────────────────────────────────
const Btn = ({ children, onClick, v="primary", sz="md", full, disabled, style={} }) => {
  const th = useTheme();
  const [h,sH] = useState(false);
  const S = {
    xs:{ padding:"5px 10px",  fontSize:11, borderRadius:7,  gap:4 },
    sm:{ padding:"7px 13px",  fontSize:12, borderRadius:9,  gap:5 },
    md:{ padding:"9px 17px",  fontSize:13, borderRadius:10, gap:6 },
    lg:{ padding:"12px 22px", fontSize:14, borderRadius:11, gap:6 },
  };
  const V = {
    primary:  { background:h?th.acc+"dd":th.acc, color:th.accTxt, border:`1px solid ${th.accBd}`, boxShadow:h?`0 4px 20px ${th.accSub}`:"none" },
    secondary:{ background:h?th.s3:th.s2, color:th.t1, border:`1px solid ${th.b1}` },
    ghost:    { background:h?th.s2:"transparent", color:h?th.t1:th.t2, border:`1px solid ${h?th.b2:th.b1}` },
    danger:   { background:h?"rgba(255,69,58,0.18)":"rgba(255,69,58,0.1)", color:th.err, border:"1px solid rgba(255,69,58,0.2)" },
    outline:  { background:"transparent", color:th.t1, border:`1px solid ${h?th.b3:th.b2}` },
  };
  // DIQQAT: avval `disabled` atributi qo'yilmagandi — faqat bosish
  // bekor qilinardi. Natijada tugma fokuslanadigan, bosiladigan va
  // ekran o'quvchiga "yoqiq" deb aytilmaydigan bo'lib qolardi.
  return <button disabled={disabled} type="button" onClick={disabled?undefined:(e)=>{hap.tap();onClick?.(e);}} onMouseEnter={()=>sH(true)} onMouseLeave={()=>sH(false)}
    style={{ display:"inline-flex",alignItems:"center",justifyContent:"center",fontFamily:"inherit",fontWeight:600,letterSpacing:"-0.01em",border:"none",cursor:disabled?"not-allowed":"pointer",transition:"all .17s cubic-bezier(.2,0,0,1)",width:full?"100%":undefined,opacity:disabled?.35:1,...S[sz],...V[v],...style }}>
    {children}
  </button>;
};

const Tag = ({ children, v="default" }) => {
  const th = useTheme();
  const vs = {
    default: { bg:th.s2,  color:th.t2,        bd:th.b1 },
    ok:      { bg:"rgba(52,199,89,0.12)",   color:th.ok, bd:"rgba(52,199,89,0.22)"  },
    warn:    { bg:"rgba(255,159,10,0.12)",  color:th.warn, bd:"rgba(255,159,10,0.22)" },
    err:     { bg:"rgba(255,69,58,0.12)",   color:th.err, bd:"rgba(255,69,58,0.22)"  },
    acc:     { bg:th.accSub, color:th.acc,  bd:th.accBd },
  };
  const s = vs[v]||vs.default;
  return <span style={{ display:"inline-flex",alignItems:"center",gap:4,background:s.bg,color:s.color,border:`1px solid ${s.bd}`,borderRadius:999,padding:"3px 9px",fontSize:11,fontWeight:600,letterSpacing:"-0.01em",whiteSpace:"nowrap" }}>{children}</span>;
};

const Lbl = ({ children }) => {
  const th = useTheme();
  return <p style={{ fontSize:10,fontWeight:600,color:th.t3,letterSpacing:"0.08em",marginBottom:7,textTransform:"uppercase" }}>{children}</p>;
};

const Err = ({ msg }) => { const th = useTheme(); return msg ? <div style={{ display:"flex",alignItems:"center",gap:5,color:th.err,fontSize:12 }}><Ic.Warn s={12} c={th.err}/>{msg}</div> : null; };

const HR = () => {
  const th = useTheme();
  return <div style={{ height:1,background:`linear-gradient(90deg,transparent,${th.b1} 20%,${th.b1} 80%,transparent)`,margin:"24px 0" }}/>;
};

const Sec = ({ label, icon, sub }) => {
  const th = useTheme();
  return <div style={{ display:"flex",alignItems:"flex-start",gap:11,marginBottom:14 }}>
    <div style={{ width:32,height:32,borderRadius:10,background:th.s2,border:`1px solid ${th.b1}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1 }}>{icon}</div>
    <div>
      <p style={{ fontWeight:700,fontSize:15,letterSpacing:"-0.02em" }}>{label}</p>
      {sub && <p style={{ fontSize:12,color:th.t3,marginTop:2 }}>{sub}</p>}
    </div>
  </div>;
};

const StatCard = ({ label, value, color }) => {
  const th = useTheme();
  return <div style={{ ...glass(th,0.04),borderRadius:13,padding:"13px 15px",overflow:"hidden",position:"relative" }}>
    <div style={{ position:"absolute",top:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,${th.b2},transparent)` }}/>
    <p style={{ fontSize:10,fontWeight:600,color:th.t3,letterSpacing:"0.07em",textTransform:"uppercase",marginBottom:6 }}>{label}</p>
    <p style={{ fontSize:22,fontWeight:800,letterSpacing:"-0.03em",color:color||th.t1 }}>
      {/^\d+\/\d+$/.test(String(value))
        ? <><Count value={String(value).split("/")[0]}/><span style={{ opacity:.42 }}>/{String(value).split("/")[1]}</span></>
        : <Count value={value}/>}
    </p>
  </div>;
};


// ── modal qayerdan o'sib chiqsin ──
let modalFrom = null;
const markOrigin = (e) => {
  try {
    const r = e.currentTarget.getBoundingClientRect();
    modalFrom = { x: r.left + r.width/2, y: r.top + r.height/2, w: r.width, h: r.height };
  } catch { modalFrom = null; }
};
const growVars = () => {
  if (!modalFrom) return { "--gx":"0px", "--gy":"14px", "--gs":".93" };
  const cx = window.innerWidth/2, cy = window.innerHeight/2;
  return {
    "--gx": `${modalFrom.x - cx}px`,
    "--gy": `${modalFrom.y - cy}px`,
    "--gs": "0.16",
  };
};

// ── MODAL / SHEET uchun umumiy xatti-harakat ──
// Escape bilan yopish, orqa fonni scroll qilmaslik, fokusni oynada ushlab
// turish va ekran o'quvchilar uchun belgilar. Ikkalasi ham shu hook'ni ishlatadi.
const useOverlay = (onClose) => {
  const box = useRef(null);

  useEffect(()=>{
    // orqa fon scroll bo'lmasin
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // oyna ochilganda fokus ichkariga tushsin
    const first = box.current?.querySelector(
      "button:not([disabled]), input, textarea, select, a[href], [tabindex]:not([tabindex='-1'])"
    );
    if (first) { try { first.focus({ preventScroll:true }); } catch (e) { logErr("overlay/focus", e); } }

    const h = e => {
      if (e.key === "Escape") { e.stopPropagation(); onClose?.(); return; }
      // fokus oynadan chiqib ketmasin (oddiy trap)
      if (e.key !== "Tab" || !box.current) return;
      const f = [...box.current.querySelectorAll(
        "button:not([disabled]), input:not([disabled]), textarea, select, a[href], [tabindex]:not([tabindex='-1'])"
      )].filter(x => x.offsetParent !== null);
      if (!f.length) return;
      const first = f[0], last = f[f.length-1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    window.addEventListener("keydown", h, true);
    return ()=>{
      window.removeEventListener("keydown", h, true);
      document.body.style.overflow = prev;
    };
  }, []);

  return box;
};

const Modal = ({ children, onClose }) => {
  const th = useTheme();
  const box = useOverlay(onClose);
  return <div className="f" onClick={onClose} style={{ position:"fixed",inset:0,zIndex:9999,background: th.id==="light" ? "rgba(30,34,44,0.4)" : "rgba(0,0,0,0.72)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",display:"flex",alignItems:"center",justifyContent:"center",padding:16 }}>
    <div ref={box} className="grow" onClick={e=>e.stopPropagation()} role="dialog" aria-modal="true"
      style={{ ...glass(th,0.07,48),borderRadius:20,width:"100%",maxWidth:380,boxShadow:"0 32px 80px rgba(0,0,0,0.8)", ...growVars() }}>
      {children}
    </div>
  </div>;
};

const MH = ({ title, sub, onClose }) => {
  const th = useTheme();
  return <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"15px 18px",borderBottom:`1px solid ${th.b1}` }}>
    <div>
      <p style={{ fontWeight:700,fontSize:14,letterSpacing:"-0.02em" }}>{title}</p>
      {sub && <p style={{ fontSize:11,color:th.t3,marginTop:1 }}>{sub}</p>}
    </div>
    <button onClick={onClose} aria-label={t("common.close")}
      style={{ width:34,height:34,borderRadius:10,background:th.s1,border:`1px solid ${th.b1}`,color:th.t3,
               cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,
               margin:-9, WebkitTapHighlightColor:"transparent" }}><Ic.X/></button>
  </div>;
};



// ── SAVAT VA "OTISH" ANIMATSIYASI ─────────
// Savat DOM'ga to'g'ridan-to'g'ri qo'yiladi — chunki sahifa
// animatsiyasidagi transform position:fixed ni buzadi.

const BIN_ID = "plx-bin";

const buildBin = (th) => {
  let bin = document.getElementById(BIN_ID);
  if (bin) return bin;

  bin = document.createElement("div");
  bin.id = BIN_ID;
  bin.style.cssText = `
    position:fixed; right:20px; bottom:calc(108px + env(safe-area-inset-bottom,0px));
    width:64px; height:74px; z-index:10500; pointer-events:none;
    filter:drop-shadow(0 8px 20px rgba(0,0,0,.5));
    transform:translateY(220px);
    transition:transform .42s cubic-bezier(.16,.9,.26,1);
  `;

  // qopqoq
  const lid = document.createElement("div");
  lid.dataset.lid = "1";
  lid.style.cssText = `
    position:absolute; left:3px; top:8px; width:58px; height:10px;
    transform-origin:7px 100%;
    transition:transform .18s cubic-bezier(.3,0,.3,1);
  `;
  lid.innerHTML = `
    <span style="position:absolute;inset:0;border-radius:4px;background:${th.s3};border:1px solid ${th.b2}"></span>
    <span style="position:absolute;left:22px;top:-6px;width:16px;height:6px;border-radius:3px;background:${th.s3};border:1px solid ${th.b2}"></span>
  `;

  // tana
  const body = document.createElement("div");
  body.dataset.body = "1";
  body.style.cssText = `
    position:absolute; left:8px; top:21px; width:48px; height:50px;
    transform-origin:50% 100%;
    background:${th.s2}; border:1px solid ${th.b2};
    border-radius:4px 4px 11px 11px;
    box-shadow:inset 0 8px 16px rgba(0,0,0,.45);
    overflow:hidden;
  `;
  body.innerHTML = [10,22,34].map(x=>
    `<span style="position:absolute;left:${x}px;top:10px;width:2px;height:28px;background:${th.b2};border-radius:1px"></span>`
  ).join("");

  bin.append(lid, body);
  document.body.appendChild(bin);
  return bin;
};

// bir nechta joyda (Kartalar, Jamoa) chaqirilganda ham savat taymeri
// bitta bo'lib qolsin — aks holda bir hook boshqasining "yashirish"
// buyrug'ini bekor qilib, savat osilib qolishi mumkin edi
let _hideTimer = null;

const useToss = (th) => {
  const showBin = () => {
    const bin = buildBin(th);
    clearTimeout(_hideTimer);
    void bin.offsetHeight;                 // reflow — orqama-ketin stil
                                            // o'zgarishlari brauzer tomonidan
                                            // birlashtirilib, animatsiya
                                            // ishga tushmay qolmasligi uchun
    requestAnimationFrame(()=>{ bin.style.transform = "translateY(0)"; });
    // savat ko'tarilishi bilanoq qopqoq ochiladi — koptok kelguncha kutadi
    const lid = bin.querySelector("[data-lid]");
    if (lid) setTimeout(()=>{ lid.style.transform = "rotate(-52deg) translateY(-3px)"; }, 150);
    return bin;
  };

  const hideBin = (delay=900) => {
    clearTimeout(_hideTimer);
    _hideTimer = setTimeout(()=>{
      const bin = document.getElementById(BIN_ID);
      if (!bin) return;
      void bin.offsetHeight;               // shu yerda ham majburiy reflow
      requestAnimationFrame(()=>{
        bin.style.transform = "translateY(220px)";
      });
    }, delay);
  };

  const land = (bin) => {
    const lid  = bin.querySelector("[data-lid]");
    const body = bin.querySelector("[data-body]");
    // koptok tushdi — qopqoq sakrab yopiladi
    if (lid) {
      lid.style.transition = "transform .16s cubic-bezier(.3,0,.3,1)";
      lid.style.transform  = "rotate(7deg)";
      setTimeout(()=>{ lid.style.transform = "rotate(-9deg)"; }, 160);
      setTimeout(()=>{ lid.style.transform = "rotate(0deg)";  }, 300);
    }
    // savat siqiladi
    if (body?.animate) {
      body.animate(
        [{transform:"scaleY(1)"},{transform:"scaleY(.84) scaleX(1.08)",offset:.3},{transform:"scaleY(1)"}],
        { duration:340, easing:"cubic-bezier(.3,0,.3,1)" }
      );
    }
    // chang
    const r = bin.getBoundingClientRect();
    const puff = document.createElement("div");
    puff.style.cssText = `
      position:fixed; left:${r.left + r.width/2 - 26}px; top:${r.top + 2}px;
      width:52px; height:52px; border-radius:50%;
      border:2px solid ${th.t3}; z-index:9997; pointer-events:none;
    `;
    document.body.appendChild(puff);
    puff.animate(
      [{transform:"scale(.35)",opacity:.6},{transform:"scale(2.2)",opacity:0}],
      { duration:480, easing:"ease-out" }
    ).onfinish = () => puff.remove();
  };

  // bitta qatorni g'ijimlab otish
  const toss = (el, onDone, delay=0) => {
    const bin = showBin();

    setTimeout(() => {
      if (!el || typeof el.animate !== "function") {
        land(bin); onDone?.(); hideBin(); return;
      }

      const r = el.getBoundingClientRect();
      el.classList.add("crush");
      (el.closest("[data-item]") || el.parentElement)?.classList.add("fold");

      setTimeout(() => {
        const b  = bin.getBoundingClientRect();
        const x0 = r.left + r.width/2, y0 = r.top + r.height/2;
        const x1 = b.left + b.width/2, y1 = b.top + 22;

        const ball = document.createElement("div");
        ball.style.cssText = `
          position:fixed;left:0;top:0;width:30px;height:30px;z-index:9999;
          margin:-15px 0 0 -15px;pointer-events:none;
          filter:drop-shadow(0 4px 8px rgba(0,0,0,.5));
          transform:translate(${x0}px,${y0}px);
        `;
        ball.innerHTML = `
          <svg viewBox="0 0 40 40" width="30" height="30">
            <defs>
              <linearGradient id="pg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stop-color="#fbfbf9"/><stop offset="1" stop-color="#a9a8a3"/>
              </linearGradient>
            </defs>
            <path d="M20 1.6 L31.4 5.2 L38.4 15 L36.2 27.4 L26.8 36.4 L14.6 38 L4.6 31 L1.4 19.4 L6.2 8.4 Z" fill="url(#pg)"/>
            <path d="M20 1.6 L14.8 13.4 L1.4 19.4 L6.2 8.4 Z" fill="#ffffff" opacity=".75"/>
            <path d="M31.4 5.2 L23.6 15.6 L38.4 15 Z" fill="#d8d7d2" opacity=".9"/>
            <path d="M36.2 27.4 L23.6 24.2 L26.8 36.4 Z" fill="#8f8e89" opacity=".85"/>
            <path d="M4.6 31 L15.6 25.4 L14.6 38 Z" fill="#9d9c97" opacity=".8"/>
            <path d="M14.8 13.4 L23.6 15.6 L23.6 24.2 L15.6 25.4 Z" fill="#e6e5e0"/>
            <g stroke="#7e7d78" stroke-width=".8" opacity=".55" fill="none" stroke-linecap="round">
              <path d="M14.8 13.4 L23.6 15.6"/><path d="M23.6 15.6 L23.6 24.2"/>
              <path d="M23.6 24.2 L15.6 25.4"/><path d="M15.6 25.4 L14.8 13.4"/>
              <path d="M20 1.6 L14.8 13.4"/><path d="M38.4 15 L23.6 15.6"/>
              <path d="M4.6 31 L15.6 25.4"/><path d="M36.2 27.4 L23.6 24.2"/>
            </g>
          </svg>
        `;
      document.body.appendChild(ball);

        const mx = x0 + (x1 - x0) * 0.52;
        const my = y0 - 34;

        ball.animate([
          { transform:`translate(${x0}px,${y0}px) scale(.55) rotate(0deg)`,   opacity:0 },
          { transform:`translate(${x0}px,${y0}px) scale(1) rotate(28deg)`,    opacity:1, offset:.16 },
          { transform:`translate(${mx}px,${my}px) scale(.94) rotate(200deg)`, opacity:1, offset:.5 },
          { transform:`translate(${x1}px,${y1}px) scale(.36) rotate(400deg)`, opacity:.92 },
        ], { duration:620, easing:"cubic-bezier(.34,.02,.62,1)" }).onfinish = () => {
          ball.remove();
          land(bin);
          onDone?.();
          hideBin();
        };
      }, 250);
    }, delay);
  };

  // bir nechta qatorni ketma-ket otish
  const tossAll = (els, onDone) => {
    const list = (els||[]).filter(Boolean);
    if (!list.length) { onDone?.(); return; }
    list.forEach((el,i)=> toss(el, i===list.length-1 ? onDone : undefined, i*130));
  };

  // eslatma: _hideTimer endi butun ilova uchun umumiy (module-level),
  // shuning uchun bitta sahifa yopilganda uni bekor qilish kerak emas —
  // boshqa sahifada hali kutilayotgan "yashirish" buzilib qolmasin

  return { toss, tossAll };
};

// ── BOTTOM SHEET ──────────────────────────
const Sheet = ({ title, icon, children, onClose }) => {
  const th = useTheme();
  const box = useOverlay(onClose);
  return (
    <div className="f" onClick={onClose} style={{ position:"fixed",inset:0,zIndex:9999,background: th.id==="light" ? "rgba(30,34,44,0.35)" : "rgba(0,0,0,0.6)",backdropFilter:"blur(10px)",WebkitBackdropFilter:"blur(10px)",display:"flex",alignItems:"flex-end",justifyContent:"center" }}>
      <div ref={box} className="sh" onClick={e=>e.stopPropagation()} role="dialog" aria-modal="true"
        aria-label={typeof title === "string" ? title : undefined} style={{
        width:"100%",maxWidth:520,
        background:th.bg2,
        borderTop:`1px solid ${th.b2}`,
        borderRadius:"22px 22px 0 0",
        padding:"10px 16px calc(26px + env(safe-area-inset-bottom,0px))",
        boxShadow:"0 -20px 60px rgba(0,0,0,0.6)",
        maxHeight:"78vh",overflowY:"auto",
      }}>
        <div style={{ width:38,height:4,borderRadius:2,background:th.b2,margin:"0 auto 16px" }}/>
        {icon && <div style={{ width:60,height:60,borderRadius:"50%",background:th.s2,border:`1px solid ${th.b1}`,display:"flex",alignItems:"center",justifyContent:"center",margin:"4px auto 12px" }}>{icon}</div>}
        {title && <p style={{ textAlign:"center",fontWeight:700,fontSize:17,letterSpacing:"-0.02em",marginBottom:16 }}>{title}</p>}
        {children}
      </div>
    </div>
  );
};

// ── PROFIL QATORI ─────────────────────────
const Row = ({ icon, title, sub, onClick, right }) => {
  const th = useTheme();
  const [h,sH] = useState(false);
  return (
    <button onClick={e=>{hap.tap();onClick?.(e);}}
      onMouseEnter={()=>sH(true)} onMouseLeave={()=>sH(false)}
      style={{
        width:"100%",display:"flex",alignItems:"center",gap:13,
        padding:"12px 14px",borderRadius:16,cursor:"pointer",
        background: h ? th.s2 : th.s1,
        border:`1px solid ${h ? th.b2 : th.b1}`,
        fontFamily:"inherit",textAlign:"left",
        transition:"all .16s cubic-bezier(.2,0,0,1)",
      }}>
      <span style={{
        width:44,height:44,flexShrink:0,borderRadius:13,
        background:th.s2,border:`1px solid ${th.b1}`,
        display:"flex",alignItems:"center",justifyContent:"center",
      }}>{icon}</span>
      <span style={{ flex:1,minWidth:0 }}>
        <span style={{ display:"block",fontSize:14.5,fontWeight:600,color:th.t1,letterSpacing:"-0.01em" }}>{title}</span>
        {sub && <span style={{ display:"block",fontSize:12.5,color:th.t3,marginTop:2 }}>{sub}</span>}
      </span>
      {right || <Ic.Right s={15} c={th.t3}/>}
    </button>
  );
};

// ── PROFIL SAHIFASI ───────────────────────
const ProfilePage = ({ themeId, setThemeId, lang, onLang }) => {
  const th = useTheme();
  const [view,sView] = useState("main");
  const [sheet,sS] = useState(null);
  const sL = l => onLang(l);
  const [copied,sC]= useState(false);

  const tg   = typeof window!=="undefined" ? window.Telegram?.WebApp : null;
  const me   = tg?.initDataUnsafe?.user;
  const name = me ? [me.first_name, me.last_name].filter(Boolean).join(" ") : t("prof.guest");
  const uid  = me?.id ? String(me.id) : "—";

  const copyId = () => {
    if (!me?.id) return;
    navigator.clipboard?.writeText(uid);
    sC(true); setTimeout(()=>sC(false),1500);
  };

  const langLabel = LANGS.find(l=>l.id===lang)?.label;

  if (view === "settings")
    return <SettingsPage onBack={()=>sView("main")} themeId={themeId} setThemeId={setThemeId}
                     lang={lang} setLang={onLang}/>;

  if (view === "app")
    return (
      <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
        <button onClick={()=>sView("main")} aria-label={t("common.back")} style={{
          width:34, height:34, borderRadius:10, cursor:"pointer", alignSelf:"flex-start",
          background:th.s1, border:`1px solid ${th.b1}`, color:th.t2,
          display:"flex", alignItems:"center", justifyContent:"center" }}>
          <Ic.Left/>
        </button>
        <AppSheet/>
      </div>
    );

  return (
    <div style={{ display:"flex",flexDirection:"column",gap:20,maxWidth:520,margin:"0 auto" }}>
      {/* Bosh qism */}
      <div style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:9,paddingTop:6 }}>
        <div style={{
          width:88,height:88,borderRadius:"50%",overflow:"hidden",
          background:th.s2,border:`2px solid ${th.b2}`,
          display:"flex",alignItems:"center",justifyContent:"center",
          boxShadow:`0 8px 32px rgba(0,0,0,0.4)`,
        }}>
          {me?.photo_url
            ? <img src={me.photo_url} width={88} height={88} alt="" style={{ display:"block",objectFit:"cover" }}/>
            : <span style={{ fontSize:30,fontWeight:700,color:th.t3 }}>{name[0]?.toUpperCase()}</span>}
        </div>
        <p style={{ fontSize:19,fontWeight:700,letterSpacing:"-0.02em" }}>{name}</p>
        <button onClick={copyId} style={{
          display:"inline-flex",alignItems:"center",gap:7,
          background:"transparent",border:"none",cursor:me?.id?"pointer":"default",
          color:th.t3,fontFamily:"'SF Mono','Fira Code',monospace",fontSize:13,letterSpacing:"0.04em",
        }}>
          {uid}
          {me?.id && (copied ? <Ic.Check s={13} c={th.ok}/> : <Ic.Copy s={13} c={th.t3}/>)}
        </button>
      </div>

      {/* Qatorlar */}
      <div style={{ display:"flex",flexDirection:"column",gap:9 }}>
        <Row icon={<Ic.Cog s={19} c={th.t2}/>} title={t("prof.settings")} sub={t("prof.settingsSub")}
             onClick={()=>sView("settings")}/>
        <Row icon={<Ic.Send s={19} c={th.t2}/>} title={t("prof.app")} sub={t("prof.appSub")}
             onClick={()=>sView("app")}/>
        <Row icon={<Ic.Globe s={19} c={th.t2}/>} title={t("prof.lang")} sub={langLabel} onClick={e=>{markOrigin(e);sS("lang");}}/>
        <Row icon={<Ic.Help  s={19} c={th.t2}/>} title={t("prof.help")} onClick={e=>{markOrigin(e);sS("help");}}/>
        <Row icon={<Ic.Info  s={19} c={th.t2}/>} title={t("prof.about")} onClick={e=>{markOrigin(e);sS("about");}}/>
        <Row icon={<Ic.Theme s={19} c={th.t2}/>} title={t("prof.theme")}
             sub={{amoled:t("prof.themeDark"),stitch:t("prof.themeBlue"),light:t("prof.themeLight")}[themeId]} onClick={e=>{markOrigin(e);sS("theme");}}/>
      </div>

      {/* ── Til ── */}
      {sheet==="lang" && (
        <Sheet title={t("prof.langTitle")} onClose={()=>sS(null)}>
          <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
            {LANGS.map(l=>{
              const on = lang===l.id;
              return (
                <button key={l.id} onClick={()=>{ hap.select(); sL(l.id); sS(null); }} style={{
                  display:"flex",alignItems:"center",gap:12,padding:"13px 15px",borderRadius:14,cursor:"pointer",
                  background: on ? th.accSub : th.s1,
                  border:`1px solid ${on ? th.accBd : th.b1}`,
                  fontFamily:"inherit",transition:"all .15s",
                }}>
                  <span style={{ fontSize:20 }}>{l.flag}</span>
                  <span style={{ flex:1,textAlign:"left",fontSize:15,fontWeight:on?600:500,color:on?th.acc:th.t1 }}>{l.label}</span>
                  <Ic.Dot s={18} c={on?th.acc:th.t4} on={on}/>
                </button>
              );
            })}
          </div>
        </Sheet>
      )}

      {/* ── Mavzu ── */}
      {sheet==="theme" && (
        <Sheet title={t("prof.themeTitle")} onClose={()=>sS(null)}>
          <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
            {[
              { id:"amoled", label:t("prof.themeDark"), note:t("prof.themeAmoled"),   swatch:"#000000", ring:"rgba(255,255,255,0.16)" },
              { id:"stitch", label:t("prof.themeBlue"), note:t("prof.themeStitch"),   swatch:"#0b1730", ring:"rgba(120,170,255,0.3)" },
              { id:"light",  label:t("prof.themeLight"),  note:t("prof.themeLightNote"), swatch:"#F4F5F7", ring:"rgba(16,19,26,0.14)" },
            ].map(item=>{
              const on = themeId===item.id;
              return (
                <button key={item.id} onClick={()=>{ hap.select(); setThemeId(item.id); sS(null); }} style={{
                  display:"flex",alignItems:"center",gap:12,padding:"13px 15px",borderRadius:14,cursor:"pointer",
                  background: on ? th.accSub : th.s1,
                  border:`1px solid ${on ? th.accBd : th.b1}`,
                  fontFamily:"inherit",transition:"all .15s",
                }}>
                  <span style={{ width:34,height:34,borderRadius:11,flexShrink:0,background:item.swatch,border:`1.5px solid ${item.ring}`,boxShadow:"inset 0 1px 0 rgba(255,255,255,0.08)" }}/>
                  <span style={{ flex:1,textAlign:"left" }}>
                    <span style={{ display:"block",fontSize:15,fontWeight:on?600:500,color:on?th.acc:th.t1 }}>{item.label}</span>
                    <span style={{ display:"block",fontSize:12,color:th.t3,marginTop:1 }}>{item.note}</span>
                  </span>
                  <Ic.Dot s={18} c={on?th.acc:th.t4} on={on}/>
                </button>
              );
            })}
          </div>
        </Sheet>
      )}

      {/* ── Yordam ── */}
      {sheet==="help" && (
        <Sheet title={t("prof.helpTitle")}
          icon={<Ic.Help s={26} c={th.t2}/>}
          onClose={()=>sS(null)}>
          <p style={{ textAlign:"center",fontSize:13,color:th.t3,marginTop:-8,marginBottom:16,lineHeight:1.55 }}>
            {t("prof.helpNote")}
          </p>
          <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
            <a href="tel:+998905890192" style={{ textDecoration:"none" }}>
              <div style={{ display:"flex",alignItems:"center",gap:12,padding:"14px 15px",borderRadius:14,background:th.s1,border:`1px solid ${th.b1}` }}>
                <span style={{ flex:1,fontFamily:"'SF Mono','Fira Code',monospace",fontSize:14.5,color:th.t1,letterSpacing:"0.02em" }}>+998 90 589 01 92</span>
                <Ic.Phone s={17} c={th.acc}/>
              </div>
            </a>
            <a href="https://t.me/PremoLux" target="_blank" rel="noreferrer" style={{ textDecoration:"none" }}>
              <div style={{ display:"flex",alignItems:"center",gap:12,padding:"14px 15px",borderRadius:14,background:th.s1,border:`1px solid ${th.b1}` }}>
                <span style={{ flex:1,fontSize:14.5,fontWeight:500,color:th.t1 }}>@PremoLux</span>
                <Ic.Send s={17} c={th.acc}/>
              </div>
            </a>
          </div>
        </Sheet>
      )}

      {/* ── Ilova haqida ── */}
      {sheet==="about" && (
        <Sheet title={t("prof.aboutTitle")} icon={<Ic.Info s={26} c={th.t2}/>} onClose={()=>sS(null)}>
          <p style={{ textAlign:"center",fontSize:13.5,color:th.t2,lineHeight:1.65,marginTop:-8,marginBottom:18 }}>
            {t("prof.aboutText")}
          </p>
          <div style={{ display:"flex",flexDirection:"column",gap:1,borderRadius:14,overflow:"hidden",border:`1px solid ${th.b1}` }}>
            {[[t("prof.version"),"1.0.0"],[t("prof.channel"),CHANNEL],[t("prof.updated"),"Avgust 2026"]].map(([k,v])=>(
              <div key={k} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 15px",background:th.s1 }}>
                <span style={{ fontSize:13.5,color:th.t3 }}>{k}</span>
                <span style={{ fontSize:13.5,fontWeight:600,color:th.t1,fontFamily:"'SF Mono','Fira Code',monospace" }}>{v}</span>
              </div>
            ))}
          </div>
        </Sheet>
      )}
    </div>
  );
};


// ── KOD KATAKLARI ─────────────────────────
const CodeBoxes = ({ value, onChange, onDone, autoFocus }) => {
  const th  = useTheme();
  const ref = useRef(null);
  const [foc,sFoc] = useState(false);
  const at = Math.min(value.length, 4);

  useEffect(()=>{ if(autoFocus) setTimeout(()=>ref.current?.focus(),120); },[]);

  return (
    <div onClick={()=>ref.current?.focus()} style={{ position:"relative", cursor:"text" }}>
      <input ref={ref} value={value} inputMode="numeric" autoComplete="one-time-code"
        onFocus={()=>sFoc(true)} onBlur={()=>sFoc(false)}
        onChange={e=>onChange(e.target.value.replace(/\D/g,"").slice(0,5))}
        onKeyDown={e=>{ if(e.key==="Enter"&&value.length===5) onDone?.(); }}
        style={{ position:"absolute", inset:0, opacity:0, width:"100%", height:"100%",
                 border:"none", background:"transparent", padding:0, cursor:"text", fontSize:16 }}/>

      <div style={{ display:"flex", gap:8, pointerEvents:"none" }}>
        {[0,1,2,3,4].map(i=>{
          const ch     = value[i];
          const active = foc && i===at && value.length<5;
          const done   = !!ch;
          return (
            <span key={i} style={{
              flex:1, height:56, borderRadius:12, position:"relative",
              display:"flex", alignItems:"center", justifyContent:"center",
              background: done ? th.s2 : th.s1,
              border:`1.5px solid ${active ? th.b3 : done ? th.b2 : th.b1}`,
              boxShadow: active ? `0 0 0 3px ${th.accSub}` : "none",
              transition:"all .18s cubic-bezier(.2,0,0,1)",
            }}>
              {done ? (
                <span key={ch+"-"+i} className="digit" style={{
                  fontFamily:"'SF Mono','Fira Code',monospace",
                  fontSize:26, fontWeight:700, color:th.t1, lineHeight:1,
                }}>{ch}</span>
              ) : active ? (
                <span className="caret" style={{ width:2, height:24, borderRadius:1, background:th.acc }}/>
              ) : (
                <span style={{ width:8, height:2, borderRadius:1, background:th.t4 }}/>
              )}
            </span>
          );
        })}
      </div>
    </div>
  );
};


// ═════════════════════════════════════════
// BUYURTMALAR
// ═════════════════════════════════════════
const STAGES = ["Raqam","Login","Karta","Premium"];

const Ring = ({ left, total, size=42, color, track }) => {
  const r = (size-5)/2, C = 2*Math.PI*r;
  const p = Math.max(0, Math.min(1, left/total));
  return (
    <svg width={size} height={size} style={{ transform:"rotate(-90deg)", display:"block" }}>
      <circle cx={size/2} cy={size/2} r={r} stroke={track} strokeWidth="2.5" fill="none"/>
      <circle cx={size/2} cy={size/2} r={r} stroke={color} strokeWidth="2.5" fill="none"
        strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C*(1-p)}
        style={{ transition:"stroke-dashoffset .95s linear, stroke .3s" }}/>
    </svg>
  );
};

const mmss = t => `${String(Math.floor(Math.max(0,t)/60)).padStart(2,"0")}:${String(Math.max(0,t)%60).padStart(2,"0")}`;

const OrderCard = ({ o, onFreeze, onCancel, onCheck }) => {
  const th = useTheme();
  const live   = o.status==="active";
  const frozen = o.status==="frozen";
  const done   = o.status==="done";
  const failed = o.status==="failed";

  const tone = done ? th.ok : failed ? th.err : frozen ? "#5AC8FA" : th.acc;
  const pill = done ? "ok" : failed ? "err" : frozen ? "default" : "acc";
  const label= done ? "Bajarildi" : failed ? "Xato" : frozen ? "To'xtatilgan" : "Jarayonda";
  const warn = live && o.left < 60;

  return (
    <div style={{
      ...glass(th,0.04), borderRadius:16, overflow:"hidden", position:"relative",
      border:`1px solid ${live ? th.b2 : th.b1}`,
    }}>
      {/* jonli buyurtmada yuqorida yorug'lik yuguradi */}
      {live && (
        <span style={{ position:"absolute", top:0, left:0, right:0, height:1.5, overflow:"hidden" }}>
          <span className="scan" style={{ display:"block", width:"34%", height:"100%",
            background:`linear-gradient(90deg,transparent,${tone},transparent)` }}/>
        </span>
      )}

      <div style={{ padding:"13px 14px" }}>
        {/* sarlavha */}
        <div style={{ display:"flex", alignItems:"center", gap:9, marginBottom:12 }}>
          <span style={{ fontFamily:"'SF Mono','Fira Code',monospace", fontSize:12, fontWeight:700, color:th.t3 }}>#{o.id}</span>
          <span style={{ flex:1, fontSize:14, fontWeight:600, letterSpacing:"-0.01em", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{o.client}</span>
          <Tag v={pill}>{label}</Tag>
        </div>

        {/* bosqichlar */}
        <div style={{ display:"flex", alignItems:"center", marginBottom:13 }}>
          {STAGES.map((st,i)=>{
            const passed = i < o.stage || done;
            const now    = i === o.stage && live;
            return (
              <div key={st} style={{ display:"flex", alignItems:"center", flex:i<3?1:"none" }}>
                <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:5, position:"relative" }}>
                  {now && <span className="ping" style={{ position:"absolute", top:0, width:14, height:14, borderRadius:"50%", background:tone }}/>}
                  <span style={{
                    width:14, height:14, borderRadius:"50%", flexShrink:0, position:"relative",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    background: passed ? th.ok : now ? tone : "transparent",
                    border:`1.5px solid ${passed ? th.ok : now ? tone : th.b2}`,
                    transition:"all .3s",
                  }}>
                    {passed && <Ic.Check s={8} c={done?"#062":"#062"}/>}
                  </span>
                  <span style={{ fontSize:9.5, fontWeight:now?700:500, letterSpacing:"0.03em",
                    color: passed ? th.ok : now ? tone : th.t4, whiteSpace:"nowrap" }}>{st}</span>
                </div>
                {i<3 && (
                  <span style={{ flex:1, height:1.5, margin:"0 6px", marginBottom:16, borderRadius:1,
                    background: passed ? th.ok : th.b1, transition:"background .3s" }}/>
                )}
              </div>
            );
          })}
        </div>

        {/* pastki qator */}
        <div style={{ display:"flex", alignItems:"center", gap:11,
          paddingTop:11, borderTop:`1px solid ${th.b1}` }}>
          {/* taymer */}
          {(live||frozen) && (
            <span style={{ position:"relative", width:42, height:42, flexShrink:0,
              display:"flex", alignItems:"center", justifyContent:"center" }}>
              <span style={{ position:"absolute", inset:0 }}>
                <Ring left={o.left} total={o.total} color={warn?th.err:frozen?"#5AC8FA":tone} track={th.b1}/>
              </span>
              <span className={warn?"tick":undefined} style={{
                fontFamily:"'SF Mono','Fira Code',monospace", fontSize:11, fontWeight:700,
                color: warn ? th.err : th.t1,
              }}>{frozen ? "‖" : mmss(o.left)}</span>
            </span>
          )}
          {done && (
            <span style={{ width:42, height:42, flexShrink:0, borderRadius:"50%", position:"relative",
              background:"rgba(52,199,89,0.12)", border:"1px solid rgba(52,199,89,0.25)",
              display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Ic.Check s={16} c={th.ok}/>
            </span>
          )}
          {failed && (
            <span style={{ width:42, height:42, flexShrink:0, borderRadius:"50%",
              background:"rgba(255,69,58,0.1)", border:"1px solid rgba(255,69,58,0.22)",
              display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Ic.Warn s={16} c={th.err}/>
            </span>
          )}

          <div style={{ flex:1, minWidth:0, display:"flex", flexDirection:"column", gap:3 }}>
            <span style={{ fontSize:12, color:th.t2 }}>{o.plan} · <span style={{ fontFamily:"'SF Mono',monospace", color:th.t1 }}>{o.price}</span></span>
            <span style={{ fontSize:11, color:th.t3, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
              {o.worker} · •••• {o.card}
            </span>
          </div>

          <div style={{ display:"flex", gap:6, flexShrink:0 }}>
            {live && <Btn v="ghost" sz="sm" onClick={()=>onFreeze(o.id)}><Ic.Snow/></Btn>}
            {frozen && <Btn v="ghost" sz="sm" onClick={()=>onFreeze(o.id)}><Ic.Play/></Btn>}
            {(live||frozen) && <Btn v="danger" sz="sm" onClick={()=>onCancel(o.id)}><Ic.X/></Btn>}
            {failed && <Btn sz="sm" onClick={()=>onCheck(o.id)}>Qayta</Btn>}
          </div>
        </div>
      </div>
    </div>
  );
};

const SEED = [
  { id:"A7F32", client:"@dilshod_uz",  plan:"3 oy",  price:"78 000",  worker:"Aziz",    card:"1111", stage:2, status:"active", left:252, total:300 },
  { id:"B1C09", client:"@malika_k",    plan:"1 oy",  price:"32 000",  worker:"Bekzod",  card:"9012", stage:1, status:"active", left:47,  total:300 },
  { id:"C4D77", client:"@sardor_007",  plan:"12 oy", price:"240 000", worker:"Aziz",    card:"1098", stage:3, status:"frozen", left:180, total:300 },
  { id:"D9E15", client:"@nodira_m",    plan:"3 oy",  price:"78 000",  worker:"Jasur",   card:"1111", stage:4, status:"done",   left:0,   total:300 },
  { id:"E2A88", client:"@otabek_t",    plan:"1 oy",  price:"32 000",  worker:"Bekzod",  card:"9012", stage:2, status:"failed", left:0,   total:300 },
];

const FILTERS = [
  { id:"all",    label:"Hammasi" },
  { id:"active", label:"Jarayonda" },
  { id:"frozen", label:"To'xtagan" },
  { id:"done",   label:"Bajarildi" },
  { id:"failed", label:"Xato" },
];

const OrdersPage = () => {
  const th = useTheme();
  const [orders,sO] = useState(SEED);
  const [f,sF]      = useState("all");

  // jonli taymer
  useEffect(()=>{
    const t = setInterval(()=>{
      sO(list => list.map(o => o.status==="active"
        ? { ...o, left: o.left>0 ? o.left-1 : 0, status: o.left<=1 ? "failed" : "active" }
        : o));
    }, 1000);
    return ()=>clearInterval(t);
  },[]);

  const freeze = id => sO(l=>l.map(o=>o.id===id ? {...o, status: o.status==="frozen"?"active":"frozen"} : o));
  const cancel = id => sO(l=>l.filter(o=>o.id!==id));
  const retry  = id => sO(l=>l.map(o=>o.id===id ? {...o, status:"active", left:300, stage:0} : o));

  const shown = f==="all" ? orders : orders.filter(o=>o.status===f);
  const live  = orders.filter(o=>o.status==="active").length;
  const done  = orders.filter(o=>o.status==="done").length;
  const bad   = orders.filter(o=>o.status==="failed").length;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:18, maxWidth:680 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:800, letterSpacing:"-0.03em", lineHeight:1.1 }}>Buyurtmalar</h1>
          <p style={{ fontSize:13, color:th.t3, marginTop:3 }}>Navbat va bajarilish holati</p>
        </div>
        {live>0 && (
          <span style={{ display:"inline-flex", alignItems:"center", gap:6, background:th.accSub,
            border:`1px solid ${th.accBd}`, borderRadius:999, padding:"4px 11px" }}>
            <span className="tick" style={{ width:6, height:6, borderRadius:"50%", background:th.acc }}/>
            <span style={{ fontSize:12, fontWeight:700, color:th.acc }}>{live} jonli</span>
          </span>
        )}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:9 }}>
        <StatCard label="Jarayonda" value={String(live)} color={live?th.acc:th.t3}/>
        <StatCard label="Bajarildi" value={String(done)} color={th.ok}/>
        <StatCard label="Xato"      value={String(bad)}  color={bad?th.err:th.t3}/>
      </div>

      {/* filtrlar */}
      <div style={{ display:"flex", gap:7, overflowX:"auto", paddingBottom:2, margin:"-2px 0" }}>
        {FILTERS.map(x=>{
          const on = f===x.id;
          const n  = x.id==="all" ? orders.length : orders.filter(o=>o.status===x.id).length;
          return (
            <button key={x.id} onClick={()=>sF(x.id)} style={{
              display:"inline-flex", alignItems:"center", gap:6, flexShrink:0,
              padding:"6px 13px", borderRadius:999, cursor:"pointer", fontFamily:"inherit",
              fontSize:12.5, fontWeight:on?700:500,
              background: on ? th.accSub : th.s1,
              border:`1px solid ${on ? th.accBd : th.b1}`,
              color: on ? th.acc : th.t2,
              transition:"all .16s",
            }}>
              {x.label}
              <span style={{ fontFamily:"'SF Mono',monospace", fontSize:11, opacity:.7 }}>{n}</span>
            </button>
          );
        })}
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
        {shown.map(o=><OrderCard key={o.id} o={o} onFreeze={freeze} onCancel={cancel} onCheck={retry}/>)}
        {!shown.length && (
          <div style={{ textAlign:"center", padding:"38px 16px", border:`1px dashed ${th.b1}`, borderRadius:14 }}>
            <p style={{ fontSize:13, color:th.t3 }}>Bu holatda buyurtma yo'q</p>
          </div>
        )}
      </div>
    </div>
  );
};





// ═════════════════════════════════════════
// API QATLAMI
// ═════════════════════════════════════════
// Backend tayyor bo'lganda faqat shu ikki narsani almashtirish kifoya:
//   1) API_BASE — server manzili
//   2) MOCK — false qilinadi, fetch haqiqiy so'rov yuboradi


// ── ulanish holati ──
const useOnline = () => {
  const [on, sOn] = useState(typeof navigator!=="undefined" ? navigator.onLine : true);
  useEffect(()=>{
    const up = ()=>sOn(true), dn = ()=>sOn(false);
    window.addEventListener("online", up);
    window.addEventListener("offline", dn);
    return ()=>{ window.removeEventListener("online",up); window.removeEventListener("offline",dn); };
  },[]);
  return on;
};

// ═════════════════════════════════════════
// HAPTIK JAVOB
// ═════════════════════════════════════════

// ═════════════════════════════════════════
// TOAST
// ═════════════════════════════════════════
const ToastCtx = createContext(()=>{});
const useToast = () => useContext(ToastCtx);

const TOAST_ICON = {
  ok:   ({c}) => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>,
  err:  ({c}) => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>,
  warn: ({c}) => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 22h20L12 2z"/><path d="M12 9v5M12 17.5h.01"/></svg>,
  info: ({c}) => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.9" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>,
};

const Toast = ({ t: item, onKill }) => {
  const th = useTheme();
  const [out,sOut] = useState(false);
  const TONE = { ok:th.ok, err:th.err, warn:th.warn, info:th.acc };
  const c = TONE[item.kind] || th.acc;
  const Ico = TOAST_ICON[item.kind] || TOAST_ICON.info;

  useEffect(()=>{
    const a = setTimeout(()=>sOut(true), item.ms - 260);
    const b = setTimeout(()=>onKill(item.id), item.ms);
    return ()=>{ clearTimeout(a); clearTimeout(b); };
  },[]);

  return (
    <div className={out?"toastOut":"toastIn"}
      onClick={()=>{ sOut(true); setTimeout(()=>onKill(item.id),240); }}
      style={{
        pointerEvents:"auto", cursor:"pointer",
        display:"flex", alignItems:"center", gap:11,
        padding:"11px 15px 11px 12px", borderRadius:15,
        background: th.id==="light" ? "rgba(255,255,255,0.97)" : th.id==="stitch" ? "rgba(9,17,34,0.94)" : "rgba(14,14,16,0.94)",
        backdropFilter:"blur(26px) saturate(1.7)", WebkitBackdropFilter:"blur(26px) saturate(1.7)",
        border:`1px solid ${c}33`,
        boxShadow: th.id==="light"
          ? `0 10px 34px rgba(16,19,26,0.14), 0 2px 6px rgba(16,19,26,0.06)`
          : `0 12px 40px rgba(0,0,0,0.55), inset 0 1px 0 ${th.b2}, 0 0 26px ${c}18`,
        position:"relative", overflow:"hidden", maxWidth:340, minWidth:210,
      }}>
      <span style={{
        width:30, height:30, borderRadius:10, flexShrink:0,
        background:`${c}1c`, border:`1px solid ${c}33`,
        display:"flex", alignItems:"center", justifyContent:"center",
      }}><Ico c={c}/></span>

      <span style={{ flex:1, minWidth:0 }}>
        <span style={{ display:"block", fontSize:13.5, fontWeight:600, color:th.t1, letterSpacing:"-0.01em" }}>{item.title}</span>
        {item.note && <span style={{ display:"block", fontSize:11.5, color:th.t3, marginTop:1.5 }}>{item.note}</span>}
      </span>

      <span className="tBar" style={{
        position:"absolute", left:0, right:0, bottom:0, height:2,
        background:`linear-gradient(90deg, ${c}, ${c}55)`,
        animationDuration:`${item.ms}ms`,
      }}/>
    </div>
  );
};

const ToastHost = ({ list, onKill }) => (
  <div role="status" aria-live="polite" aria-atomic="false" style={{
    position:"fixed", top:"calc(12px + env(safe-area-inset-top,0px))", left:0, right:0, zIndex:9500,
    display:"flex", flexDirection:"column", alignItems:"center", gap:8,
    padding:"0 16px", pointerEvents:"none",
  }}>
    {list.map(x=><Toast key={x.id} t={x} onKill={onKill}/>)}
  </div>
);


// ═════════════════════════════════════════
// TARMOQ HOLATI — banner, xato, skelet
// ═════════════════════════════════════════
const OfflineBanner = () => {
  const th = useTheme();
  const online = useOnline();
  const [show, sShow] = useState(false);
  const [out, sOut]   = useState(false);
  const wasOffline = useRef(false);

  useEffect(()=>{
    if (!online) { wasOffline.current = true; sShow(true); sOut(false); }
    else if (wasOffline.current) {
      sOut(true);
      setTimeout(()=>{ sShow(false); wasOffline.current = false; }, 1800);
    }
  }, [online]);

  if (!show) return null;

  return (
    <div className={out ? "bannerOut" : "bannerIn"} style={{
      position:"fixed", top:0, left:0, right:0, zIndex:9600,
      paddingTop:"env(safe-area-inset-top,0px)",
    }}>
      <div style={{
        display:"flex", alignItems:"center", justifyContent:"center", gap:9,
        padding:"10px 16px",
        background: online ? th.ok : th.err,
        color:"#fff",
      }}>
        <span className={online?undefined:"dotBlink"} style={{
          width:6, height:6, borderRadius:"50%", background:"#fff" }}/>
        <span style={{ fontSize:12.5, fontWeight:700, letterSpacing:"-0.01em" }}>
          {online ? t("net.online") : t("net.offline")}
        </span>
      </div>
    </div>
  );
};

// so'rov xatosini chiroyli ko'rsatish
const ErrorState = ({ err, onRetry }) => {
  const th = useTheme();
  const [busy, sBusy] = useState(false);
  const msg = err instanceof Error ? err.message : t("err.unknown");
  const isNet = err?.code === "NETWORK" || err?.code === "TIMEOUT";

  const retry = async () => {
    sBusy(true); hap.tap();
    try { await onRetry?.(); } finally { sBusy(false); }
  };

  return (
    <div className="eUp" style={{
      display:"flex", flexDirection:"column", alignItems:"center", textAlign:"center",
      padding:"32px 22px", borderRadius:16, border:`1px dashed ${th.err}40`,
      background: th.id==="light" ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.015)",
    }}>
      <span style={{ width:48, height:48, borderRadius:14, marginBottom:14,
        background:`${th.err}14`, border:`1px solid ${th.err}30`,
        display:"flex", alignItems:"center", justifyContent:"center" }}>
        <Ic.Warn s={20} c={th.err}/>
      </span>
      <p style={{ fontSize:14.5, fontWeight:700, color:th.t1 }}>
        {isNet ? t("err.offline") : t("err.title")}
      </p>
      <p style={{ fontSize:12.5, color:th.t3, marginTop:6, lineHeight:1.5, maxWidth:260 }}>{msg}</p>
      {onRetry && (
        <span style={{ marginTop:16 }}>
          <Btn v="outline" sz="sm" onClick={retry} disabled={busy}>
            {busy ? <><Ic.Spin s={12} c={th.t1}/>{t("common.retrying")}</> : t("common.retry")}
          </Btn>
        </span>
      )}
    </div>
  );
};

// yuklanish skeleti — qator o'rnini bosib turadi
const SkelRow = ({ h=64 }) => {
  const th = useTheme();
  return (
    <div style={{ ...glass(th,0.04), borderRadius:14, padding:"14px", height:h,
      display:"flex", alignItems:"center", gap:12, position:"relative", overflow:"hidden" }}>
      <span style={{ width:38, height:38, borderRadius:11, background:th.s2, flexShrink:0 }}/>
      <span style={{ flex:1, display:"flex", flexDirection:"column", gap:7 }}>
        <span style={{ width:"55%", height:10, borderRadius:5, background:th.s2 }}/>
        <span style={{ width:"35%", height:8,  borderRadius:4, background:th.s2 }}/>
      </span>
      <span className="skelShine" style={{ position:"absolute", top:0, bottom:0, left:0, width:"40%",
        background:`linear-gradient(90deg, transparent, ${th.b2}, transparent)` }}/>
    </div>
  );
};

const SkelList = ({ n=3 }) => (
  <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
    {Array.from({length:n}).map((_,i)=><SkelRow key={i}/>)}
  </div>
);

// ═════════════════════════════════════════
// CHAPGA SURIB O'CHIRISH
// ═════════════════════════════════════════
const SwipeRow = ({ children, onDelete, label, disabled }) => {
  const th   = useTheme();
  const [dx,sDx]   = useState(0);
  const [arm,sArm] = useState(false);
  const [dying,sDying] = useState(false);
  const x0   = useRef(0);
  const y0   = useRef(0);
  const live = useRef(false);
  const axis = useRef(null);
  const armR = useRef(false);
  const FULL = 200;

  const start = e => {
    if (disabled) return;
    x0.current = e.touches[0].clientX;
    y0.current = e.touches[0].clientY;
    live.current = true; axis.current = null;
  };

  const move = e => {
    if (!live.current) return;
    const dX = e.touches[0].clientX - x0.current;
    const dY = e.touches[0].clientY - y0.current;
    if (!axis.current) {
      if (Math.abs(dX) < 6 && Math.abs(dY) < 6) return;
      axis.current = Math.abs(dX) > Math.abs(dY) ? "x" : "y";
      if (axis.current === "y") { live.current = false; return; }
    }
    e.preventDefault();
    let v = dX * 0.82;
    if (v > 0) v = v * 0.22;
    if (v < -FULL) v = -FULL + (v + FULL) * 0.28;
    sDx(v);
    const nowArm = v <= -FULL + 6;
    if (nowArm !== armR.current) {
      armR.current = nowArm;
      sArm(nowArm);
      if (nowArm) hap.press();
    }
  };

  const end = () => {
    if (!live.current) return;
    live.current = false;
    if (armR.current) {
      hap.heavy();
      armR.current = false; sArm(false);
      sDying(true); sDx(0);
      setTimeout(onDelete, 210);
    } else {
      sDx(0);
    }
  };

  // tugma orqali o'chirish — surish bilan bir xil natija
  const p = Math.min(1, Math.abs(dx)/FULL);

  return (
    <div className="swipeWrap" style={{ position:"relative" }}>
      <div style={{
        position:"absolute", inset:0, borderRadius:13, pointerEvents:"none",
        opacity: dying ? 0 : Math.max(0, Math.min(1, (Math.abs(dx) - FULL*0.5) / (FULL*0.32))),
        background: arm
          ? `linear-gradient(90deg, ${th.err}47 0%, ${th.err}80 100%)`
          : `linear-gradient(90deg, ${th.err}14 0%, ${th.err}2e 100%)`,
        border:`1px solid ${arm ? th.err+"8c" : th.err+"33"}`,
        boxShadow: arm ? `inset 0 0 26px ${th.err}38` : "none",
        display:"flex", alignItems:"center", justifyContent:"flex-end",
        paddingRight:20, gap:9,
        transition:"background .16s, border-color .16s, box-shadow .16s, opacity .15s",
      }}>
        <span style={{
          fontSize:11.5, fontWeight:700, letterSpacing:"0.07em", textTransform:"uppercase",
          color:th.err, whiteSpace:"nowrap",
          opacity: arm ? 1 : 0,
          transform:`translateX(${arm?0:10}px)`,
          transition:"opacity .18s, transform .22s cubic-bezier(.2,.9,.3,1)",
        }}>{arm ? t("common.release") : t("swipe.hint")}</span>

        <span className={arm?"revealPulse":undefined} style={{
          width:32, height:32, borderRadius:10, flexShrink:0,
          background: arm ? `${th.err}4d` : `${th.err}1f`,
          border:`1px solid ${th.err}${arm?"99":"40"}`,
          display:"flex", alignItems:"center", justifyContent:"center",
          opacity: Math.max(0, Math.min(1, (Math.abs(dx) - FULL*0.68) / (FULL*0.2))),
          transform:`scale(${0.72 + p*0.28})`,
          transition:"background .16s, border-color .16s, transform .12s",
        }}>
          <Ic.Trash s={15} c={th.err}/>
        </span>
      </div>

      <div className="swipeRow"
        role="group" aria-label={label || t("common.delete")}
        onTouchStart={start} onTouchMove={move} onTouchEnd={end} onTouchCancel={end}
        style={{
          transform:`translateX(${dx}px)`,
          transition: live.current ? "none" : dying ? "transform .2s cubic-bezier(.3,.9,.3,1)" : "transform .38s cubic-bezier(.24,.92,.28,1)",
          touchAction:"pan-y",
        }}>
        {children}
      </div>
    </div>
  );
};

// ═════════════════════════════════════════
// QAYTARISH PANELI
// ═════════════════════════════════════════
const UndoBar = ({ item, onUndo, onClose }) => {
  const th = useTheme();
  const SEC = 3;
  const [left,sLeft] = useState(SEC);
  const [out,sOut]   = useState(false);

  useEffect(()=>{
    sOut(false); sLeft(SEC);
    const t0 = Date.now();
    const iv = setInterval(()=>{
      const r = Math.max(0, SEC - (Date.now()-t0)/1000);
      sLeft(r);
      if (r <= 0) { clearInterval(iv); sOut(true); setTimeout(onClose, 230); }
    }, 60);
    return ()=>clearInterval(iv);
  }, [item.id]);

  const R = 14, C = 2*Math.PI*R, p = left/SEC;
  const warn = left <= 1;
  const tone = warn ? th.err : th.acc;

  return (
    <div style={{
      position:"fixed", left:0, right:0, zIndex:9400,
      bottom:"calc(112px + env(safe-area-inset-bottom,0px))",
      display:"flex", justifyContent:"center", padding:"0 16px", pointerEvents:"none",
    }}>
      <div className={out?"undoOut":"undoIn"} style={{
        pointerEvents:"auto",
        display:"flex", alignItems:"center", gap:12,
        padding:"9px 10px 9px 12px", borderRadius:17, width:"100%", maxWidth:390,
        background: th.id==="light" ? "rgba(255,255,255,0.97)"
                  : th.id==="stitch" ? "rgba(9,17,34,0.95)" : "rgba(15,15,17,0.95)",
        backdropFilter:"blur(26px) saturate(1.7)", WebkitBackdropFilter:"blur(26px) saturate(1.7)",
        border:`1px solid ${th.b1}`,
        boxShadow: th.id==="light"
          ? "0 8px 30px rgba(16,19,26,0.16), 0 2px 6px rgba(16,19,26,0.07)"
          : `0 14px 44px rgba(0,0,0,0.6), inset 0 1px 0 ${th.b2}`,
      }}>
        <span style={{ position:"relative", width:36, height:36, flexShrink:0, display:"block" }}>
          <svg width="36" height="36" style={{ transform:"rotate(-90deg)", display:"block" }}>
            <circle cx="18" cy="18" r={R} fill="none" stroke={th.b1} strokeWidth="2.4"/>
            <circle cx="18" cy="18" r={R} fill="none" stroke={tone} strokeWidth="2.4"
              strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C*(1-p)}
              style={{ transition:"stroke-dashoffset .09s linear, stroke .25s" }}/>
          </svg>
          <span style={{
            position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center",
            fontFamily:"'SF Mono','Fira Code',monospace", fontSize:13, fontWeight:700,
            color: tone, transition:"color .25s",
          }}>{Math.ceil(left)}</span>
        </span>

        <span style={{ flex:1, minWidth:0 }}>
          <span style={{ display:"block", fontSize:13.5, fontWeight:600, color:th.t1, letterSpacing:"-0.01em",
            overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.title}</span>
          {item.note && <span style={{ display:"block", fontSize:11.5, color:th.t3, marginTop:1.5,
            fontFamily:"'SF Mono',monospace", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.note}</span>}
        </span>

        <button onClick={()=>{ hap.ok(); sOut(true); onUndo(); setTimeout(onClose, 200); }}
          style={{
            flexShrink:0, display:"inline-flex", alignItems:"center", gap:6,
            padding:"9px 14px", borderRadius:12, cursor:"pointer",
            fontFamily:"inherit", fontSize:12.5, fontWeight:700, letterSpacing:"-0.01em",
            background: th.acc, color: th.accTxt, border:`1px solid ${th.accBd}`,
            WebkitTapHighlightColor:"transparent", touchAction:"manipulation",
          }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={th.accTxt}
            strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 9h11a5 5 0 010 10h-3"/><path d="M8 5L4 9l4 4"/>
          </svg>
          Qaytarish
        </button>
      </div>
    </div>
  );
};



// ═════════════════════════════════════════
// PREMIUM BAYRAMI
// ═════════════════════════════════════════
const CONF_COLORS = ["#FFD166","#06D6A0","#4CC9F0","#F72585","#B5179E","#FFFFFF"];

const Confetti = ({ n=54 }) => {
  const bits = useRef(null);
  if (!bits.current) {
    bits.current = Array.from({length:n}, (_,i)=>{
      const ang = (-Math.PI/2) + (Math.random()-0.5) * Math.PI * 1.25;
      const dist = 180 + Math.random()*320;
      return {
        i,
        cx: Math.cos(ang) * dist,
        cy: Math.sin(ang) * dist + 260 + Math.random()*160,   // tortishish
        cr: `${(Math.random()*1080-540)}deg`,
        cs: (0.4 + Math.random()*0.5).toFixed(2),
        cd: `${(1.5 + Math.random()*1.1).toFixed(2)}s`,
        w:  4 + Math.random()*5,
        h:  7 + Math.random()*10,
        col: CONF_COLORS[i % CONF_COLORS.length],
        round: Math.random() > 0.6,
        delay: `${(Math.random()*0.32).toFixed(2)}s`,
      };
    });
  }
  return (
    <span style={{ position:"absolute", left:"50%", top:"46%", pointerEvents:"none", zIndex:3 }}>
      {bits.current.map(b=>(
        <span key={b.i} className="conf" style={{
          position:"absolute", left:0, top:0,
          width:b.w, height:b.round ? b.w : b.h,
          borderRadius: b.round ? "50%" : 1.5,
          background:b.col,
          "--cx":`${b.cx}px`, "--cy":`${b.cy}px`, "--cr":b.cr, "--cs":b.cs, "--cd":b.cd,
          animationDelay:b.delay,
        }}/>
      ))}
    </span>
  );
};

const Gala = ({ total, onClose }) => {
  const th = useTheme();
  const [out,sOut] = useState(false);

  useEffect(()=>{
    hap.ok();
    const a = setTimeout(()=>hap.press(), 260);
    // 3.6 s o'qish uchun yetarli emas edi (xabarni o'qib bo'lmay qolardi)
    const b = setTimeout(()=>{ sOut(true); setTimeout(onClose, 320); }, 5200);
    return ()=>{ clearTimeout(a); clearTimeout(b); };
  },[]);

  return (
    <div onClick={()=>{ sOut(true); setTimeout(onClose,300); }}
      style={{
        position:"fixed", inset:0, zIndex:9600, overflow:"hidden", cursor:"pointer",
        background: th.id==="light" ? "rgba(244,245,247,0.92)" : "rgba(6,6,9,0.9)",
        backdropFilter:"blur(18px)", WebkitBackdropFilter:"blur(18px)",
        display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
        opacity: out ? 0 : 1, transition:"opacity .3s",
      }}>

      {/* nur */}
      <span className="glowUp" style={{ position:"absolute", inset:0, pointerEvents:"none",
        background:`radial-gradient(ellipse 60% 40% at 50% 44%, ${th.ok}2e 0%, transparent 65%)` }}/>

      <Confetti/>

      {/* markaz */}
      <span style={{ position:"relative", width:104, height:104, display:"flex",
        alignItems:"center", justifyContent:"center", marginBottom:26 }}>
        <span className="burstRing" style={{ position:"absolute", inset:0, borderRadius:"50%",
          border:`2px solid ${th.ok}` }}/>
        <span className="burstRing" style={{ position:"absolute", inset:0, borderRadius:"50%",
          border:`1.5px solid ${th.acc}`, animationDelay:".14s" }}/>

        <span className="starPop2" style={{
          width:88, height:88, borderRadius:30, display:"flex", alignItems:"center", justifyContent:"center",
          background:`linear-gradient(145deg, ${th.ok}2e, ${th.ok}0f)`,
          border:`2px solid ${th.ok}`,
          boxShadow:`0 0 46px ${th.ok}55, inset 0 0 26px ${th.ok}1f`,
        }}>
          <svg width="42" height="42" viewBox="0 0 24 24" fill={th.ok} stroke="none">
            <path d="M12 2.2c.75 4.9 3 7.15 7.9 7.9-4.9.75-7.15 3-7.9 7.9-.75-4.9-3-7.15-7.9-7.9 4.9-.75 7.15-3 7.9-7.9z"
              transform="translate(0,2)"/>
          </svg>
        </span>
      </span>

      <p className="rise2" style={{ animationDelay:".3s", fontSize:11, fontWeight:700, color:th.ok,
        letterSpacing:"0.22em", textTransform:"uppercase", marginBottom:10 }}>Bajarildi</p>

      <h2 className="rise2" style={{ animationDelay:".38s", fontSize:30, fontWeight:800,
        letterSpacing:"-0.04em", lineHeight:1, textAlign:"center" }}>
        {total} ta premium
      </h2>

      <p className="rise2" style={{ animationDelay:".46s", fontSize:14, color:th.t3,
        marginTop:10, textAlign:"center", maxWidth:250, lineHeight:1.55 }}>
        {t("gala.note")}
      </p>

      <span className="rise2" style={{ animationDelay:".58s", marginTop:26 }}>
        <Btn sz="lg" onClick={()=>{ sOut(true); setTimeout(onClose,300); }}>Davom etish</Btn>
      </span>
    </div>
  );
};

// ═════════════════════════════════════════
// PREMIUM OLISH
// ═════════════════════════════════════════
const LANE_STEPS = () => [
  { key:"num",   label:t("lane.num"),     note:t("lane.n1") },
  { key:"code",  label:t("lane.code"),    note:t("lane.n2") },
  { key:"login", label:t("lane.login"),   note:t("lane.n3") },
  { key:"card",  label:t("lane.card"),    note:t("lane.n4") },
  { key:"done",  label:t("lane.premium"), note:t("lane.n5") },
];

const Lane = ({ lane }) => {
  const th = useTheme();
  const b  = gB(lane.bankId);
  const at = lane.step;
  const STEPS = LANE_STEPS();
  const done = at >= STEPS.length;
  const bad  = lane.failed;

  return (
    <div style={{
      ...glass(th,0.04), borderRadius:15, padding:"12px 13px", position:"relative", overflow:"hidden",
      border:`1px solid ${done ? th.ok+"38" : bad ? th.err+"38" : th.b1}`,
    }}>
      {!done && !bad && (
        <span style={{ position:"absolute", top:0, left:0, right:0, height:1.5, overflow:"hidden" }}>
          <span className="scan" style={{ display:"block", width:"36%", height:"100%",
            background:`linear-gradient(90deg,transparent,${th.acc},transparent)` }}/>
        </span>
      )}

      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
        <Ava bid={lane.bankId} n={30}/>
        <div style={{ flex:1, minWidth:0 }}>
          <p style={{ fontSize:13, fontWeight:600, letterSpacing:"-0.01em" }}>{b.name}</p>
          <p style={{ fontSize:11, color:th.t3, marginTop:1, fontFamily:"'SF Mono',monospace" }}>•••• {lane.card}</p>
        </div>
        {done ? <Tag v="ok">Premium</Tag>
          : bad ? <Tag v="err">Xato</Tag>
          : <span style={{ fontFamily:"'SF Mono',monospace", fontSize:11, color:th.t3 }}>{at+1}/5</span>}
      </div>

      <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:10,
        padding:"7px 10px", borderRadius:9, background:th.s1, border:`1px solid ${th.b1}` }}>
        <Ic.Sig s={12} c={lane.num ? th.acc : th.t4}/>
        <span style={{ flex:1, fontFamily:"'SF Mono','Fira Code',monospace", fontSize:12.5,
          color: lane.num ? th.t1 : th.t4, letterSpacing:"0.03em" }}>
          {lane.num || "raqam kutilmoqda…"}
        </span>
        {lane.code && (
          <span style={{ fontFamily:"'SF Mono',monospace", fontSize:12, fontWeight:700, color:th.acc,
            letterSpacing:"0.14em" }}>{lane.code}</span>
        )}
      </div>

      <div style={{ display:"flex", alignItems:"center" }}>
        {STEPS.map((st,i)=>{
          const passed = i < at;
          const now    = i === at && !done && !bad;
          const tone   = bad && i===at ? th.err : passed ? th.ok : now ? th.acc : th.b2;
          return (
            <div key={st.key} style={{ display:"flex", alignItems:"center", flex:i<4?1:"none" }}>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4, position:"relative" }}>
                {now && <span className="ping" style={{ position:"absolute", top:0, width:11, height:11, borderRadius:"50%", background:th.acc }}/>}
                <span style={{ width:11, height:11, borderRadius:"50%", position:"relative",
                  background: (passed||now||(bad&&i===at)) ? tone : "transparent",
                  border:`1.5px solid ${tone}`, transition:"all .3s" }}/>
                <span style={{ fontSize:8.5, fontWeight:now?700:500, letterSpacing:"0.02em",
                  color: passed ? th.ok : now ? th.acc : th.t4 }}>{st.label}</span>
              </div>
              {i<4 && <span style={{ flex:1, height:1.5, margin:"0 4px", marginBottom:13, borderRadius:1,
                background: passed ? th.ok : th.b1, transition:"background .3s" }}/>}
            </div>
          );
        })}
      </div>

      <p style={{ fontSize:10.5, color: bad ? th.err : done ? th.ok : th.t3, marginTop:9 }}>
        {bad ? t("lane.rejected") : done ? t("lane.activated") : STEPS[at]?.note}
      </p>
    </div>
  );
};

const PremiumPage = ({ goto }) => {
  const th = useTheme();
  const toast = useToast();
  const { account, bots=[], people, setPeople, role, bump, cfg } = useData();

  const wired = bots.filter(b=>b.connected);
  const isWorker = role === "worker";
  const ready = isWorker ? true : (account && wired.length>0);

  const [step,sStep]   = useState(1);
  const [pid,sPid]     = useState(null);
  const [want,sWant]   = useState("");
  const [warn,sWarn]   = useState("");
  const [picks,sPicks] = useState({});
  const [lanes,sLanes] = useState([]);
  const [gala,sGala]   = useState(0);   // bayram ochiq bo'lsa — nechta

  const who = people.find(p=>p.id===pid);
  const nameOf = c => BL.find(b=>b.id===c.bankId)?.name || c.bankId;
  // backend'dan kelgan shaxsda `cards` yo'q bo'lishi mumkin —
  // shuning uchun har doim zaxira massiv bilan ishlaymiz
  const groups = p => {
    const cards = p?.cards || [];
    return [...new Set(cards.map(nameOf))].map(name=>({
      name, id: BL.find(b=>b.name===name)?.id || name,
      cards: cards.filter(c=>nameOf(c)===name && cardHealth(c).left>0 && cardHealth(c).state!=="expired"),
    })).filter(g=>g.cards.length>0);
  };

  const avail = who ? groups(who) : [];
  // "Bir vaqtda oqim" sozlamasi — fayl kartalar soni bilan birga
  // eng katta qat'iymni beradi (avval butunlay ishlatilmasdi)
  const cap   = Math.max(1, cfg.streams || 8);
  const max   = Math.min(avail.length, cap);
  const n     = Math.min(parseInt(want||"0",10)||0, max);
  const chosen= avail.slice(0, n);

  const setQty = v => {
    const q = v.replace(/\D/g,"").slice(0,2);
    sWant(q);
    const num = parseInt(q||"0",10);
    if (num > max) { hap.warn(); sWarn(t("premium.maxOnly",{n:max})); } else sWarn("");
  };

  const toCards = () => {
    const init = {};
    chosen.forEach(g => { init[g.id] = g.cards[0].id; });
    sPicks(init);
    sStep(3);
  };

  const [launchErr, sLaunchErr] = useState(null);

  const STATUS_STEP = {
    queued: 0, getting_number: 0,
    logging_in: 1, got_code: 1,
    logging_full: 2,
    premium_pending: 3, otp_waiting: 3,
    checking: 4,
    confirmed: 5, failed: 4,
    login_failed: 4, waiting_stuck: 4,
  };

  const pollStop = useRef(null);

  // ══════════════════════════════════════════════════════════
  // REAL VAQT: WebSocket (polling o'rniga)
  // ══════════════════════════════════════════════════════════
  // Backendda /ws/orders/{orderId} bor va har bir Lane holati
  // o'zgarganda DARHOL xabar beradi. Polling (har 1.5 s so'rov)
  // o'rniga endi shu ishlaydi — kamroq yuk, tezroq javob.
  //
  // MUHIM: backend endi autentifikatsiya talab qiladi —
  // ?token=<initData> (brauzer WebSocket ga header qo'sha olmaydi).
  // Token yo'q bo'lsa yoki server rad etsa — eski usulga
  // (polling) QAYTAMIZ, ya'ni ilova hech qachon jonli qolmaydi.
  const wsRef = useRef(null);

  // serverdan kelgan holatni ekranga ko'chirish.
  // true = barcha lane tugadi (yoki hech qanday lane yo'q)
  const applyRemote = (lanesRemote, L, pid2, bumpFn) => {
    setLanes(prev => prev.map((l, idx) => {
      const remote = lanesRemote?.[idx];
      if (!remote) return l;
      const failed = ["failed","login_failed","waiting_stuck"].includes(remote.status);
      return {
        ...l,
        num: remote.phoneNumber || l.num,
        step: STATUS_STEP[remote.status] ?? l.step,
        failed,
      };
    }));

    const allDone = (lanesRemote || []).every(l =>
      ["confirmed","failed","login_failed","waiting_stuck"].includes(l.status));
    if (!allDone || !lanesRemote?.length) return false;

    lanesRemote.forEach((remote, idx) => {
      if (remote.status !== "confirmed") return;
      hap.ok(); bumpFn?.();
      const cid = L[idx]?.cardId;
      if (!cid) return;
      setPeople(list => list.map(pr => pr.id===pid2 ? {
        ...pr, cards: (pr.cards||[]).map(cd => cd.id===cid ? { ...cd, used:(cd.used||0)+1 } : cd)
      } : pr));
    });

    // buyurtma tugadi — saqlangan "faol buyurtma"ni tozalaymiz
    try { localStorage.removeItem("premolux_active_order"); } catch (e) { logErr("order/clear", e); }
    return true;
  };

  const startWs = (orderId, L, pid2, onDone) => {
    const token = window.Telegram?.WebApp?.initData;
    if (!token || typeof WebSocket === "undefined") return false;

    let ws;
    try {
      ws = new WebSocket(`${WS_BASE}/ws/orders/${orderId}?token=${encodeURIComponent(token)}`);
    } catch { return false; }
    wsRef.current = ws;

    ws.onmessage = ev => {
      let msg;
      try { msg = JSON.parse(ev.data); } catch { return; }
      if (!Array.isArray(msg?.lanes)) return;
      if (applyRemote(msg.lanes, L, pid2, bump)) onDone?.();
    };

    // ulanish uzilsa yoki server rad etsa — polling'ga qaytamiz
    ws.onerror = () => {};
    ws.onclose = () => {
      if (wsRef.current === ws) wsRef.current = null;
      startPolling(orderId, L, pid2);
    };
    return true;
  };

  const startPolling = (orderId, L, pid2) => {
    // avvalgi tsiklni to'xtatamiz — aks holda har sahifaga kirgan
    // o'ta bitta so'rovlar ketma-ket yug'ib, eski holat ustiga yozadi
    pollStop.current?.();
    let cancelled = false;
    let timer = null;
    const poll = async () => {
      if (cancelled) return;
      try {
        const data = await api.get(`/orders/${orderId}`);

        if (cancelled) return;

        if (applyRemote(data?.lanes, L, pid2, bump)) {
          clearTimeout(timer);
          return;
        }
      } catch (e) {
        // tarmoq uzilib qolsa — jimgina o'tib ketamiz, keyin urinib ko'ramiz
        logErr("orders/poll", e);
      }
      if (!cancelled) timer = setTimeout(poll, 1500);
    };
    poll();
    const stop = () => { cancelled = true; clearTimeout(timer); };
    pollStop.current = stop;
    return stop;
  };

  // sahifa yopilganda tsikl to'xtaydi
  useEffect(() => () => {
    pollStop.current?.(); pollStop.current = null;
    try { wsRef.current?.close(); } catch (e) { logErr("ws/close", e); }
    wsRef.current = null;
  }, []);

  // MUHIM: sahifadan chiqib qaytilganda (yoki yangilanganda) FAOL
  // buyurtma bo'lsa — TIKLAYMIZ, "shaxs tanlash"ga qaytarib
  // yubormaymiz. localStorage'da saqlangan orderId orqali davom etadi.
  useEffect(() => {
    let raw;
    try { raw = localStorage.getItem("premolux_active_order"); } catch { raw = null; }
    if (!raw) return;
    let saved;
    try { saved = JSON.parse(raw); } catch { return; }
    if (!saved?.orderId || !saved?.lanes?.length) return;

    sPid(saved.personId);
    sLanes(saved.lanes);
    sStep(4);
    if (!startWs(saved.orderId, saved.lanes, saved.personId))
      startPolling(saved.orderId, saved.lanes, saved.personId);
  }, []);

  const launch = async () => {
    sLaunchErr(null);
    let orderId;
    try {
      const res = await api.post("/orders/start", {
        personId: who?.id,
        banks: chosen.map(g=>({ bankId:g.id, cardId: picks[g.id] || g.cards[0].id })),
        // sozlamalar endi haqiqiy — server ularga qarab ishlaydi
        maxRetries: cfg.retry ?? 1,
        cardCap:    cfg.cardCap ?? 3,
      });
      orderId = res?.orderId;
    } catch (e) {
      hap.err(); sLaunchErr(e.message); toast({kind:"err",title:t("premium.flowErr"),note:e.message});
      return;
    }

    const pid2 = who?.id;
    const L = chosen.map((g,i)=>{
      const cd = g.cards.find(c=>c.id===picks[g.id]) || g.cards[0];
      return { key:i, bankId:g.id, cardId:cd.id,
        card: last4(cd.num),
        step:0, num:"", code:"", failed:false };
    });
    sLanes(L);
    sStep(4);
    hap.heavy();
    // real vaqt kanalini ochamiz (backend rad etsa — polling'ga qaytamiz)
    if (!startWs(orderId, L, pid2)) startPolling(orderId, L, pid2);
    toast({kind:"info",title:t("premium.started",{n:L.length}),note:who?.name,ms:3200});

    if (!orderId) return;

    // MUHIM: buyurtmani localStorage'ga saqlaymiz — boshqa sahifaga
    // o'tib qaytilsa yoki sahifa yangilansa ham jarayon YO'QOLMAYDI
    try {
      localStorage.setItem("premolux_active_order", JSON.stringify({
        orderId, personId: pid2, lanes: L,
      }));
    } catch (e) { logErr("order/save", e); }

    startPolling(orderId, L, pid2);
  };

  const reset = () => {
    sStep(1); sPid(null); sWant(""); sWarn(""); sPicks({}); sLanes([]);
    try { localStorage.removeItem("premolux_active_order"); } catch (e) { logErr("order/clear", e); }
  };

  const finished = lanes.length>0 && lanes.every(l=>l.step>=5 || l.failed);
  const okCount  = lanes.filter(l=>l.step>=5).length;

  const told = useRef(false);
  useEffect(()=>{
    if (finished && !told.current) {
      told.current = true;
      if (okCount === lanes.length && lanes.length > 0) {
        setTimeout(()=>sGala(lanes.length), 420);      // hammasi o'tdi — bayram
      } else {
        toast({ kind: okCount ? "warn" : "err",
          title: t("premium.getResult",{n:okCount,t:lanes.length}),
          note: t("premium.rateErr",{n:lanes.length-okCount}), ms:3400 });
      }
    }
    if (!finished) told.current = false;
  }, [finished]);

  if (!ready) return (
    <div style={{ display:"flex", flexDirection:"column", gap:18, maxWidth:680 }}>
      <div>
        <h1 style={{ fontSize:24, fontWeight:800, letterSpacing:"-0.03em", lineHeight:1.1 }}>{t("premium.h1")}</h1>
        <p style={{ fontSize:13, color:th.t3, marginTop:3 }}>{t("premium.notReadySub")}</p>
      </div>
      <div style={{ ...glass(th,0.04), borderRadius:16, padding:"20px 18px", display:"flex", flexDirection:"column", gap:14 }}>
        <span style={{ width:46, height:46, borderRadius:14, background:`${th.warn}1a`,
          border:`1px solid ${th.warn}38`, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <Ic.Lock s={20} c={th.warn}/>
        </span>
        <div>
          <p style={{ fontWeight:700, fontSize:15.5, letterSpacing:"-0.02em" }}>Tizim tayyor emas</p>
          <p style={{ fontSize:13, color:th.t3, marginTop:4, lineHeight:1.55 }}>{t("premium.notReadyNote")}</p>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {[
            { ok: !!account,      label:t("premium.accessAcc"), note: account || t("premium.notConn") },
            { ok: wired.length>0, label:t("premium.numBot"),   note: wired.length ? wired.map(b=>b.username).join(", ") : t("premium.notConn") },
          ].map(x=>(
            <div key={x.label} style={{ display:"flex", alignItems:"center", gap:10, padding:"11px 13px",
              borderRadius:11, background:th.s1, border:`1px solid ${x.ok?th.ok+"33":th.b1}` }}>
              <span style={{ width:20, height:20, borderRadius:"50%", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center",
                background: x.ok ? `${th.ok}26` : th.s2, border:`1px solid ${x.ok?th.ok+"4d":th.b2}` }}>
                {x.ok ? <Ic.Check s={10} c={th.ok}/> : <span style={{ width:5, height:5, borderRadius:"50%", background:th.t4 }}/>}
              </span>
              <span style={{ flex:1, fontSize:13, fontWeight:600 }}>{x.label}</span>
              <span style={{ fontSize:11.5, color:x.ok?th.ok:th.t4, fontFamily:"'SF Mono',monospace",
                maxWidth:130, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{x.note}</span>
            </div>
          ))}
        </div>
        <Btn full sz="lg" onClick={()=>goto("bots")}>{t("premium.toBots")}</Btn>
      </div>
    </div>
  );

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:18, maxWidth:680 }}>
      {gala>0 && <Gala total={gala} onClose={()=>sGala(0)}/>}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:800, letterSpacing:"-0.03em", lineHeight:1.1 }}>{t("premium.h1")}</h1>
          <p style={{ fontSize:13, color:th.t3, marginTop:3 }}>
            {step===1 ? t("premium.s1")
             : step===2 ? t("premium.s2")
             : step===3 ? t("premium.s3")
             : t("premium.s4")}
          </p>
        </div>
        {step>1 && step<4 && <Btn v="ghost" sz="sm" onClick={()=>sStep(step-1)}>{t("common.back")}</Btn>}
        {step===4 && finished && <Btn v="ghost" sz="sm" onClick={reset}>{t("premium.new")}</Btn>}
        {step===4 && !finished && (
          <Btn v="ghost" sz="sm" onClick={()=>{
            hap.warn();
            toast({kind:"warn",title:t("premium.cancelled"),note:t("premium.cancelledNote")});
            reset();
          }}>{t("premium.cancel")}</Btn>
        )}
      </div>

      {isWorker && step===1 && (
        <div style={{ display:"flex", alignItems:"center", gap:9, padding:"10px 13px", borderRadius:11,
          background:th.s1, border:`1px solid ${th.b1}` }}>
          <Ic.Info s={14} c={th.t3}/>
          <span style={{ fontSize:12, color:th.t3 }}>Yuqoridagi hisob va bot orqali ishlaysiz</span>
        </div>
      )}

      <div style={{ display:"flex", alignItems:"center" }}>
        {tArray("premium.step").map((lb,i)=>{
          const k = i+1, passed = step>k, now = step===k;
          return (
            <div key={lb} style={{ display:"flex", alignItems:"center", flex:i<3?1:"none" }}>
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <span style={{ width:19, height:19, borderRadius:"50%", flexShrink:0,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:10, fontWeight:700, transition:"all .25s",
                  background: passed ? th.ok : now ? th.acc : "transparent",
                  border:`1.5px solid ${passed ? th.ok : now ? th.acc : th.b2}`,
                  color: (passed||now) ? th.accTxt : th.t4 }}>
                  {passed ? <Ic.Check s={9} c={th.accTxt}/> : k}
                </span>
                <span style={{ fontSize:11, fontWeight:now?700:400,
                  color: passed ? th.ok : now ? th.t1 : th.t4 }}>{lb}</span>
              </div>
              {i<3 && <span style={{ flex:1, height:1, margin:"0 7px",
                background: passed ? th.ok : th.b1, transition:"background .3s" }}/>}
            </div>
          );
        })}
      </div>

      {step===1 && (
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {!people.some(p=>groups(p).length>0) && (
            <Empty art="card"
              title={t("premium.noCard")}
              note={t("premium.noCardNote")}
              action={t("premium.toCards")}
              onAction={()=>goto("cards")}/>
          )}
          {people.map(p=>{
            const gs = groups(p);
            const empty = gs.length===0;
            const on = pid===p.id;
            return (
              <button key={p.id} disabled={empty}
                onClick={()=>{ sPid(p.id); sWant(""); sWarn(""); sStep(2); }}
                style={{
                  display:"flex", alignItems:"center", gap:12, padding:"13px 14px",
                  borderRadius:14, cursor: empty ? "not-allowed" : "pointer", fontFamily:"inherit",
                  textAlign:"left", opacity: empty ? .4 : 1,
                  background: on ? th.accSub : th.s1,
                  border:`1px solid ${on ? th.accBd : th.b1}`,
                  transition:"all .16s",
                }}>
                <span style={{ width:38, height:38, borderRadius:12, flexShrink:0,
                  background:th.s2, border:`1px solid ${th.b1}`,
                  display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <Ic.User s={16} c={th.t3}/>
                </span>
                <span style={{ flex:1, minWidth:0 }}>
                  <span style={{ display:"block", fontSize:14, fontWeight:600, letterSpacing:"-0.01em" }}>{p.name}</span>
                  <span style={{ display:"block", fontSize:11.5, color:th.t3, marginTop:2 }}>
                    {empty ? t("premium.noCardHere") : tp("premium.banksCards", gs.length, { m: gs.reduce((a,g)=>a+g.cards.length,0) })}
                  </span>
                </span>
                <span style={{ display:"flex", marginRight:2 }}>
                  {gs.slice(0,3).map((g,i)=><span key={g.id} style={{ marginLeft:i?-5:0 }}><Ava bid={g.id} n={21}/></span>)}
                </span>
                <Ic.Right s={13} c={th.t3}/>
              </button>
            );
          })}
        </div>
      )}

      {step===2 && who && (
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div style={{ ...glass(th,0.04), borderRadius:16, padding:"18px 16px" }}>
            <p style={{ fontSize:11.5, color:th.t3, marginBottom:3 }}>{who.name}</p>
            <p style={{ fontSize:13.5, color:th.t2, marginBottom:16 }}>
              Bo'sh karta bor banklar: <b style={{ color:th.t1, fontFamily:"'SF Mono',monospace" }}>{max}</b>
            </p>

            <input value={want} onChange={e=>setQty(e.target.value)} inputMode="numeric"
              placeholder="0" autoFocus
              style={{ fontFamily:"'SF Mono','Fira Code',monospace", fontSize:44, fontWeight:800,
                textAlign:"center", padding:"14px 0", letterSpacing:"-0.02em" }}/>

            {warn && (
              <div className="shake" style={{ marginTop:11 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 13px", borderRadius:11,
                  background:`${th.warn}1a`, border:`1px solid ${th.warn}3d` }}>
                  <Ic.Warn s={14} c={th.warn}/>
                  <span style={{ fontSize:13, color:th.warn, fontWeight:600 }}>{warn}</span>
                </div>
              </div>
            )}

            <div style={{ display:"flex", gap:7, marginTop:14, flexWrap:"wrap" }}>
              {Array.from({length:Math.min(max,8)},(_,i)=>i+1).map(v=>(
                <button key={v} onClick={()=>setQty(String(v))} style={{
                  minWidth:42, padding:"8px 0", flex:1, borderRadius:10, cursor:"pointer", fontFamily:"inherit",
                  fontSize:14, fontWeight:700,
                  background: String(v)===want ? th.accSub : th.s1,
                  border:`1px solid ${String(v)===want ? th.accBd : th.b1}`,
                  color: String(v)===want ? th.acc : th.t2, transition:"all .15s",
                }}>{v}</button>
              ))}
              {max>8 && (
                <button onClick={()=>setQty(String(max))} style={{
                  padding:"8px 14px", borderRadius:10, cursor:"pointer", fontFamily:"inherit",
                  fontSize:13, fontWeight:700, background:th.s1, border:`1px solid ${th.b1}`, color:th.t2,
                }}>Max {max}</button>
              )}
            </div>
          </div>

          <Btn full sz="lg" disabled={n<1} onClick={toCards}>
            {n>0 ? t("premium.pickCards",{n}) : t("premium.enterQty")}
          </Btn>
        </div>
      )}

      {step===3 && (
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {chosen.map(g=>(
              <div key={g.id} style={{ ...glass(th,0.04), borderRadius:14, padding:"12px 13px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom: g.cards.length>1 ? 11 : 0 }}>
                  <Ava bid={g.id} n={32}/>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontSize:13.5, fontWeight:600, letterSpacing:"-0.01em" }}>{g.name}</p>
                    <p style={{ fontSize:11, color:th.t3, marginTop:1 }}>
                      {g.cards.length>1 ? t("premium.pickOne",{n:g.cards.length}) : t("premium.oneCard")}
                    </p>
                  </div>
                  {g.cards.length===1 && (
                    <span style={{ fontFamily:"'SF Mono',monospace", fontSize:12, color:th.acc }}>
                      •••• {last4(g.cards[0].num)}
                    </span>
                  )}
                </div>

                {g.cards.length>1 && (
                  <div style={{ display:"flex", gap:7, flexWrap:"wrap" }}>
                    {g.cards.map(c=>{
                      const on = picks[g.id]===c.id;
                      const t4 = last4(c.num);
                      return (
                        <button key={c.id} onClick={()=>sPicks(x=>({...x,[g.id]:c.id}))} style={{
                          display:"inline-flex", alignItems:"center", gap:6,
                          padding:"7px 12px", borderRadius:999, cursor:"pointer",
                          fontSize:12.5, fontWeight:on?700:500,
                          fontFamily:"'SF Mono','Fira Code',monospace",
                          background: on ? th.accSub : th.s1,
                          border:`1px solid ${on ? th.accBd : th.b1}`,
                          color: on ? th.acc : th.t2, transition:"all .15s",
                        }}>
                          {on && <Ic.Check s={11} c={th.acc}/>}
                          •••• {t4}
                          <span style={{ opacity:.6, fontSize:10.5 }}>{cardHealth(c).left} qoldi</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>

          {launchErr && <Err msg={launchErr}/>}
          <Btn full sz="lg" onClick={launch}>
            <Ic.Play s={13} c={th.accTxt}/> {chosen.length} ta oqimni ishga tushirish
          </Btn>
        </div>
      )}

      {step===4 && (
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div style={{ ...glass(th,0.05), borderRadius:16, padding:"14px 16px",
            display:"flex", alignItems:"center", gap:13,
            border:`1px solid ${finished ? th.ok+"38" : th.b2}` }}>
            <span style={{ width:42, height:42, borderRadius:13, flexShrink:0,
              display:"flex", alignItems:"center", justifyContent:"center",
              background: finished ? `${th.ok}1f` : th.accSub,
              border:`1px solid ${finished ? th.ok+"40" : th.accBd}` }}>
              {finished ? <Ic.Check s={19} c={th.ok}/> : <Ic.Spin s={18} c={th.acc}/>}
            </span>
            <div style={{ flex:1 }}>
              <p style={{ fontSize:14.5, fontWeight:700, letterSpacing:"-0.01em" }}>
                {finished ? t("premium.getResult",{n:okCount,t:lanes.length}) : t("premium.working",{n:lanes.length})}
              </p>
              <p style={{ fontSize:12, color:th.t3, marginTop:2 }}>
                {finished ? t("premium.allEnded") : t("premium.atOnceNote",{n:who?.name})}
              </p>
            </div>
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
            {lanes.map(l=><Lane key={l.key} lane={l}/>)}
          </div>
        </div>
      )}
    </div>
  );
};


// ═════════════════════════════════════════
// TAKLIF KODLARI
// ═════════════════════════════════════════
// ── Kirish sehrgari: kanal → PIN → kod ──
// ═════════════════════════════════════════
// TAKLIF KODLARI
// ═════════════════════════════════════════
const ABC = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";   // O/0/I/1 yo'q — chalkashmasin
const makeCode = kind => {
  const g = n => Array.from({length:n},()=>ABC[Math.floor(Math.random()*ABC.length)]).join("");
  return `${kind==="partner"?"PLX":"PLW"}-${g(4)}-${g(4)}-${g(4)}`;
};

const CodeCard = ({ c, onCopy, onKill }) => {
  const th = useTheme();
  const [hit,sHit] = useState(false);
  const used = c.used;

  const copy = async e => {
    e.stopPropagation();
    const ok = await copyText(c.code);
    if (ok) { hap.ok(); sHit(true); setTimeout(()=>sHit(false),1300); onCopy?.(); }
  };

  return (
    <div className="codeIn" style={{
      position:"relative", overflow:"hidden", borderRadius:15,
      padding:"13px 14px",
      background: used ? th.s1 : th.s2,
      border:`1px solid ${used ? th.b1 : (hit ? th.ok+"66" : th.accBd)}`,
      opacity: used ? .55 : 1,
      transition:"all .25s",
    }}>
      {/* yangi kodda skanerlovchi chiziq */}
      {!used && (
        <span style={{ position:"absolute", inset:0, pointerEvents:"none", overflow:"hidden" }}>
          <span className="scanLine" style={{ display:"block", height:"26%", width:"100%",
            background:`linear-gradient(180deg, transparent, ${th.accSub}, transparent)` }}/>
        </span>
      )}

      <div style={{ display:"flex", alignItems:"center", gap:9, marginBottom:9, position:"relative" }}>
        <span style={{ fontSize:9, fontWeight:700, letterSpacing:"0.15em", textTransform:"uppercase",
          color: used ? th.t4 : th.acc }}>
          {c.kind==="partner" ? t("team.partnerCode") : t("team.workerCode")}
        </span>
        <span style={{ flex:1 }}/>
        {used
          ? <Tag>{t("team.used")}</Tag>
          : <Tag v="acc">{t("team.oneTime")}</Tag>}
      </div>

      {/* kod */}
      <div onClick={copy} style={{ cursor: used ? "default" : "pointer", position:"relative" }}>
        <p style={{
          fontFamily:"'SF Mono','Fira Code',monospace", fontSize:15.5, fontWeight:700,
          letterSpacing:"0.06em", color: hit ? th.ok : used ? th.t3 : th.t1,
          transition:"color .2s", wordBreak:"break-all", lineHeight:1.4,
          textDecoration: used ? "line-through" : "none",
          textDecorationColor: th.t4,
        }}>
          {c.code.split("").map((ch,i)=>(
            <span key={i} className="charIn" style={{ animationDelay:`${i*0.016}s` }}>{ch}</span>
          ))}
        </p>
      </div>

      <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:10, position:"relative" }}>
        <span style={{ flex:1, fontSize:11, color:th.t3 }}>
          {used ? t("team.usedBy",{n:c.usedBy}) : t("common.copiedHint")}
        </span>
        {!used && (
          <button onClick={copy} style={{
            display:"inline-flex", alignItems:"center", gap:6,
            padding:"7px 12px", borderRadius:10, cursor:"pointer",
            fontFamily:"inherit", fontSize:12, fontWeight:700,
            background: hit ? th.okA : th.acc, color: hit ? th.ok : th.accTxt,
            border:`1px solid ${hit ? th.ok+"55" : th.accBd}`,
            transition:"all .2s", WebkitTapHighlightColor:"transparent",
          }}>
            {hit ? <><Ic.Check s={12} c={th.ok}/>{t("common.copied")}</> : <><Ic.Copy s={12} c={th.accTxt}/>{t("common.copy")}</>}
          </button>
        )}
        <button onClick={e=>{ e.stopPropagation(); hap.tap(); onKill(c.code); }}
          style={{ width:30, height:30, borderRadius:9, cursor:"pointer",
            background:`${th.err}14`, border:`1px solid ${th.err}30`, color:th.err,
            display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
          <Ic.Trash s={13} c={th.err}/>
        </button>
      </div>
    </div>
  );
};

// ═════════════════════════════════════════
// JAMOA — hamkorlar va ishchilar
// ═════════════════════════════════════════
const Spark = ({ data, color, track }) => {
  const max = Math.max(...data, 1);
  return (
    <span style={{ display:"flex", alignItems:"flex-end", gap:2.5, height:26 }}>
      {data.map((v,i)=>(
        <span key={i} className="bar" style={{
          width:4, borderRadius:1.5,
          height:`${Math.max(12, (v/max)*100)}%`,
          background: i===data.length-1 ? color : track,
          animationDelay:`${i*0.04}s`,
        }}/>
      ))}
    </span>
  );
};

const Donut = ({ pct, size=44, color, track }) => {
  const r=(size-5)/2, C=2*Math.PI*r;
  return (
    <span style={{ position:"relative", width:size, height:size, flexShrink:0, display:"block" }}>
      <svg width={size} height={size} style={{ transform:"rotate(-90deg)", display:"block" }}>
        <circle cx={size/2} cy={size/2} r={r} stroke={track} strokeWidth="3.5" fill="none"/>
        <circle cx={size/2} cy={size/2} r={r} stroke={color} strokeWidth="3.5" fill="none"
          strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C*(1-pct/100)}
          style={{ transition:"stroke-dashoffset .9s cubic-bezier(.2,.8,.3,1)" }}/>
      </svg>
      <span style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center",
        fontSize:11, fontWeight:800, fontFamily:"'SF Mono',monospace" }}>{pct}</span>
    </span>
  );
};

const initials = n => n.split(" ").map(x=>x[0]).join("").slice(0,2).toUpperCase();

// ── ishchi qatori ──
const WorkerRow = ({ w, owner }) => {
  const th = useTheme();
  return (
    <div data-row data-worker={w.id} style={{ ...glass(th,0.04), borderRadius:15, padding:"13px 14px", display:"flex", alignItems:"center", gap:12 }}>
      <span style={{ position:"relative", flexShrink:0 }}>
        <span style={{
          width:42, height:42, borderRadius:13, display:"flex", alignItems:"center", justifyContent:"center",
          background:th.s2, border:`1px solid ${th.b1}`,
          fontSize:13, fontWeight:800, color:th.t2,
        }}>{initials(w.name)}</span>
        <span className={w.online?"tick":undefined} style={{
          position:"absolute", right:-2, bottom:-2, width:11, height:11, borderRadius:"50%",
          background: w.online ? th.ok : th.t4, border:`2px solid ${th.bg}`,
        }}/>
      </span>

      <div style={{ flex:1, minWidth:0 }}>
        <p style={{ fontSize:14, fontWeight:600, letterSpacing:"-0.01em", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{w.name}</p>
        <p style={{ fontSize:11.5, color:th.t3, marginTop:2, fontFamily:"'SF Mono',monospace" }}>{w.tag}</p>
        <p style={{ fontSize:10.5, color:w.online?th.ok:th.t4, marginTop:3 }}>
          {owner ? `${owner} · ` : ""}{w.online ? t("bots.active") : w.last}
        </p>
      </div>

      <Spark data={w.week} color={th.acc} track={th.b2}/>

      <div style={{ textAlign:"right", flexShrink:0, minWidth:40 }}>
        <p style={{ fontSize:19, fontWeight:800, fontFamily:"'SF Mono',monospace", letterSpacing:"-0.02em" }}>
          <Count value={w.today}/>
        </p>
        <p style={{ fontSize:9, color:th.t3, letterSpacing:"0.08em", textTransform:"uppercase" }}>{t("common.today")}</p>
      </div>

      <Donut pct={w.ok} color={w.ok>=90?th.ok:w.ok>=80?th.warn:th.err} track={th.b1}/>
    </div>
  );
};

// ── hamkor qatori ──
const PartnerRow = ({ p, workers }) => {
  const th  = useTheme();
  const num = p.balance;
  const pct = Math.min(100, Math.round(num/p.goal*100));
  const mine = workers.filter(w=>w.parent===p.id);
  return (
    <div data-row style={{ ...glass(th,0.04), borderRadius:15, padding:"14px 15px" }}>
      <div style={{ display:"flex", alignItems:"center", gap:11, marginBottom:12 }}>
        <span style={{ width:38, height:38, borderRadius:12, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center",
          background:th.accSub, border:`1px solid ${th.accBd}`, fontSize:12.5, fontWeight:800, color:th.acc }}>
          {initials(p.name)}
        </span>
        <div style={{ flex:1, minWidth:0 }}>
          <p style={{ fontSize:14.5, fontWeight:700, letterSpacing:"-0.01em" }}>{p.name}</p>
          <p style={{ fontSize:11.5, color:th.t3, marginTop:2, fontFamily:"'SF Mono',monospace" }}>{p.bot}</p>
        </div>
        <Tag v="acc">{p.share}%</Tag>
      </div>

      <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:9 }}>
        <div>
          <p style={{ fontSize:9, color:th.t3, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:4 }}>{t("team.balance")}</p>
          <p style={{ fontSize:20, fontWeight:800, fontFamily:"'SF Mono',monospace", letterSpacing:"-0.03em" }}>
            <Count value={num}/><span style={{ fontSize:11, fontWeight:500, color:th.t3, marginLeft:4 }}>so'm</span>
          </p>
        </div>
        <div style={{ textAlign:"right" }}>
          <p style={{ fontSize:11.5, color:th.t2, fontFamily:"'SF Mono',monospace" }}>{t("team.ordersCount",{n:p.orders})}</p>
          <p style={{ fontSize:11, color:th.t3, marginTop:2 }}>{tp("team.workerCount", mine.length)}</p>
        </div>
      </div>

      <div style={{ height:4, borderRadius:2, background:th.b1, overflow:"hidden" }}>
        <span style={{ display:"block", height:"100%", borderRadius:2, width:`${pct}%`,
          background:`linear-gradient(90deg, ${th.acc}, ${th.acc}aa)`,
          transition:"width 1s cubic-bezier(.2,.8,.3,1)" }}/>
      </div>
      <p style={{ fontSize:10.5, color:th.t3, marginTop:6 }}>To'lov chegarasigacha {pct}%</p>
    </div>
  );
};

// ── hamkor to'liq statistikasi ──
// ── hisob-kitob yordamchilari ──
const cntOf = (p, workers) =>
  (p.today || 0) + workers.filter(w=>w.parent===p.id).reduce((a,w)=>a + (w.today||0), 0);
const dueOf = (p, workers) => cntOf(p, workers) * (p.price || 0);

const PAY_FROM = 22, PAY_TO = 23;
const inPayWindow = () => { const h = new Date().getHours(); return h >= PAY_FROM && h < PAY_TO; };

const PayPanel = ({ partners, workers, onClose }) => {
  const th = useTheme();
  const [now,sNow] = useState(new Date());
  useEffect(()=>{ const t=setInterval(()=>sNow(new Date()),1000); return ()=>clearInterval(t); },[]);

  const open = inPayWindow();
  const cnt  = partners.reduce((a,p)=>a + cntOf(p, workers), 0);
  const due  = partners.reduce((a,p)=>a + dueOf(p, workers), 0);
  const hh   = String(now.getHours()).padStart(2,"0");
  const mm   = String(now.getMinutes()).padStart(2,"0");
  const ss   = String(now.getSeconds()).padStart(2,"0");

  const left = () => {
    const t = new Date(now); t.setHours(PAY_FROM,0,0,0);
    if (now >= t) t.setDate(t.getDate()+1);
    const d = Math.max(0, t - now);
    return `${Math.floor(d/3600000)} soat ${Math.floor(d%3600000/60000)} daqiqa`;
  };

  return (
    <div style={{
      ...glass(th,0.05), borderRadius:17, padding:"15px 16px", position:"relative", overflow:"hidden",
      border:`1px solid ${open ? th.warn+"4d" : th.b1}`,
    }}>
      {open && (
        <span style={{ position:"absolute", top:0, left:0, right:0, height:1.5, overflow:"hidden" }}>
          <span className="scan" style={{ display:"block", width:"34%", height:"100%",
            background:`linear-gradient(90deg,transparent,${th.warn},transparent)` }}/>
        </span>
      )}

      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
        <span className={open?"tick":undefined} style={{ width:7, height:7, borderRadius:"50%",
          background: open ? th.warn : th.t4, boxShadow: open ? `0 0 8px ${th.warn}` : "none" }}/>
        <span style={{ flex:1, fontSize:10, fontWeight:700, letterSpacing:"0.13em",
          textTransform:"uppercase", color: open ? th.warn : th.t3 }}>
          {open ? t("pay.windowOpen") : t("pay.windowShut")}
        </span>
        <span style={{ fontFamily:"'SF Mono','Fira Code',monospace", fontSize:13, fontWeight:700,
          color: open ? th.warn : th.t2, fontVariantNumeric:"tabular-nums" }}>
          {hh}:{mm}<span style={{ opacity:.45 }}>:{ss}</span>
        </span>
      </div>

      <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", gap:12, marginBottom:14 }}>
        <div>
          <p style={{ fontSize:9.5, color:th.t3, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:5 }}>{t("pay.todayTotal")}</p>
          <p style={{ fontSize:27, fontWeight:800, fontFamily:"'SF Mono',monospace", letterSpacing:"-0.03em", lineHeight:1 }}>
            <Count value={due}/><span style={{ fontSize:12, fontWeight:500, color:th.t3, marginLeft:5 }}>so'm</span>
          </p>
        </div>
        <div style={{ textAlign:"right" }}>
          <p style={{ fontSize:12, color:th.t2, fontFamily:"'SF Mono',monospace" }}>{t("pay.premiumCount",{n:cnt})}</p>
          <p style={{ fontSize:11, color:th.t3, marginTop:3 }}>{t("pay.partnerCount",{n:partners.length})}</p>
        </div>
      </div>

      <p style={{ fontSize:11, color:th.t3, marginBottom:11, lineHeight:1.5 }}>
        {open
          ? t("pay.openNote")
          : t("pay.shutNote",{h:PAY_FROM,t:left()})}
      </p>

      <HoldBtn tone={open ? th.warn : th.t3} disabled={!due}
        label={due ? t("pay.accept",{n:som(due)}) : t("pay.noAccount")}
        done={()=>{ if(due) onClose(); }}/>
    </div>
  );
};

const PRICE_PRESETS = [25000, 28000, 30000, 35000];

const PartnerSheet = ({ p, workers, onPrice, onSettle, onClose }) => {
  const th = useTheme();
  const mine  = workers.filter(w=>w.parent===p.id);
  const cnt   = cntOf(p, workers);
  const due   = dueOf(p, workers);
  const week  = Array.from({length:7},(_,i)=>
    (p.week?.[i]||0) + mine.reduce((a,w)=>a+(w.week?.[i]||0),0));
  const online = mine.filter(w=>w.online).length;
  const [edit,sEdit] = useState(false);
  const [val,sVal]   = useState(String(p.price || 0));

  const save = () => {
    const n = parseInt(val.replace(/\D/g,""),10) || 0;
    onPrice(p.id, n); sEdit(false); hap.ok();
  };

  return (
    <Modal onClose={onClose}>
      <MH title={p.name} note={`ID ${p.tgId}`} onClose={onClose}/>
      <div style={{ padding:18, display:"flex", flexDirection:"column", gap:13, maxHeight:"74vh", overflowY:"auto" }}>

        {/* ── NARX ── */}
        <div style={{ padding:"14px 15px", borderRadius:15,
          background: th.accSub, border:`1px solid ${th.accBd}` }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom: edit ? 12 : 0 }}>
            <div style={{ flex:1 }}>
              <p style={{ fontSize:9.5, fontWeight:700, color:th.t3, letterSpacing:"0.12em",
                textTransform:"uppercase", marginBottom:5 }}>{t("ps.price")}</p>
              <p style={{ fontSize:22, fontWeight:800, fontFamily:"'SF Mono',monospace",
                letterSpacing:"-0.03em", color:th.acc }}>
                {som(p.price)}<span style={{ fontSize:11, fontWeight:500, color:th.t3, marginLeft:4 }}>so'm</span>
              </p>
            </div>
            {!edit && (
              <Btn v="ghost" sz="sm" onClick={()=>{ sVal(String(p.price||0)); sEdit(true); }}>{t("ps.priceEdit")}</Btn>
            )}
          </div>

          {edit && (
            <div className="codeIn" style={{ display:"flex", flexDirection:"column", gap:10 }}>
              <input value={som(parseInt(val.replace(/\D/g,""),10)||0)}
                onChange={e=>sVal(e.target.value)} inputMode="numeric" autoFocus
                onKeyDown={e=>e.key==="Enter"&&save()}
                style={{ fontFamily:"'SF Mono',monospace", fontSize:20, fontWeight:800,
                  textAlign:"center", padding:"12px 0" }}/>
              <div style={{ display:"flex", gap:6 }}>
                {PRICE_PRESETS.map(v=>(
                  <button key={v} onClick={()=>{ hap.select(); sVal(String(v)); }}
                    style={{ flex:1, padding:"8px 0", borderRadius:10, cursor:"pointer",
                      fontSize:11.5, fontWeight:700, fontFamily:"'SF Mono',monospace",
                      background: String(v)===val ? th.s3 : th.s1,
                      border:`1px solid ${String(v)===val ? th.b3 : th.b1}`,
                      color: String(v)===val ? th.t1 : th.t3, transition:"all .15s" }}>
                    {som(v)}
                  </button>
                ))}
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                <Btn v="ghost" onClick={()=>sEdit(false)}>{t("common.cancel")}</Btn>
                <Btn onClick={save}><Ic.Check s={13} c={th.accTxt}/>{t("common.save")}</Btn>
              </div>
            </div>
          )}
        </div>

        {/* ── BUGUNGI HISOB ── */}
        <div style={{ padding:"14px 15px", borderRadius:15, background:th.s1,
          border:`1px solid ${due ? th.warn+"3d" : th.b1}` }}>
          <p style={{ fontSize:9.5, fontWeight:700, color:th.t3, letterSpacing:"0.12em",
            textTransform:"uppercase", marginBottom:11 }}>{t("ps.todayBill")}</p>

          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
            <span style={{ fontFamily:"'SF Mono',monospace", fontSize:15, fontWeight:700, color:th.t1 }}>{cnt}</span>
            <span style={{ fontSize:12, color:th.t3 }}>×</span>
            <span style={{ fontFamily:"'SF Mono',monospace", fontSize:15, fontWeight:700, color:th.t2 }}>{som(p.price)}</span>
            <span style={{ flex:1, height:1, background:th.b1 }}/>
            <span style={{ fontFamily:"'SF Mono',monospace", fontSize:19, fontWeight:800,
              color: due ? th.warn : th.t3, letterSpacing:"-0.02em" }}>{som(due)}</span>
          </div>

          <HoldBtn tone={th.warn} disabled={!due}
            label={due ? t("ps.accept",{n:som(due)}) : t("ps.noBill")}
            done={()=>{ if(due){ onSettle(p.id); onClose(); } }}/>
        </div>

        {/* ── KO'RSATKICHLAR ── */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
          <StatCard label={t("ps.statToday")}    value={String(cnt)} color={th.acc}/>
          <StatCard label={t("ps.statWorker")}   value={`${online}/${mine.length}`} color={online?th.ok:th.t3}/>
          <StatCard label={t("ps.statShare")}    value={`${p.share}%`}/>
        </div>

        {/* ── 7 KUN ── */}
        <div style={{ padding:"14px 15px", borderRadius:14, background:th.s1, border:`1px solid ${th.b1}` }}>
          <p style={{ fontSize:9.5, fontWeight:700, color:th.t3, letterSpacing:"0.12em",
            textTransform:"uppercase", marginBottom:12 }}>{t("ps.last7")}</p>
          <div style={{ display:"flex", alignItems:"flex-end", gap:6, height:62 }}>
            {week.map((v,i)=>{
              const mx = Math.max(...week,1);
              return (
                <span key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:5 }}>
                  <span className="bar" style={{ width:"100%", maxWidth:22, borderRadius:4,
                    height:`${Math.max(8,(v/mx)*44)}px`,
                    background: i===6 ? th.acc : th.b2, animationDelay:`${i*0.05}s` }}/>
                  <span style={{ fontSize:9, color: i===6?th.acc:th.t4, fontFamily:"'SF Mono',monospace" }}>{v}</span>
                </span>
              );
            })}
          </div>
        </div>

        {/* ── ISHCHILARI ── */}
        <div>
          <p style={{ fontSize:9.5, fontWeight:700, color:th.t3, letterSpacing:"0.12em",
            textTransform:"uppercase", marginBottom:9 }}>{t("ps.myWorkers")}</p>
          <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
            {mine.map(w=>(
              <div key={w.id} style={{ display:"flex", alignItems:"center", gap:10,
                padding:"10px 12px", borderRadius:12, background:th.s1, border:`1px solid ${th.b1}` }}>
                <span style={{ position:"relative", flexShrink:0 }}>
                  <span style={{ width:32, height:32, borderRadius:10, background:th.s2,
                    border:`1px solid ${th.b1}`, display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:11, fontWeight:800, color:th.t2 }}>{initials(w.name)}</span>
                  <span style={{ position:"absolute", right:-2, bottom:-2, width:9, height:9, borderRadius:"50%",
                    background: w.online?th.ok:th.t4, border:`2px solid ${th.bg2}` }}/>
                </span>
                <span style={{ flex:1, minWidth:0 }}>
                  <span style={{ display:"block", fontSize:13, fontWeight:600 }}>{w.name}</span>
                  <span style={{ display:"block", fontSize:10.5, color:th.t3, fontFamily:"'SF Mono',monospace" }}>{w.tag}</span>
                </span>
                <span style={{ fontFamily:"'SF Mono',monospace", fontSize:15, fontWeight:800 }}>{w.today}</span>
              </div>
            ))}
            {!mine.length && <p style={{ fontSize:12, color:th.t3, textAlign:"center", padding:"14px 0" }}>{t("ps.noWorkers")}</p>}
          </div>
        </div>

        {/* ── TO'LOV TARIXI ── */}
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:9 }}>
            <p style={{ flex:1, fontSize:9.5, fontWeight:700, color:th.t3, letterSpacing:"0.12em",
              textTransform:"uppercase" }}>{t("ps.payHistory")}</p>
            <span style={{ fontSize:11, color:th.t3, fontFamily:"'SF Mono',monospace" }}>
              {t("ps.payTotal",{n:som(p.paid||0)})}
            </span>
          </div>
          <div style={{ borderRadius:13, overflow:"hidden", border:`1px solid ${th.b1}` }}>
            {(p.history||[]).map((h,i,arr)=>(
              <div key={i} style={{ display:"flex", alignItems:"center", gap:10,
                padding:"11px 13px", background:th.s1,
                borderBottom: i<arr.length-1 ? `1px solid ${th.b1}` : "none" }}>
                <span style={{ fontFamily:"'SF Mono',monospace", fontSize:12, color:th.t3, width:44 }}>{h.d}</span>
                <span style={{ flex:1, fontSize:12, color:th.t2 }}>{t("ps.historyItem",{n:h.n})}</span>
                <span style={{ fontFamily:"'SF Mono',monospace", fontSize:13, fontWeight:700, color:th.ok }}>
                  {som(h.s)}
                </span>
              </div>
            ))}
            {!(p.history||[]).length && (
              <p style={{ fontSize:12, color:th.t3, textAlign:"center", padding:"16px 0", background:th.s1 }}>
                {t("ps.payEmpty")}
              </p>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

// ── sahifa ──
const TeamPage = () => {
  const th    = useTheme();
  const toast = useToast();
  const { toss } = useToss(th);
  const { role, partners=[], setPartners, workers=[], setWorkers, codes=[], setCodes } = useData();
  const isOwner = role === "owner";
  const me = "me";

  const [tab,sTab]   = useState(isOwner ? "partners" : "workers");
  const [open,sOpen] = useState(null);

  const myWorkers = isOwner ? workers : workers.filter(w=>w.parent===me);
  const myCodes   = codes.filter(c => c.kind===(tab==="partners"?"partner":"worker") && (isOwner ? c.by==="owner" : c.by===me));

  const online = myWorkers.filter(w=>w.online).length;
  const today  = myWorkers.reduce((a,w)=>a+w.today,0);
  const pToday = partners.reduce((a,p)=>a+p.today+workers.filter(w=>w.parent===p.id).reduce((b,w)=>b+w.today,0),0);

  const gen = () => {
    const kind = tab==="partners" ? "partner" : "worker";
    const c = { code: makeCode(kind), kind, by: isOwner ? "owner" : me, used:0, at:Date.now() };
    setCodes(l=>[c,...l]);
    hap.ok();
    toast({ kind:"ok", title:t("team.codeMade"), note:t("team.codeMadeNote"), ms:2600 });
  };
  const drop = code => { setCodes(l=>l.filter(c=>c.code!==code)); hap.warn(); toast({kind:"warn",title:t("team.codeDropped")}); };

  const parentName = id => id==="owner" ? t("team.you") : id==="me" ? t("team.you") : (partners.find(p=>p.id===id)?.name || "—");

  const setPrice = (pid, price) => {
    setPartners(l=>l.map(x=>x.id===pid?{...x, price}:x));
    toast({kind:"ok",title:t("price.saved"),note:t("price.savedNote",{n:som(price)})});
  };

  const dd = () => { const d=new Date(); return `${String(d.getDate()).padStart(2,"0")}.${String(d.getMonth()+1).padStart(2,"0")}`; };

  const settle = ids => {
    const list = partners.filter(p=>ids.includes(p.id));
    const sum  = list.reduce((a,p)=>a+dueOf(p, workers), 0);
    const cnt  = list.reduce((a,p)=>a+cntOf(p, workers), 0);
    const day  = dd();
    setPartners(l=>l.map(p=>{
      if (!ids.includes(p.id)) return p;
      const n = cntOf(p, workers), sm = n * (p.price||0);
      if (!n) return p;
      return { ...p, today:0,
        week:[...(p.week||[0,0,0,0,0,0,0]).slice(1), 0],
        paid:(p.paid||0) + sm,
        orders:(p.orders||0) + n,
        history:[{ d:day, n, s:sm }, ...(p.history||[])].slice(0,30) };
    }));
    setWorkers(l=>l.map(w=> ids.includes(w.parent)
      ? { ...w, today:0, week:[...(w.week||[0,0,0,0,0,0,0]).slice(1), 0] } : w));
    hap.heavy();
    toast({ kind:"ok", title:t("pay.settled",{n:som(sum)}),
      note:t("pay.settledNote",{c:cnt,p:list.length}), ms:3600 });
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:18, maxWidth:680 }}>
      {open && <PartnerSheet p={partners.find(x=>x.id===open.id) || open} workers={workers}
        onPrice={setPrice} onSettle={id=>settle([id])} onClose={()=>sOpen(null)}/>}

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:800, letterSpacing:"-0.03em", lineHeight:1.1 }}>{t("team.title")}</h1>
          <p style={{ fontSize:13, color:th.t3, marginTop:3 }}>
            {isOwner ? t("team.subOwner") : t("team.subOther")}
          </p>
        </div>
        <Btn sz="sm" onClick={gen}><Ic.Plus s={13} c={th.accTxt}/>{t("team.code")}</Btn>
      </div>

      {isOwner && (
        <div style={{ display:"flex", gap:4, padding:4, borderRadius:14, background:th.s1, border:`1px solid ${th.b1}` }}>
          {[{id:"partners",label:t("team.partners"),n:partners.length},{id:"workers",label:t("team.workers"),n:workers.length}].map(x=>{
            const on = tab===x.id;
            return (
              <button key={x.id} onClick={()=>{hap.select();sTab(x.id);}} style={{
                flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:6,
                padding:"9px 10px", borderRadius:10, cursor:"pointer", fontFamily:"inherit",
                fontSize:13, fontWeight:on?700:500,
                background: on ? th.s3 : "transparent",
                border:`1px solid ${on ? th.b2 : "transparent"}`,
                color: on ? th.t1 : th.t3, transition:"all .18s cubic-bezier(.2,0,0,1)",
              }}>{x.label}
                <span style={{ fontFamily:"'SF Mono',monospace", fontSize:11, opacity:.65 }}>{x.n}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* statistika */}
      {tab==="partners" && isOwner ? (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:9 }}>
          <StatCard label={t("team.statPartner")} value={String(partners.length)}/>
          <StatCard label={t("team.statToday")}  value={String(pToday)} color={th.acc}/>
          <StatCard label={t("team.statCodes")} value={String(myCodes.length)}/>
        </div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:9 }}>
          <StatCard label={t("team.statActive")}   value={`${online}/${myWorkers.length}`} color={online?th.ok:th.t3}/>
          <StatCard label={t("team.statToday")}  value={String(today)} color={th.acc}/>
          <StatCard label={t("team.statCodes")} value={String(myCodes.length)}/>
        </div>
      )}

      {/* faol kodlar */}
      {myCodes.length > 0 && (
        <div>
          <Lbl>{t("team.activeCodes")}</Lbl>
          <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
            {myCodes.map(c=><CodeCard key={c.code} c={c} onKill={drop}/>)}
          </div>
        </div>
      )}

      {/* bugungi hisob-kitob */}
      {tab==="partners" && isOwner && partners.length>0 && (
        <PayPanel partners={partners} workers={workers}
          onClose={()=>settle(partners.map(p=>p.id))}/>
      )}

      {/* ro'yxat */}
      {tab==="partners" && isOwner ? (
        <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
          {partners.length>0 && <Lbl>{t("team.partners")}</Lbl>}
          {partners.map(p=>{
            const mine = workers.filter(w=>w.parent===p.id);
            const tot  = p.today + mine.reduce((a,w)=>a+w.today,0);
            return (
              <div key={p.id} data-item>
                <SwipeRow label="Hamkor" onDelete={()=>{const el=document.querySelector(`[data-partner="${p.id}"]`);toss(el,()=>{setPartners(l=>l.filter(x=>x.id!==p.id)); setWorkers(l=>l.filter(w=>w.parent!==p.id)); toast({kind:"ok",title:t("team.partnerGone"),note:p.name});});}}>
                  <div data-row data-partner={p.id} className="ho" onClick={()=>{hap.tap();sOpen(p);}}
                    style={{ ...glass(th,0.04), borderRadius:15, padding:"13px 14px",
                      display:"flex", alignItems:"center", gap:12, cursor:"pointer" }}>
                    <span style={{ width:40, height:40, borderRadius:13, flexShrink:0,
                      background:th.accSub, border:`1px solid ${th.accBd}`,
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontSize:13, fontWeight:800, color:th.acc }}>{initials(p.name)}</span>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontSize:14, fontWeight:600, letterSpacing:"-0.01em",
                        overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.name}</p>
                      <p style={{ fontSize:11, color:th.t3, marginTop:2, fontFamily:"'SF Mono',monospace" }}>
                        ID {p.tgId} · {p.share}%
                      </p>
                      <p style={{ fontSize:10.5, color:th.t4, marginTop:3 }}>{tp("team.workerCount", mine.length)}</p>
                    </div>
                    <div style={{ textAlign:"right", flexShrink:0 }}>
                      <p style={{ fontSize:20, fontWeight:800, fontFamily:"'SF Mono',monospace", letterSpacing:"-0.02em" }}>
                        <Count value={tot}/>
                      </p>
                      <p style={{ fontSize:9, color:th.t3, letterSpacing:"0.08em", textTransform:"uppercase" }}>{t("common.today")}</p>
                    </div>
                    <Ic.Right s={13} c={th.t3}/>
                  </div>
                </SwipeRow>
              </div>
            );
          })}
          {!partners.length && !myCodes.length && (
            <Empty art="folder" title={t("team.noPartner")}
              note={t("team.noPartnerNote")}
              action={t("team.makeCode")} onAction={gen}/>
          )}
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
          {myWorkers.length>0 && <Lbl>{t("team.workers")}</Lbl>}
          {myWorkers.map(w=>(
            <div key={w.id} data-item>
              <SwipeRow label="Ishchi" onDelete={()=>{const el=document.querySelector(`[data-worker="${w.id}"]`);toss(el,()=>{setWorkers(l=>l.filter(x=>x.id!==w.id)); toast({kind:"ok",title:t("team.workerGone"),note:w.name});});}}>
                <WorkerRow w={w} owner={isOwner ? parentName(w.parent) : null}/>
              </SwipeRow>
            </div>
          ))}
          {!myWorkers.length && !myCodes.length && (
            <Empty art="folder" title={t("team.noWorker")}
              note={t("team.noWorkerNote")}
              action={t("team.makeCode")} onAction={gen}/>
          )}
        </div>
      )}
    </div>
  );
};



// ═════════════════════════════════════════
// SMS FORWARDER — yuklab olish
// ═════════════════════════════════════════
const CHUTE_KIT = "premolux-sms-relay.apk";
const CHUTE_SIZE = "1.4 MB";
const CHUTE_URL  = "https://github.com/miuisanikita-lab/premolux-relay5/releases/download/v1.0.0/app-debug.apk";

// arqon — kanop bilan strelkani bog'laydi, tortilish holatiga qarab uzunlashadi
const Cords = ({ c, y0, y1, spread }) => (
  <>
    <path className="cordPull" d={`M${16-spread} ${y0} L16 ${y1}`} stroke={c} strokeWidth="1" fill="none" pathLength="1"/>
    <path className="cordPull" d={`M${16+spread} ${y0} L16 ${y1}`} stroke={c} strokeWidth="1" fill="none" pathLength="1" style={{ animationDelay:".03s" }}/>
  </>
);

const ChuteIcon = ({ phase, tone }) => {
  const th = useTheme();
  const c = phase==="done" ? th.ok : tone;

  if (phase==="idle") return (
    <svg width="34" height="34" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="14" stroke={c} strokeWidth="1.6"/>
      <path d="M16 9v11M11 15l5 5 5-5" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  if (phase==="done") return (
    <svg width="34" height="34" viewBox="0 0 32 32" fill="none" className="checkPop">
      <circle cx="16" cy="16" r="14" fill={`${c}1c`} stroke={c} strokeWidth="1.6"/>
      <path className="checkLine" d="M10 16.5l4 4 8-9" stroke={c} strokeWidth="2.4"
        strokeLinecap="round" strokeLinejoin="round" pathLength="22"/>
    </svg>
  );

  // tushish jarayoni — kanop tepada, arqonlar, ostida strelka
  return (
    <svg width="34" height="34" viewBox="0 0 32 32" fill="none" style={{ overflow:"visible" }}>
      <g className="chuteSway" style={{ transformOrigin:"16px 6px" }}>
        <path d="M4 10 Q16 0 28 10 Q22 7 16 7 Q10 7 4 10Z" fill={`${c}2a`} stroke={c} strokeWidth="1.4" strokeLinejoin="round"/>
        <Cords c={c} y0={9.5} y1={19} spread={9}/>
      </g>
      <g className="dlBounce">
        <rect x="11" y="19" width="10" height="9" rx="2" fill={`${c}1c`} stroke={c} strokeWidth="1.4"/>
        <path d="M16 21v4.4M13.6 23.6l2.4 2.4 2.4-2.4" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      </g>
    </svg>
  );
};

const ChuteButton = ({ progress, phase, size=118 }) => {
  const th = useTheme();
  const tone = th.acc;
  const R = size/2 - 5, C = 2*Math.PI*R;
  const p = Math.max(0, Math.min(1, progress));

  return (
    <span style={{ position:"relative", width:size, height:size, display:"block", flexShrink:0 }}>
      <svg width={size} height={size} style={{ transform:"rotate(-90deg)", display:"block" }}>
        <circle cx={size/2} cy={size/2} r={R} fill="none" stroke={th.b1} strokeWidth="2.5"/>
        <circle cx={size/2} cy={size/2} r={R} fill="none"
          stroke={phase==="done" ? th.ok : tone} strokeWidth="2.5" strokeLinecap="round"
          strokeDasharray={C} strokeDashoffset={C*(1-p)}
          style={{
            transition: phase==="down" ? "stroke-dashoffset .2s linear, stroke .3s" : "stroke .3s",
            filter: phase!=="idle" ? `drop-shadow(0 0 8px ${(phase==="done"?th.ok:tone)}66)` : "none",
          }}/>
      </svg>

      <span className={phase==="land" ? "landPop" : phase==="chute" ? "chuteIn" : undefined}
        style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
        <ChuteIcon phase={phase==="down"?"chute":phase} tone={tone}/>
      </span>

      {/* qo'nishdagi chang halqasi */}
      {phase==="land" && (
        <span className="dustOut" style={{
          position:"absolute", left:"50%", bottom:"18%", width:size*0.5, height:size*0.16,
          marginLeft:-size*0.25, borderRadius:"50%",
          border:`1.4px solid ${th.acc}`, pointerEvents:"none",
        }}/>
      )}
    </span>
  );
};

const AppSheet = () => {
  const th = useTheme();
  const toast = useToast();
  const [phase,sPhase] = useState("idle");   // idle | chute | down | land | done
  const [prog,sProg]   = useState(0);
  const raf = useRef(null);

  // ── SMS Relay qurilma tokenini ro'yxatdan o'tkazish ──
  // MUHIM: bu QISM ILGARI UMUMAN YO'Q edi — shuning uchun Android
  // ilova SMS yuborsa ham, backend uni "noma'lum qurilma" deb
  // doim rad etardi. Endi operator Android ilovadagi tokenni
  // shu yerga kiritib, o'z hisobiga bog'laydi.
  const [token,sToken] = useState("");
  const [relayStatus,sRelayStatus] = useState(null); // null=yuklanmoqda, {connected:bool,...}
  const [registering,sRegistering] = useState(false);

  useEffect(()=>{
    api.get("/relay/status").then(sRelayStatus).catch(()=>sRelayStatus({connected:false}));
  },[]);

  const registerToken = async () => {
    if (!token.trim()) { toast({kind:"err",title:t("app.needToken")}); return; }
    sRegistering(true);
    try {
      await api.post("/relay/register", { token: token.trim() });
      hap.ok();
      toast({kind:"ok",title:"Qurilma bog'landi!"});
      sRelayStatus({connected:true});
      sToken("");
    } catch (e) {
      hap.err();
      toast({kind:"err",title:t("app.devErr"),note:e.message});
    } finally {
      sRegistering(false);
    }
  };

  const start = () => {
    if (phase!=="idle" && phase!=="done") return;
    hap.press();
    sProg(0); sPhase("chute");

    setTimeout(()=>{
      sPhase("down");
      const t0 = performance.now();
      const DUR = 1900 + Math.random()*500;
      const tick = now => {
        const p = Math.min(1, (now - t0) / DUR);
        // real tarmoq kabi — notekis tezlik
        const eased = p < .75 ? p / .75 * .82 : .82 + (p-.75)/.25*.18;
        sProg(eased);
        if (p < 1) raf.current = requestAnimationFrame(tick);
        else {
          sProg(1); hap.soft();
          sPhase("land");
          setTimeout(()=>{ sPhase("done"); hap.ok();
            toast({kind:"ok",title:"Yuklandi",note:CHUTE_KIT,ms:2400}); }, 460);
        }
      };
      raf.current = requestAnimationFrame(tick);
    }, 380);
  };

  useEffect(()=>()=>cancelAnimationFrame(raf.current),[]);

  const label = phase==="idle" ? t("app.download")
              : phase==="chute" ? t("app.starting")
              : phase==="down"  ? `${Math.round(prog*100)}%`
              : phase==="land"  ? t("app.landing")
              : t("app.ready");

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20, maxWidth:520, margin:"0 auto" }}>

      <div style={{ textAlign:"center", paddingTop:6 }}>
        <span style={{ width:52, height:52, borderRadius:16, margin:"0 auto 14px",
          display:"flex", alignItems:"center", justifyContent:"center",
          background:th.accSub, border:`1px solid ${th.accBd}` }}>
          <Ic.Send s={22} c={th.acc}/>
        </span>
        <h1 style={{ fontSize:22, fontWeight:800, letterSpacing:"-0.03em" }}>{t("app.title")}</h1>
        <p style={{ fontSize:13, color:th.t3, marginTop:6, lineHeight:1.55, maxWidth:290, margin:"6px auto 0" }}>
          {t("app.sub")}
        </p>
      </div>

      {/* ── yuklash tugmasi ── */}
      <div style={{ ...glass(th,0.05), borderRadius:20, padding:"28px 20px 24px",
        display:"flex", flexDirection:"column", alignItems:"center", gap:16 }}>

        <button onClick={start} disabled={phase!=="idle"&&phase!=="done"}
          style={{ background:"none", border:"none", cursor: phase==="idle"||phase==="done" ? "pointer":"default",
            padding:0, WebkitTapHighlightColor:"transparent" }}>
          <ChuteButton progress={prog} phase={phase}/>
        </button>

        <p style={{ fontSize:12.5, fontWeight:600, color: phase==="done" ? th.ok : th.t2,
          letterSpacing:"-0.01em", fontFamily: phase==="down" ? "'SF Mono',monospace" : "inherit",
          transition:"color .25s" }}>{label}</p>

        <p style={{ fontSize:11, color:th.t4, fontFamily:"'SF Mono',monospace" }}>
          {CHUTE_KIT} · {CHUTE_SIZE}
        </p>

        {phase==="done" && (
          <span className="eUp" style={{ marginTop:2 }}>
            {/* eslatma: avval <a> ichida <Btn> (ya'ni <button>) bor edi —
                bu HTML xatosi va brauzerlarda link bosilishi ishonchli emas.
                Endi <a> o'zi tugma ko'rinishiga ega. */}
            <a href={CHUTE_URL} download className="linkBtn" style={{
              display:"inline-flex", padding:"7px 13px", fontSize:12, borderRadius:9,
              background:"transparent", border:`1px solid ${th.b1}`, color:th.t2,
              fontWeight:700, textDecoration:"none",
            }}>
              {t("app.redownload")}
            </a>
          </span>
        )}
      </div>

      {/* ── o'rnatish qadamlari ── */}
      <div>
        <p style={{ fontSize:10, fontWeight:700, color:th.t3, letterSpacing:"0.13em",
          textTransform:"uppercase", marginBottom:10, paddingLeft:3 }}>{t("app.install")}</p>
        <div style={{ ...glass(th,0.04), borderRadius:16, overflow:"hidden" }}>
          {[
            [t("app.st1"),t("app.st1d")],
            [t("app.st2"),t("app.st2d")],
            [t("app.st3"),t("app.st3d")],
            [t("app.st4"),t("app.st4d")],
            [t("app.st5"),t("app.st5d")],
          ].map(([step,detail],i,arr)=>(
            <div key={i} style={{ display:"flex", gap:12, padding:"12px 14px",
              borderBottom: i<arr.length-1 ? `1px solid ${th.b1}` : "none" }}>
              <span style={{ width:22, height:22, borderRadius:"50%", flexShrink:0,
                background:th.s2, border:`1px solid ${th.b1}`,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:10.5, fontWeight:700, color:th.t2 }}>{i+1}</span>
              <div>
                <p style={{ fontSize:13, fontWeight:600 }}>{step}</p>
                <p style={{ fontSize:11.5, color:th.t3, marginTop:2 }}>{detail}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── MUHIM QADAM: qurilma tokenini bog'lash ── */}
        <div style={{ ...glass(th,0.05), borderRadius:16, padding:"16px 16px 18px", marginTop:14 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
            <span style={{ width:8, height:8, borderRadius:"50%",
              background: relayStatus?.connected ? th.ok : th.err }}/>
            <p style={{ fontSize:13, fontWeight:700 }}>
              {relayStatus?.connected ? t("app.devLinked") : t("app.devNot")}
            </p>
          </div>
          {!relayStatus?.connected && (
            <>
              <p style={{ fontSize:11.5, color:th.t3, lineHeight:1.55, marginBottom:12 }}>
                Android ilovada katta tugmani <b>UZOQ BOSING</b> — token ko'rinadi,
                uni nusxalab shu yerga joylashtiring:
              </p>
              <div style={{ display:"flex", gap:8 }}>
                <input value={token} onChange={e=>sToken(e.target.value)}
                  placeholder={t("app.devPh")}
                  style={{ flex:1, padding:"10px 12px", borderRadius:10, fontSize:12.5,
                    fontFamily:"'SF Mono',monospace", background:th.s1,
                    border:`1px solid ${th.b1}`, color:th.t1 }}/>
                <Btn onClick={registerToken} disabled={registering} sz="sm">
                  {registering ? "..." : t("app.devLink")}
                </Btn>
              </div>
            </>
          )}
          {relayStatus?.connected && relayStatus?.deviceModel && (
            <p style={{ fontSize:11.5, color:th.t3 }}>{relayStatus.deviceModel}</p>
          )}
        </div>
      </div>

      {/* ── shaffoflik ogohlantirishi ── */}
      <div style={{ display:"flex", gap:10, padding:"12px 13px", borderRadius:13,
        background:`${th.warn}12`, border:`1px solid ${th.warn}30` }}>
        <Ic.Warn s={14} c={th.warn}/>
        <p style={{ fontSize:11.5, color:th.warn, lineHeight:1.55 }}>
          Faqat Android. Ilova bank SMS larini filtrlab yuboradi — boshqa xabarlarga tegmaydi.
          O'rnatishdan oldin mijozga tushuntiring.
        </p>
      </div>
    </div>
  );
};

// ═════════════════════════════════════════
// STATISTIKA
// ═════════════════════════════════════════

const shiftDay = (n) => { const d = new Date(); d.setDate(d.getDate()+n); return d; };
const WD = ["Yak","Du","Se","Cho","Pay","Ju","Sha"];
const MN = ["Yan","Fev","Mar","Apr","May","Iyn","Iyl","Avg","Sen","Okt","Noy","Dek"];

// demo tarixi — 92 kun
const seedHist = () => {
  const out = [];
  for (let i=91; i>=0; i--) {
    const d  = shiftDay(-i);
    const wd = d.getDay();
    const base = wd===0||wd===6 ? 9 : 15;
    const trend = Math.round((91-i)/91 * 7);
    const n = Math.max(0, base + trend + Math.round(Math.sin(i/3)*4) + Math.floor(Math.random()*7) - 3);
    const h = Array(24).fill(0);
    let rest = n;
    while (rest > 0) { const hr = 9 + Math.floor(Math.random()*14); h[hr]++; rest--; }
    out.push({ d: dayKey(d), n, h });
  }
  return out;
};

// ── katta grafik ──
const BigChart = ({ data, labels, tone, unit="", kind="line" }) => {
  const th  = useTheme();
  const [pick,sPick] = useState(null);
  const W = 320, H = 150, PL = 6, PR = 6, PT = 14, PB = 22;
  const max = Math.max(...data, 1);
  const cw  = W - PL - PR, ch = H - PT - PB;

  const xs = i => PL + (data.length===1 ? cw/2 : (i/(data.length-1))*cw);
  const ys = v => PT + ch - (v/max)*ch;

  const line = data.map((v,i)=>`${i?"L":"M"}${xs(i).toFixed(1)} ${ys(v).toFixed(1)}`).join(" ");
  const area = `${line} L${xs(data.length-1).toFixed(1)} ${PT+ch} L${xs(0).toFixed(1)} ${PT+ch} Z`;
  const gid  = "g"+kind+data.length;

  // ko'rsatiladigan yorliqlar (juda ko'p bo'lsa siyraklashtiramiz)
  const step = data.length > 14 ? Math.ceil(data.length/7) : 1;

  return (
    <div style={{ position:"relative" }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width:"100%", display:"block", overflow:"visible" }}>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0"   stopColor={tone} stopOpacity="0.34"/>
            <stop offset="0.7" stopColor={tone} stopOpacity="0.06"/>
            <stop offset="1"   stopColor={tone} stopOpacity="0"/>
          </linearGradient>
        </defs>

        {/* to'r */}
        {[0,0.5,1].map((f,i)=>(
          <line key={i} className="gridIn" style={{ animationDelay:`${i*0.06}s` }}
            x1={PL} x2={W-PR} y1={PT+ch*f} y2={PT+ch*f}
            stroke={th.b1} strokeWidth="1" strokeDasharray={f===1?"0":"3 5"}/>
        ))}

        {kind==="bar" ? (
          data.map((v,i)=>{
            const bw = Math.max(3, cw/data.length*0.56);
            const x  = xs(i) - bw/2;
            const hh = Math.max(2, (v/max)*ch);
            const on = pick===i;
            return (
              <rect key={i} className="rise" onClick={()=>{hap.tap();sPick(on?null:i);}}
                style={{ animationDelay:`${i*0.03}s`, cursor:"pointer" }}
                x={x} y={PT+ch-hh} width={bw} height={hh} rx={Math.min(4,bw/2)}
                fill={on ? tone : tone} opacity={on?1:0.62}/>
            );
          })
        ) : (
          <>
            <path className="rise" style={{ animationDelay:".1s" }} d={area} fill={`url(#${gid})`}/>
            <path className="draw2" d={line} fill="none" stroke={tone} strokeWidth="2.4"
              strokeLinecap="round" strokeLinejoin="round" pathLength="1"
              style={{ filter:`drop-shadow(0 3px 10px ${tone}55)` }}/>
            {data.map((v,i)=>{
              const on = pick===i;
              const isLast = i===data.length-1;
              if (!on && !isLast && data.length>16) return null;
              return (
                <circle key={i} className="dotPop" onClick={()=>{hap.tap();sPick(on?null:i);}}
                  style={{ animationDelay:`${0.9 + i*0.02}s`, cursor:"pointer" }}
                  cx={xs(i)} cy={ys(v)} r={on?5:isLast?4.5:3}
                  fill={th.bg} stroke={tone} strokeWidth={on?3:2.2}/>
              );
            })}
          </>
        )}

        {/* tanlangan nuqta chizig'i */}
        {pick!=null && (
          <line x1={xs(pick)} x2={xs(pick)} y1={PT} y2={PT+ch}
            stroke={tone} strokeWidth="1" strokeDasharray="3 4" opacity=".5"/>
        )}

        {/* yorliqlar */}
        {labels.map((lb,i)=> (i%step===0 || i===labels.length-1) && (
          <text key={i} x={xs(i)} y={H-6} textAnchor="middle"
            fill={pick===i ? tone : th.t4} fontSize="9" fontFamily="'SF Mono',monospace"
            fontWeight={pick===i?700:400}>{lb}</text>
        ))}
      </svg>

      {/* qalqib chiquvchi qiymat */}
      {pick!=null && (
        <div className="pop" style={{
          position:"absolute", top:0, left:`${(xs(pick)/W)*100}%`, transform:"translate(-50%,-6px)",
          padding:"5px 10px", borderRadius:9, whiteSpace:"nowrap", pointerEvents:"none",
          background:th.bg2, border:`1px solid ${tone}55`,
          boxShadow:`0 6px 20px rgba(0,0,0,.4)`,
        }}>
          <span style={{ fontFamily:"'SF Mono',monospace", fontSize:12.5, fontWeight:800, color:tone }}>
            {data[pick]}
          </span>
          <span style={{ fontSize:10.5, color:th.t3, marginLeft:5 }}>{labels[pick]}{unit}</span>
        </div>
      )}
    </div>
  );
};

// ── ulush chizig'i ──
const ShareBar = ({ name, value, total, tone, i }) => {
  const th = useTheme();
  const pct = total ? Math.round(value/total*100) : 0;
  return (
    <div style={{ display:"flex", alignItems:"center", gap:11 }}>
      <span style={{ width:88, fontSize:12, color:th.t2, overflow:"hidden",
        textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{name}</span>
      <span style={{ flex:1, height:8, borderRadius:4, background:th.b1, overflow:"hidden" }}>
        <span className="barGrow" style={{ display:"block", height:"100%", borderRadius:4,
          width:`${pct}%`, background:tone, animationDelay:`${i*0.07}s` }}/>
      </span>
      <span style={{ width:52, textAlign:"right", fontFamily:"'SF Mono',monospace",
        fontSize:12, fontWeight:700, color:th.t1 }}>{value}</span>
      <span style={{ width:32, textAlign:"right", fontSize:10.5, color:th.t3 }}>{pct}%</span>
    </div>
  );
};

const StatsPage = () => {
  const th = useTheme();
  const { hist, partners=[], workers=[] } = useData();
  const [per,sPer] = useState("day");   // day | week | month

  const today = hist.find(x=>x.d===dayKey()) || { d:dayKey(), n:0, h:Array(24).fill(0) };

  // davr ma'lumoti
  const view = (() => {
    if (per==="day") {
      const from = 6;
      return {
        data: today.h.slice(from),
        labels: today.h.slice(from).map((_,i)=>String(from+i).padStart(2,"0")),
        kind:"bar", unit:":00",
        total: today.n,
        prev: (hist[hist.length-2]?.n) || 0,
        label:t("stats.perToday"), sub:t("stats.subHours"),
      };
    }
    if (per==="week") {
      const w = last(7);
      return {
        data: w.map(x=>x.n),
        labels: w.map(x=>WD[new Date(x.d+"T00:00").getDay()]),
        kind:"line", unit:"",
        total: w.reduce((a,x)=>a+x.n,0),
        prev:  hist.slice(-14,-7).reduce((a,x)=>a+x.n,0),
        label:t("stats.perWeek"), sub:t("stats.subDays",{n:7}),
      };
    }
    const m = last(30);
    return {
      data: m.map(x=>x.n),
      labels: m.map(x=>{ const d=new Date(x.d+"T00:00"); return String(d.getDate()); }),
      kind:"line", unit:t("stats.unitDay"),
      total: m.reduce((a,x)=>a+x.n,0),
      prev:  hist.slice(-60,-30).reduce((a,x)=>a+x.n,0),
      label:t("stats.perMonth"), sub:t("stats.subDays",{n:30}),
    };
  })();

  const growth = view.prev ? Math.round((view.total - view.prev)/view.prev*100) : (view.total?100:0);
  const up     = growth >= 0;
  const avg    = view.data.length ? Math.round(view.total/(per==="day"?1:view.data.length)) : 0;
  const best   = Math.max(...view.data, 0);
  const tone   = th.acc;

  // taqsimot: hamkorlar + o'zim
  const dist = (() => {
    const days = per==="day" ? 1 : per==="week" ? 7 : 30;
    const rows = partners.map(p=>{
      const own = (p.today||0) + (p.history||[]).slice(0,days-1).reduce((a,h)=>a+h.n,0);
      const ws  = workers.filter(w=>w.parent===p.id)
        .reduce((a,w)=>a + (w.today||0) + (per==="day"?0:(w.week||[]).slice(0,days-1).reduce((b,v)=>b+v,0)), 0);
      return { name:p.name, value: own + ws };
    });
    const mine = workers.filter(w=>w.parent==="owner")
      .reduce((a,w)=>a + (w.today||0) + (per==="day"?0:(w.week||[]).slice(0,days-1).reduce((b,v)=>b+v,0)), 0);
    rows.unshift({ name:t("stats.mine"), value: mine });
    return rows.filter(r=>r.value>0).sort((a,b)=>b.value-a.value);
  })();
  const distTotal = dist.reduce((a,r)=>a+r.value,0);

  // eng gavjum soat
  const peakH = today.h.indexOf(Math.max(...today.h));

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:18, maxWidth:680 }}>
      <div>
        <h1 style={{ fontSize:24, fontWeight:800, letterSpacing:"-0.03em", lineHeight:1.1 }}>{t("stats.title")}</h1>
        <p style={{ fontSize:13, color:th.t3, marginTop:3 }}>{t("stats.sub")}</p>
      </div>

      {/* davr */}
      <div style={{ display:"flex", gap:4, padding:4, borderRadius:14, background:th.s1, border:`1px solid ${th.b1}` }}>
        {[{v:"day",l:t("stats.day")},{v:"week",l:t("stats.week")},{v:"month",l:t("stats.month")}].map(x=>{
          const on = per===x.v;
          return (
            <button key={x.v} onClick={()=>{hap.select();sPer(x.v);}} style={{
              flex:1, padding:"9px 10px", borderRadius:10, cursor:"pointer", fontFamily:"inherit",
              fontSize:13, fontWeight:on?700:500,
              background: on ? th.s3 : "transparent",
              border:`1px solid ${on ? th.b2 : "transparent"}`,
              color: on ? th.t1 : th.t3, transition:"all .18s cubic-bezier(.2,0,0,1)",
            }}>{x.l}</button>
          );
        })}
      </div>

      {/* ═══ ASOSIY KARTA ═══ */}
      <div key={per} className="heroIn" style={{
        ...glass(th,0.05), borderRadius:20, padding:"18px 17px 12px", position:"relative", overflow:"hidden",
      }}>
        <span className="glowPulse" style={{ position:"absolute", top:-40, left:"20%", width:"60%", height:110,
          borderRadius:"50%", background:`radial-gradient(ellipse, ${tone}44 0%, transparent 70%)`,
          pointerEvents:"none", filter:"blur(24px)" }}/>

        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between",
          gap:12, marginBottom:14, position:"relative" }}>
          <div>
            <p style={{ fontSize:9.5, fontWeight:700, color:th.t3, letterSpacing:"0.13em",
              textTransform:"uppercase", marginBottom:7 }}>{view.label} · {view.sub}</p>
            <p style={{ fontSize:44, fontWeight:800, fontFamily:"'SF Mono',monospace",
              letterSpacing:"-0.045em", lineHeight:.9 }}>
              <Count value={view.total}/>
            </p>
            <p style={{ fontSize:11.5, color:th.t3, marginTop:6 }}>{t("stats.gotPremium")}</p>
          </div>

          <span style={{ display:"inline-flex", alignItems:"center", gap:5,
            padding:"5px 10px", borderRadius:999, flexShrink:0,
            background: up ? `${th.ok}1a` : `${th.err}1a`,
            border:`1px solid ${up ? th.ok+"3d" : th.err+"3d"}` }}>
            <Ic.Trend s={13} c={up?th.ok:th.err} down={!up}/>
            <span style={{ fontFamily:"'SF Mono',monospace", fontSize:12.5, fontWeight:800,
              color: up?th.ok:th.err }}>{up?"+":""}{growth}%</span>
          </span>
        </div>

        <BigChart data={view.data} labels={view.labels} tone={tone} unit={view.unit} kind={view.kind}/>
      </div>

      {/* ko'rsatkichlar */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:9 }}>
        <StatCard label={per==="day"?t("stats.statPeak"):t("stats.statAvg")}
          value={per==="day" ? `${String(peakH).padStart(2,"0")}:00` : String(avg)}/>
        <StatCard label={t("stats.statBest")} value={String(best)} color={th.acc}/>
        <StatCard label={t("stats.statPrev")} value={String(view.prev)} color={th.t2}/>
      </div>

      {/* taqsimot */}
      {dist.length > 0 && (
        <div style={{ ...glass(th,0.04), borderRadius:16, padding:"15px 16px" }}>
          <p style={{ fontSize:9.5, fontWeight:700, color:th.t3, letterSpacing:"0.13em",
            textTransform:"uppercase", marginBottom:14 }}>{t("stats.dist")}</p>
          <div style={{ display:"flex", flexDirection:"column", gap:11 }}>
            {dist.map((r,i)=>(
              <ShareBar key={r.name} name={r.name} value={r.value} total={distTotal}
                tone={i===0 ? tone : th.b3} i={i}/>
            ))}
          </div>
        </div>
      )}

      {/* oylik taqqoslash */}
      <div style={{ ...glass(th,0.04), borderRadius:16, padding:"15px 16px" }}>
        <p style={{ fontSize:9.5, fontWeight:700, color:th.t3, letterSpacing:"0.13em",
          textTransform:"uppercase", marginBottom:13 }}>{t("stats.byMonth")}</p>
        <div style={{ display:"flex", alignItems:"flex-end", gap:9, height:88 }}>
          {(() => {
            const by = {};
            hist.forEach(x=>{ const d=new Date(x.d+"T00:00"); const k=d.getMonth(); by[k]=(by[k]||0)+x.n; });
            const keys = Object.keys(by).map(Number);
            const mx = Math.max(...Object.values(by), 1);
            return keys.map((k,i)=>{
              const isNow = k === new Date().getMonth();
              return (
                <span key={k} style={{ flex:1, display:"flex", flexDirection:"column",
                  alignItems:"center", gap:6 }}>
                  <span style={{ fontFamily:"'SF Mono',monospace", fontSize:11, fontWeight:700,
                    color: isNow ? tone : th.t3 }}>{by[k]}</span>
                  <span className="rise" style={{ width:"100%", maxWidth:44, borderRadius:7,
                    height:`${Math.max(6,(by[k]/mx)*54)}px`,
                    background: isNow ? tone : th.b2,
                    animationDelay:`${i*0.08}s`,
                    boxShadow: isNow ? `0 3px 14px ${tone}44` : "none" }}/>
                  <span style={{ fontSize:10, color: isNow ? tone : th.t4, fontWeight:isNow?700:400 }}>{MN[k]}</span>
                </span>
              );
            });
          })()}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// BOTTOM NAV
// ─────────────────────────────────────────────
// til almashganda ham yangilanishi uchun funksiya (modul darajasida emas!)
const NAV = () => [
  { id:"premium", lbl:t("nav.premium"), I:Ic.Star  },
  { id:"bots",    lbl:t("nav.bots"),    I:Ic.Bot   },
  { id:"cards",   lbl:t("nav.cards"),   I:Ic.Card  },
  { id:"team",    lbl:t("nav.team"),    I:Ic.Team  },
  { id:"stats",   lbl:t("nav.stats"),   I:Ic.Chart },
];

const ProfileAvatar = ({ size=38, active, onClick }) => {
  const th = useTheme();
  const tg = typeof window!=="undefined" ? window.Telegram?.WebApp : null;
  const user = tg?.initDataUnsafe?.user;
  const photo = user?.photo_url;
  const name = user?.first_name || "A";
  return (
    <button onClick={onClick} aria-label={t("nav.profile")} style={{
      width:size, height:size, borderRadius:"50%", flexShrink:0,
      border:`2px solid ${active ? th.acc : th.b2}`, cursor:"pointer",
      overflow:"hidden", display:"flex", alignItems:"center",
      justifyContent:"center", background:th.s2, padding:0,
      transition:"border-color .2s",
      boxShadow: active ? `0 0 0 3px ${th.accSub}` : "none",
    }}>
      {photo
        ? <img src={photo} width={size} height={size} alt="" style={{ display:"block", objectFit:"cover" }}/>
        : <span style={{ fontSize:14, fontWeight:700, color:th.t2, fontFamily:"inherit" }}>{name.slice(0,1).toUpperCase()}</span>
      }
    </button>
  );
};

const Nav = ({ page, setPage }) => {
  const th   = useTheme();
  const { role } = useData();
  const items = NAV().filter(n =>
    role === "worker" ? (n.id==="premium" || n.id==="cards" || n.id==="stats") : true
  );

  const wrap = useRef(null);
  const tabs = useRef({});
  const [ind,sInd] = useState(null);
  const prev = useRef(null);

  useEffect(()=>{
    const el = tabs.current[page];
    const box = wrap.current;
    if (!el || !box) { sInd(null); return; }
    const r = el.getBoundingClientRect(), rb = box.getBoundingClientRect();
    sInd({ x: r.left - rb.left, w: r.width });
    prev.current = page;
  }, [page, role]);

  const first = prev.current === null;

  return (
    <nav style={{
      position:"fixed", bottom:0, left:0, right:0, zIndex:100,
      display:"flex", justifyContent:"center", alignItems:"flex-end",
      padding:"0 10px calc(20px + env(safe-area-inset-bottom,0px))", pointerEvents:"none",
      background:`linear-gradient(to top, ${th.bg}f2 0%, ${th.bg}88 58%, transparent 100%)`,
    }}>
      <div ref={wrap} style={{
        ...glass(th, 0.08, 56),
        background: th.nav,
        borderRadius:26, padding:"7px 8px",
        display:"flex", alignItems:"center", gap:2,
        width:"100%", maxWidth:520,
        pointerEvents:"all", position:"relative",
        boxShadow: th.id==="light"
          ? `0 2px 8px rgba(16,19,26,0.08), 0 14px 40px rgba(16,19,26,0.16)`
          : `inset 0 1px 0 ${th.b2}, 0 -4px 40px rgba(0,0,0,0.6), 0 10px 44px rgba(0,0,0,0.55)`,
      }}>
        {/* sirg'aluvchi indikator */}
        {ind && (
          <span style={{
            position:"absolute", top:7, bottom:7, left:0,
            width: ind.w, transform:`translateX(${ind.x}px)`,
            borderRadius:19, background:th.accSub,
            border:`1px solid ${th.accBd}`,
            boxShadow:`inset 0 1px 0 ${th.b2}`,
            transition: first ? "none"
              : "transform .42s cubic-bezier(.32,1.22,.36,1), width .42s cubic-bezier(.32,1.22,.36,1)",
            pointerEvents:"none", zIndex:0,
          }}/>
        )}

        {items.map(({ id, lbl, I }) => {
          const on = page === id;
          return (
            <button key={id} ref={el=>{ if(el) tabs.current[id]=el; }}
              onClick={()=>{hap.select();setPage(id);}}
              style={{
                flex:1, minWidth:0, position:"relative", zIndex:1,
                display:"flex", flexDirection:"column", alignItems:"center", gap:4,
                padding:"10px 4px", borderRadius:19,
                fontFamily:"inherit", border:"none", cursor:"pointer",
                background:"transparent",
                WebkitTapHighlightColor:"transparent", touchAction:"manipulation",
              }}>
              <I s={22} c={on ? th.acc : th.t3}/>
              <span style={{ fontSize:10.5, fontWeight:on?700:500, color:on?th.acc:th.t3,
                letterSpacing:"-0.01em", transition:"color .22s", whiteSpace:"nowrap" }}>{lbl}</span>
            </button>
          );
        })}

        <div style={{ width:1, height:26, background:th.b1, margin:"0 4px", flexShrink:0 }}/>
        <ProfileAvatar size={40} active={page==="profile"} onClick={()=>{hap.select();setPage("profile");}}/>
      </div>
    </nav>
  );
};

const LoginFlow = ({ account, onChange }) => {
  const th = useTheme();
  const toast = useToast();
  const [step,sStep]=useState(account?"done":"phone");
  const [phone,sPh]=useState(account||"");
  const [code,sCd]=useState(""); const [pass,sPas]=useState("");
  const [load,sLd]=useState(false); const [err,sEr]=useState("");
  const [fa2,sFa2]=useState(false);
  const si={phone:0,otp:1,pass:2,done:3}[step]??0;
  const run=async (path,body,fn)=>{
    sEr(""); sLd(true);
    try {
      const res = await api.post(path, body);
      fn(res);
    } catch (e) {
      hap.err();
      sEr(e.message || t("err.title"));
    } finally {
      sLd(false);
    }
  };
  const send=()=>!phone.match(/^\+\d{9,15}$/)?sEr(t("login.badPhone")):run("/auth/send-code",{phone},()=>sStep("otp"));
  const verify=()=>code.length<5?sEr(t("login.badCode")):run("/auth/verify-code",{phone,code},(res)=>{
    if (res?.needPassword) { sFa2(true); sStep("pass"); hap.warn(); }
    else { sStep("done"); onChange(phone); hap.ok(); toast({kind:"ok",title:t("login.connected"),note:phone}); }
  });
  const login=()=>!pass?sEr(t("login.needPw")):run("/auth/verify-2fa",{phone,pass},()=>{sStep("done");onChange(phone);hap.ok();toast({kind:"ok",title:t("login.connected"),note:phone});});
  const reset=()=>{sStep("phone");sPh("");sCd("");sPas("");sEr("");sFa2(false);onChange("");};

  if(step==="done") return(
    <div style={{ ...glass(th,0.05),borderRadius:13,padding:"13px 16px",display:"flex",alignItems:"center",gap:13 }}>
      <div style={{ width:38,height:38,borderRadius:10,background:"rgba(52,199,89,0.12)",border:"1px solid rgba(52,199,89,0.2)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}><Ic.Check s={16} c={th.ok}/></div>
      <div style={{ flex:1 }}>
        <p style={{ fontWeight:600,fontSize:13,fontFamily:"'SF Mono','Fira Code',monospace",letterSpacing:"0.3px" }}>{phone}</p>
        <div style={{ display:"flex",gap:5,marginTop:5 }}><Tag v="ok">{t("login.connectedTag")}</Tag>{fa2&&<Tag v="warn">2FA</Tag>}</div>
      </div>
      <Btn v="ghost" sz="sm" onClick={reset}>{t("login.disconnect")}</Btn>
    </div>
  );

  const STEPS=[t("login.stepPhone"),t("login.stepCode"),t("login.step2fa")];
  return(
    <div style={{ ...glass(th,0.04),borderRadius:13,overflow:"hidden" }}>
      <div style={{ display:"flex",alignItems:"center",padding:"12px 16px",borderBottom:`1px solid ${th.b1}` }}>
        {STEPS.map((lbl,i)=>{const dn=si>i,ac=si===i;return(
          <div key={i} style={{ display:"flex",alignItems:"center",flex:i<2?1:"auto" }}>
            <div style={{ display:"flex",alignItems:"center",gap:6 }}>
              <div style={{ width:20,height:20,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,flexShrink:0,transition:"all .25s",background:dn?th.ok:ac?th.acc:"transparent",border:`1.5px solid ${dn?th.ok:ac?th.acc:th.b2}`,color:(dn||ac)?th.accTxt:th.t3 }}>{dn?<Ic.Check s={10} c={th.accTxt}/>:i+1}</div>
              <span style={{ fontSize:11,fontWeight:ac?600:400,color:dn?th.ok:ac?th.t1:th.t3 }}>{lbl}</span>
            </div>
            {i<2&&<div style={{ flex:1,height:1,margin:"0 8px",background:dn?th.ok:th.b1,transition:"background .3s" }}/>}
          </div>
        );})}
      </div>
      <div style={{ padding:16 }}>
        {step==="phone"&&<div style={{ display:"flex",flexDirection:"column",gap:10 }}>
          <p style={{ fontSize:12,color:th.t3 }}>{t("login.hint")}</p>
          <div style={{ display:"flex",gap:9 }}>
            <input value={phone} onChange={e=>sPh(e.target.value)} placeholder={t("login.phonePh")} inputMode="tel" onKeyDown={e=>e.key==="Enter"&&!load&&send()} style={{ fontFamily:"'SF Mono','Fira Code',monospace",fontSize:16,letterSpacing:"0.4px" }}/>
            <Btn onClick={send} disabled={load} style={{ whiteSpace:"nowrap",minWidth:120 }}>{load?<><Ic.Spin s={12}/>{t("login.sending")}</>:t("login.sendCode")}</Btn>
          </div>
          <Err msg={err}/>
        </div>}
        {step==="otp"&&<div style={{ display:"flex",flexDirection:"column",gap:12 }}>
          <div style={{ ...glass(th,0.05),borderRadius:9,padding:"9px 13px",display:"flex",alignItems:"center",gap:8,border:"1px solid rgba(52,199,89,0.18)" }}>
            <Ic.Sig s={13} c={th.ok}/>
            <span style={{ fontSize:12,color:th.t2 }}><span style={{ fontFamily:"monospace",color:th.t1,fontWeight:600 }}>{phone}</span> — {t("login.codeSent")}</span>
          </div>
          <div>
            <Lbl>{t("login.otpLabel")}</Lbl>
            <CodeBoxes value={code} onChange={sCd} onDone={verify} autoFocus/>
            <div style={{ display:"flex",alignItems:"center",gap:9,marginTop:11 }}>
              <p style={{ flex:1,fontSize:11,color:th.t4 }}>{t("login.otpHint")}</p>
              <Btn onClick={verify} disabled={load||code.length<5} style={{ whiteSpace:"nowrap",minWidth:118 }}>{load?<><Ic.Spin s={12}/>...</>:<><Ic.Check/>{t("login.confirm")}</>}</Btn>
            </div>
          </div>
          <Err msg={err}/>
          <div style={{ display:"flex",gap:16 }}>
            {[t("login.resend"),t("login.changePhone")].map((label,i)=><button key={i} onClick={i===0?send:()=>{sStep("phone");sCd("");sEr("");}} style={{ background:"none",border:"none",color:th.t3,fontSize:11,cursor:"pointer",fontFamily:"inherit",textDecoration:"underline" }}>{label}</button>)}
          </div>
        </div>}
        {step==="pass"&&<div style={{ display:"flex",flexDirection:"column",gap:10 }}>
          <div style={{ ...glass(th,0.05),borderRadius:9,padding:"9px 13px",display:"flex",alignItems:"center",gap:8,border:"1px solid rgba(255,69,58,0.18)" }}>
            <Ic.Lock s={13} c={th.err}/>
            <span style={{ fontSize:12,color:th.t2 }}>{t("login.has2fa")}</span>
          </div>
          <div>
            <Lbl>{t("login.pwLabel")}</Lbl>
            <div style={{ display:"flex",gap:9 }}>
              <input type="password" value={pass} onChange={e=>sPas(e.target.value)} placeholder={t("login.pwPh")} autoFocus onKeyDown={e=>e.key==="Enter"&&!load&&login()}/>
              <Btn onClick={login} disabled={load}>{load?<><Ic.Spin s={12}/>...</>:t("login.enter")}</Btn>
            </div>
          </div>
          <Err msg={err}/>
        </div>}
      </div>
    </div>
  );
};

const BotRow = ({ bot, idx, onChange }) => {
  const th = useTheme();
  const toast = useToast();
  const [inp,sI]=useState(""); const [open,sO]=useState(false); const [err,sE]=useState("");
  const u=bot.connected?bot.active/bot.maxLogins:0;
  const [busy,sBusy]=useState(false);
  const conn=async ()=>{
    if(busy) return;
    if(!inp.startsWith("@")){hap.err();sE(t("bot.needAt"));return;}
    sBusy(true); sE("");
    try {
      await api.post("/bots/connect", { slot: idx+1, username: inp, maxLogins: bot.maxLogins||15 });
      onChange({...bot,username:inp,connected:true,active:0});
      hap.ok(); toast({kind:"ok",title:t("bot.connect"),note:inp});
      sI(""); sO(false);
    } catch (e) {
      hap.err(); sE(e.message || "Ulanmadi");
    } finally { sBusy(false); }
  };
  const disc=async ()=>{
    try { await api.post(`/bots/${idx+1}/disconnect`, {}); }
    catch (e) { logErr("bots/disconnect", e); }
    onChange({ ...bot, username:"", connected:false, active:0, online:false });
  };
  return(
    <div style={{ ...glass(th,0.04),borderRadius:13,overflow:"hidden",border:`1px solid ${bot.connected&&bot.online?"rgba(52,199,89,0.15)":th.b1}` }}>
      <div style={{ display:"flex",alignItems:"center",gap:11,padding:"12px 14px" }}>
        <div style={{ width:30,height:30,borderRadius:8,flexShrink:0,background:bot.connected?th.accSub:th.s1,border:`1px solid ${bot.connected?th.accBd:th.b1}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:bot.connected?th.acc:th.t3,fontFamily:"monospace" }}>{idx+1}</div>
        {bot.connected?<>
          <div style={{ flex:1,minWidth:0 }}>
            <p style={{ fontWeight:600,fontSize:13,fontFamily:"monospace",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{bot.username}</p>
            <div style={{ display:"flex",alignItems:"center",gap:7,marginTop:4 }}>
              <div style={{ flex:1,maxWidth:100,height:2,background:th.b1,borderRadius:1 }}><div style={{ height:"100%",borderRadius:1,width:`${u*100}%`,background:u>.8?th.err:th.ok,transition:"width .4s" }}/></div>
              <span style={{ fontSize:10,color:th.t3 }}>{bot.active}/{bot.maxLogins}</span>
            </div>
          </div>
          <div style={{ display:"flex",gap:7,alignItems:"center",flexShrink:0 }}>
            <div style={{ width:5,height:5,borderRadius:"50%",background:bot.online?th.ok:th.t3 }}/>
            <Btn v="ghost" sz="sm" onClick={()=>onChange({...bot,online:!bot.online})}>{bot.online?t("bots.stop"):t("bots.start")}</Btn>
            <Btn v="danger" sz="sm" onClick={disc}><Ic.Trash/></Btn>
          </div>
        </>:<>
          <span style={{ flex:1,color:th.t3,fontSize:13 }}>{t("bots.emptySlot")}</span>
          <Btn v="outline" sz="sm" onClick={()=>sO(!open)}>{open?t("common.cancel"):<><Ic.Plus/>{t("bots.share")}</>}</Btn>
        </>}
      </div>
      {open&&!bot.connected&&<div style={{ padding:"11px 14px",borderTop:`1px solid ${th.b1}`,background:th.id==="light"?"rgba(16,19,26,0.03)":"rgba(0,0,0,0.2)",display:"flex",flexDirection:"column",gap:7 }}>
        <div style={{ display:"flex",gap:9 }}><input value={inp} onChange={e=>sI(e.target.value)} placeholder="@BotUsername" autoFocus onKeyDown={e=>e.key==="Enter"&&!busy&&conn()}/><Btn onClick={conn} disabled={busy} style={{ whiteSpace:"nowrap" }}>{busy?t("bot.connecting"):t("bots.share")}</Btn></div>
        <Err msg={err}/>
      </div>}
      {bot.connected&&<div style={{ padding:"8px 14px",borderTop:`1px solid ${th.b1}`,background:th.id==="light"?"rgba(16,19,26,0.025)":"rgba(0,0,0,0.15)",display:"flex",alignItems:"center",gap:8 }}>
        <span style={{ fontSize:10,fontWeight:600,color:th.t3,letterSpacing:"0.06em" }}>MAX</span>
        {[5,10,15].map(n=><button key={n} onClick={()=>onChange({...bot,maxLogins:n})} style={{ padding:"2px 9px",borderRadius:6,cursor:"pointer",fontFamily:"inherit",fontSize:10,fontWeight:600,background:bot.maxLogins===n?th.accSub:"transparent",border:`1px solid ${bot.maxLogins===n?th.accBd:th.b1}`,color:bot.maxLogins===n?th.acc:th.t3,transition:"all .15s" }}>{n}</button>)}
      </div>}
    </div>
  );
};

const BotsPage = () => {
  const th = useTheme();
  const toast = useToast();
  const { account:acc, setAccount:sAcc, bots=[], setBots:sBots } = useData();
  const [saved,sSav]=useState(false);
  const conn=bots.filter(b=>b.connected); const ready=acc&&conn.length>0;
  const upB=(i,v)=>sBots(p=>{const n=[...p];n[i]=v;return n;});
  return(
    <div style={{ display:"flex",flexDirection:"column",gap:22,maxWidth:680 }}>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12 }}>
        <div><h1 style={{ fontSize:24,fontWeight:800,letterSpacing:"-0.03em",lineHeight:1.1 }}>{t("bots.title")}</h1><p style={{ fontSize:13,color:th.t3,marginTop:3 }}>{t("bots.sub")}</p></div>
        <Tag v={ready?"ok":"warn"}>{ready?t("bots.ready"):t("bots.needSetup")}</Tag>
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:9 }}>
        <StatCard label={t("bots.count")}   value={`${conn.length}/3`} color={conn.length?th.acc:th.t3}/>
        <StatCard label={t("bots.capacity")} value={`${conn.reduce((s,b)=>s+b.maxLogins,0)}`}/>
        <StatCard label={t("bots.status")}   value={ready?t("bots.active"):t("bots.inactive")} color={ready?th.ok:th.warn}/>
      </div>
      <div>
        <Sec icon={<Ic.Lock s={14} c={th.t2}/>} label={t("bots.accessAcc")} sub={t("bots.accessAccSub")}/>
        <LoginFlow account={acc} onChange={sAcc}/>
        {!acc&&<div style={{ ...glass(th,0.05),borderRadius:9,padding:"9px 13px",display:"flex",alignItems:"center",gap:7,marginTop:9,border:"1px solid rgba(255,159,10,0.18)" }}><Ic.Warn s={13} c={th.warn}/><span style={{ fontSize:12,color:th.warn }}>{t("bots.accWarn")}</span></div>}
      </div>
      <HR/>
      <div>
        <Sec icon={<Ic.Bot s={14} c={th.t2}/>} label={t("bots.numBots")} sub={t("bots.numBotsSub")}/>
        <div style={{ display:"flex",flexDirection:"column",gap:7 }}>
          {bots.map((b,i)=><BotRow key={b.id} bot={b} idx={i} onChange={v=>upB(i,v)}/>)}
        </div>
      </div>
      <HR/>
      <div style={{ ...glass(th,0.04),borderRadius:13,padding:"15px 17px" }}>
        <p style={{ fontSize:10,fontWeight:700,color:th.t3,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:13 }}>{t("bots.how")}</p>
        <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
          {[[t("bots.s1"),acc||"—",t("bots.d1")],[t("bots.s2"),conn.map(b=>b.username).join(", ")||"—",t("bots.d2")],[t("bots.s3"),"Login",t("bots.d3")],[t("bots.s4"),tArray("premium.step")[3],t("bots.d4")]].map(([s,v,detail],i)=>(
            <div key={i} style={{ display:"flex",alignItems:"flex-start",gap:11 }}>
              <div style={{ width:20,height:20,borderRadius:"50%",flexShrink:0,marginTop:1,background:th.accSub,border:`1px solid ${th.accBd}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:th.acc }}>{i+1}</div>
              <div><p style={{ fontSize:12,color:th.t2 }}>{s} — <span style={{ fontFamily:"monospace",fontWeight:700,color:th.t1 }}>{v}</span></p><p style={{ fontSize:11,color:th.t3 }}>{detail}</p></div>
            </div>
          ))}
        </div>
      </div>
      <Btn onClick={()=>{sSav(true);hap.ok();toast({kind:'ok',title:t('bots.saved'),note:t('bots.saveNote',{n:conn.length,acc:acc||'—'})});setTimeout(()=>sSav(false),2000);}} full sz="lg" disabled={!ready}>{saved?<><Ic.Check/>{t("common.saved")}</>:t("common.save")}</Btn>
    </div>
  );
};

// ─────────────────────────────────────────────
// CARDS
// ─────────────────────────────────────────────
// Rasmiy bank ro'yxati — domen orqali logo olinadi (Clearbit),
// topilmasa avtomatik iTunes qidiruviga, undan keyin bosh harflarga tushadi.
const BL=[
  {id:"kapital",  name:"Kapitalbank",     c:"#E5383B", domain:"kapitalbank.uz"},
  {id:"uzcard",   name:"Uzcard",          c:"#3B82F6", domain:"uzcard.uz"},
  {id:"humo",     name:"Humo",            c:"#22C55E", domain:"humocard.uz"},
  {id:"payme",    name:"Payme",           c:"#0EA5E9", domain:"payme.uz"},
  {id:"click",    name:"Click",           c:"#10B981", domain:"click.uz"},
  {id:"hamkor",   name:"Hamkorbank",      c:"#F59E0B", domain:"hamkorbank.uz"},
  {id:"ipoteka",  name:"Ipoteka",         c:"#8B5CF6", domain:"ipotekabank.uz"},
  {id:"xalq",     name:"Xalq banki",      c:"#059669", domain:"xb.uz"},
  {id:"tbc",      name:"TBC Bank",        c:"#0D9488", domain:"tbcbank.uz"},
  {id:"anor",     name:"Anorbank",        c:"#DC2626", domain:"anorbank.uz"},
  {id:"asaka",    name:"Asakabank",       c:"#B91C1C", domain:"asakabank.uz"},
  {id:"agro",     name:"Agrobank",        c:"#16A34A", domain:"agrobank.uz"},
  {id:"uzum",     name:"Uzum Bank",       c:"#9333EA", domain:"uzumbank.uz"},
  {id:"milliy",   name:"Milliy bank",     c:"#B45309", domain:"nbu.uz"},
  {id:"sqb",      name:"SQB",             c:"#1D4ED8", domain:"sqb.uz"},
  {id:"ipak",     name:"Ipak Yuli",       c:"#15803D", domain:"ipakyulibank.uz"},
  {id:"tez",      name:"Tez",             c:"#374151", domain:"tez.uz"},
  {id:"myturon",  name:"MyTuron",         c:"#1E40AF", domain:"turonbank.uz"},
  {id:"unired",   name:"Unired",          c:"#0EA5E9", domain:"unired.uz"},
  {id:"alliance", name:"AlliancePay",     c:"#7C3AED", domain:"aab.uz"},
  {id:"ofb",      name:"OFB",             c:"#0891B2", domain:"ofb.uz"},
  {id:"zoomrad",  name:"Zoomrad",         c:"#F97316", domain:"zoomrad.uz"},
  {id:"monix",    name:"Monix",           c:"#6366F1", domain:"monix.uz"},
  {id:"octo",     name:"Octo",            c:"#059669", domain:"octobank.uz"},
  {id:"infin",    name:"InfinBANK",       c:"#0D9488", domain:"infinbank.uz"},
];
const gB=id=>BL.find(b=>b.id===id)||{id:"x",name:id||"Bank",c:"#888"};
const bC={};
const Ava=({bid,n=36})=>{
  const th = useTheme();
  const b  = gB(bid);
  // 24 px va undan kichik belgilar uchun tarmoqqa chiqmaymiz
  const [u,sU]   = useState(bC[bid] || null);
  const [go,sGo] = useState(!!bC[bid]);   // yuklandi
  const tiny = n <= 24;

  useEffect(()=>{
    if (tiny) return;
    if (bC[bid]) { sU(bC[bid]); sGo(true); return; }
    let dead = false;

    // 1-urinish — rasmiy sayt logotipi (bank domeni orqali)
    if (b.domain) {
      const url = `https://www.google.com/s2/favicons?domain=${b.domain}&sz=128`;
      const img = new Image();
      img.onload = () => { if(!dead){ bC[bid]=url; sU(url); sGo(true); } };
      img.onerror = () => { if(!dead) fallbackSearch(); };
      img.src = url;
    } else {
      fallbackSearch();
    }

    function fallbackSearch() {
      // 2-urinish — App Store'dagi ilova ikonkasi
      const t = setTimeout(()=>{ if(!dead) sGo(true); }, 1800);
      fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(b.name+" uzbekistan")}&country=uz&entity=software&limit=3`)
        .then(r=>r.json())
        .then(d=>{
          clearTimeout(t);
          if (dead) return;
          const a0 = d.results?.[0]?.artworkUrl512;
          if (a0) { const url = a0.replace("512x512","64x64"); bC[bid]=url; sU(url); }
          sGo(true);
        })
        .catch(()=>{ clearTimeout(t); if(!dead) sGo(true); });
    }

    return ()=>{ dead = true; };
  },[bid, tiny]);

  const r = n*0.22;

  // ── kichik belgi: bank harflari (tez, tarmoqsiz, aniq) ──
  if (tiny) return (
    <span className="iconIn" title={b.name} style={{
      width:n, height:n, borderRadius:r, flexShrink:0,
      background:`${b.c}18`, border:`1px solid ${b.c}30`,
      display:"flex", alignItems:"center", justifyContent:"center",
      fontSize:n*.34, fontWeight:800, color:b.c,
    }}>{b.name.slice(0,2).toUpperCase()}</span>
  );

  // ── skelet ──
  if (!go) return (
    <span style={{
      width:n, height:n, borderRadius:r, flexShrink:0, display:"block",
      position:"relative", overflow:"hidden",
      background:th.s2, border:`1px solid ${th.b1}`,
    }}>
      <span className="shine" style={{
        position:"absolute", top:0, bottom:0, left:0, width:"58%",
        background:`linear-gradient(90deg, transparent, ${th.b2}, transparent)`,
      }}/>
    </span>
  );

  // ── haqiqiy ikon ──
  if (u) return (
    <span className="iconIn" style={{ width:n, height:n, borderRadius:r, overflow:"hidden", flexShrink:0, display:"block" }}>
      <img src={u} width={n} height={n} alt="" style={{ display:"block" }} onError={()=>sU(null)}/>
    </span>
  );

  // ── zaxira: bosh harflar ──
  return (
    <span className="iconIn" style={{
      width:n, height:n, borderRadius:r, flexShrink:0,
      background:`${b.c}18`, border:`1px solid ${b.c}2a`,
      display:"flex", alignItems:"center", justifyContent:"center",
      fontSize:n*.26, fontWeight:800, color:b.c,
    }}>{b.name.slice(0,2).toUpperCase()}</span>
  );
};





// ── SANAYDIGAN RAQAM ──────────────────────
const useCountUp = (target, ms=780) => {
  const [v,sV]  = useState(0);
  const from    = useRef(0);
  const raf     = useRef(0);

  useEffect(()=>{
    const num = Number(target);
    if (!isFinite(num)) { sV(target); return; }
    const a = from.current, b = num, t0 = performance.now();
    if (a === b) { sV(b); return; }

    if (ms <= 0) { from.current = num; sV(num); return; }
    const tick = now => {
      const p = Math.min(1, (now - t0) / ms);
      // yumshoq to'xtash + ozgina oshib qaytish
      const e = p < 1
        ? 1 - Math.pow(1 - p, 3) + Math.sin(p * Math.PI) * 0.055 * (1 - p)
        : 1;
      sV(Math.round(a + (b - a) * e));
      if (p < 1) raf.current = requestAnimationFrame(tick);
      else { from.current = b; sV(b); }
    };
    raf.current = requestAnimationFrame(tick);
    return ()=>cancelAnimationFrame(raf.current);
  }, [target]);

  return v;
};

const Count = ({ value, style }) => {
  const num  = /^-?\d+$/.test(String(value));
  // "Harakatni kamaytirish" yoniq bo'lsa raqam darhol ko'rinadi —
  // aks holda bu sozlama faqat CSS ga ta'sir qilib, JS animatsiyalari
  // (sanoqlar, "otish" effekti) o'z-o'zidan o'chmay qolardi
  const { cfg } = useContext(DataCtx) || {};
  const shown = useCountUp(num ? Number(value) : 0, cfg?.calm ? 0 : 780);
  if (!num) return <span className="numIn" key={value} style={style}>{value}</span>;
  return <span style={{ ...style, fontVariantNumeric:"tabular-nums" }}>{shown}</span>;
};


// ═════════════════════════════════════════
// SOZLAMA ELEMENTLARI
// ═════════════════════════════════════════
const Switch = ({ on, onChange, tone, label }) => {
  const th = useTheme();
  const c  = tone || th.acc;
  return (
    <button onClick={()=>{ hap.tap(); onChange(!on); }}
      role="switch" aria-checked={on} aria-label={label}
      style={{
        width:50, height:30, borderRadius:15, flexShrink:0, position:"relative",
        cursor:"pointer", border:`1px solid ${on ? c+"66" : th.b2}`,
        background: on ? c : th.s2,
        transition:"background .28s cubic-bezier(.3,.9,.3,1), border-color .28s",
        boxShadow: on ? `0 0 0 3px ${c}1f` : "none",
        WebkitTapHighlightColor:"transparent", touchAction:"manipulation", padding:0,
      }}>
      <span key={String(on)} className="knob" style={{
        position:"absolute", top:3, left:3, width:22, height:22, borderRadius:11,
        background: on ? (th.id==="light" ? "#fff" : th.accTxt) : th.t3,
        transform:`translateX(${on ? 20 : 0}px)`,
        transition:"transform .3s cubic-bezier(.32,1.3,.36,1), background .28s",
        boxShadow:"0 1px 3px rgba(0,0,0,.3)",
        transformOrigin: on ? "right center" : "left center",
      }}/>
    </button>
  );
};

// ESLATMA: bu komponent MODUL darajasida turadi. Agar Stepper ichida
// e'lon qilinsa, har render'da yangi komponent deb hisoblanadi va tugmalar
// qayta o'rnatiladi — animatsiya qayta boshlanadi, fokus yo'qoladi.
const StepKey = ({ th, d, value, min, max, step, onChange, children }) => {
  const bump = () => {
    const v = Math.max(min, Math.min(max, value + d*step));
    if (v !== value) { hap.select(); onChange(v); }
  };
  const off = d < 0 ? value <= min : value >= max;
  return (
    <button onClick={bump} disabled={off} aria-label={`${d < 0 ? "-" : "+"}1`}
      style={{
        width:40, height:40, borderRadius:11, flexShrink:0, cursor: off ? "default" : "pointer",
        background:"transparent", border:"none", color:th.t2,
        display:"flex", alignItems:"center", justifyContent:"center",
        opacity: off ? .25 : 1,
        transition:"opacity .18s", WebkitTapHighlightColor:"transparent",
      }}>{children}</button>
  );
};

const Stepper = ({ value, min=1, max=99, step=1, unit, onChange, width=104 }) => {
  const th = useTheme();
  const Key = p => <StepKey th={th} {...p} value={value} min={min} max={max} step={step} onChange={onChange}/>;
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", flexShrink:0, width,
      background:th.s1, border:`1px solid ${th.b1}`, borderRadius:12, padding:2,
    }}>
      <Key d={-1}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M5 12h14"/></svg></Key>
      <span style={{ flex:1, textAlign:"center", minWidth:0 }}>
        <span key={value} className="numIn" style={{
          display:"inline-block", fontFamily:"'SF Mono','Fira Code',monospace",
          fontSize:14, fontWeight:700, color:th.t1, fontVariantNumeric:"tabular-nums",
        }}>{value}</span>
        {unit && <span style={{ fontSize:10.5, color:th.t3, marginLeft:2 }}>{unit}</span>}
      </span>
      <Key d={1}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg></Key>
    </span>
  );
};

const Segments = ({ value, options, onChange }) => {
  const th = useTheme();
  return (
    <span role="radiogroup" style={{ display:"inline-flex", gap:3, background:th.s1, border:`1px solid ${th.b1}`,
      borderRadius:11, padding:3, flexShrink:0 }}>
      {options.map(o=>{
        const on = o.v===value;
        return (
          <button key={o.v} role="radio" aria-checked={on} onClick={()=>{ hap.select(); onChange(o.v); }}
            style={{
              padding:"8px 11px", borderRadius:8, cursor:"pointer", border:"none",
              minHeight:34,
              fontFamily:"inherit", fontSize:12, fontWeight:on?700:500,
              background: on ? th.s3 : "transparent",
              color: on ? th.t1 : th.t3,
              transition:"all .2s cubic-bezier(.2,0,0,1)",
              WebkitTapHighlightColor:"transparent",
            }}>{o.l}</button>
        );
      })}
    </span>
  );
};

const SetGroup = ({ label, children, delay=0 }) => {
  const th = useTheme();
  return (
    <div className="rowIn" style={{ animationDelay:`${delay}s` }}>
      <p style={{ fontSize:10, fontWeight:700, color:th.t3, letterSpacing:"0.14em",
        textTransform:"uppercase", marginBottom:9, paddingLeft:3 }}>{label || t("common.delete")}</p>
      <div style={{ ...glass(th,0.04), borderRadius:16, overflow:"hidden" }}>{children}</div>
    </div>
  );
};

const SetRow = ({ icon, title, note, right, onClick, tone, last }) => {
  const th = useTheme();
  const [h,sH] = useState(false);
  const Tag2 = onClick ? "button" : "div";
  return (
    <Tag2 onClick={onClick ? (e)=>{hap.tap();onClick(e);} : undefined}
      onMouseEnter={()=>sH(true)} onMouseLeave={()=>sH(false)}
      style={{
        width:"100%", display:"flex", alignItems:"center", gap:12,
        padding:"13px 14px", textAlign:"left", border:"none",
        borderBottom: last ? "none" : `1px solid ${th.b1}`,
        background: onClick && h ? th.s1 : "transparent",
        cursor: onClick ? "pointer" : "default", fontFamily:"inherit",
        transition:"background .16s", WebkitTapHighlightColor:"transparent",
      }}>
      {icon && (
        <span style={{
          width:32, height:32, borderRadius:10, flexShrink:0,
          background: tone ? `${tone}18` : th.s2, border:`1px solid ${tone ? tone+"2e" : th.b1}`,
          display:"flex", alignItems:"center", justifyContent:"center",
        }}>{icon}</span>
      )}
      <span style={{ flex:1, minWidth:0 }}>
        <span style={{ display:"block", fontSize:14, fontWeight:600, color: tone || th.t1,
          letterSpacing:"-0.01em" }}>{title}</span>
        {note && <span style={{ display:"block", fontSize:11.5, color:th.t3, marginTop:2, lineHeight:1.45 }}>{note}</span>}
      </span>
      {right}
    </Tag2>
  );
};

// bosib turib tasdiqlash
const HoldBtn = ({ label, done, tone, disabled }) => {
  const th = useTheme();
  const c = tone || th.err;
  const [live,sLive] = useState(false);
  const [p1,sP1] = useState(0);
  const timer = useRef(null);
  const raf = useRef(0);

  const start = () => {
    // touch va sichqoncha hodisasi ketma-ket keladi — ikkinchisi
    // taymerni qayta bosib, "1.4 s" muddatni uzaytirib yuboradi
    if (timer.current || disabled) return;
    sLive(true); hap.press();
    const t0 = performance.now();
    const paint = now => { sP1(Math.min(1, (now - t0) / 1400)); raf.current = requestAnimationFrame(paint); };
    raf.current = requestAnimationFrame(paint);
    timer.current = setTimeout(()=>{
      timer.current = null; cancelAnimationFrame(raf.current);
      hap.heavy(); sLive(false); sP1(0); done();
    }, 1400);
  };
  const stop = () => {
    cancelAnimationFrame(raf.current);
    if (!timer.current) return;
    clearTimeout(timer.current); timer.current = null; sLive(false); sP1(0);
  };

  useEffect(()=>()=>{ if (timer.current) clearTimeout(timer.current); cancelAnimationFrame(raf.current); }, []);

  return (
    <button
      // klaviatura: Enter yoki Space bosib turish ham 1.4 s ishlaydi
      onKeyDown={e=>{ if (e.key === "Enter" || e.key === " ") { e.preventDefault(); start(); } }}
      onKeyUp={e=>{ if (e.key === "Enter" || e.key === " ") stop(); }}
      onBlur={stop}
      onTouchStart={start} onTouchEnd={stop} onTouchCancel={stop}
      onMouseDown={start} onMouseUp={stop} onMouseLeave={stop}
      onContextMenu={e=>e.preventDefault()}
      disabled={disabled}
      aria-label={label}
      className={live ? "danger" : undefined}
      style={{
        position:"relative", width:"100%", padding:"13px", borderRadius:13,
        overflow:"hidden", cursor: disabled ? "default" : "pointer", fontFamily:"inherit",
        background:`${c}${disabled ? "0a" : "14"}`, border:`1px solid ${c}${disabled ? "18" : "3a"}`,
        color: disabled ? th.t4 : c,
        fontSize:13.5, fontWeight:700, letterSpacing:"-0.01em",
        opacity: disabled ? .7 : 1,
        WebkitTapHighlightColor:"transparent", touchAction:"manipulation",
      }}>
      <span className="fill" style={{ position:"absolute", inset:0, pointerEvents:"none",
        background:`${c}2e`, transform:`scaleX(${p1})`, transformOrigin:"left center",
        transition: live ? "none" : "transform .2s" }}/>
      <span style={{ position:"relative" }}>{live ? t("common.hold") : label}</span>
    </button>
  );
};


// ═════════════════════════════════════════
// SOZLAMALAR
// ═════════════════════════════════════════
const SettingsPage = (props) => {
  const { onBack, lang, setLang: onLang, themeId, setThemeId } = props;
  const th    = useTheme();
  const toast = useToast();
  const { cfg, setCfg, people=[], bots=[], setPeople, setBots, setAccount, role, setRole, setPin,
          setCodes, setPartners, setWorkers, setHist } = useData();

  const [ask,sAsk] = useState(null);
  const set = (k,v) => setCfg(c=>({ ...c, [k]:v }));

  const cards = people.reduce((a,p)=>a+(p.cards||[]).length,0);
  const wired = bots.filter(b=>b.connected).length;

  const resetBots = b => b.map(x=>({ id:x.id, username:"", connected:false, active:0,
                                    maxLogins:x.maxLogins||15, online:false }));

  const wipe = (what) => {
    if (what==="cards") { setPeople([]); toast({kind:"ok",title:t("set.cardsCleared")}); }
    if (what==="bots")  { setBots(resetBots); setAccount(""); toast({kind:"ok",title:t("set.botsCleared")}); }
    if (what==="all") {
      // "Hammasini o'chirish" — taklif kodlari, jamoa va tarix ham kiradi,
      // aks holda ular localStorage'da qolib ketardi
      setPeople([]); setBots(resetBots); setAccount("");
      setCodes([]); setPartners([]); setWorkers([]); setHist([]);
      setPin(null); setRole("owner");
      try { localStorage.removeItem("premolux_active_order"); } catch (e) { logErr("order/clear", e); }
      toast({kind:"err",title:t("set.allCleared")});
    }
    sAsk(null);
  };

  const backup = async () => {
    const data = JSON.stringify({ v:1, at:new Date().toISOString(), people, bots, cfg }, null, 2);
    const ok = await copyText(data);
    ok ? toast({kind:"ok",title:t("set.backupOk"),note:t("set.backupOkNote",{c:cards,b:wired}),ms:3000})
       : toast({kind:"err",title:t("set.backupErr")});
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20, maxWidth:640, paddingBottom:8 }}>
      {ask && (
        <Modal onClose={()=>sAsk(null)}>
          <div style={{ padding:"24px 22px", display:"flex", flexDirection:"column", gap:17 }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <span style={{ width:38, height:38, borderRadius:12, flexShrink:0, background:`${th.err}18`,
                border:`1px solid ${th.err}35`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <Ic.Warn s={17} c={th.err}/>
              </span>
              <div>
                <p style={{ fontWeight:700, fontSize:15.5, letterSpacing:"-0.02em" }}>{ask.title}</p>
                <p style={{ fontSize:12.5, color:th.t3, marginTop:3, lineHeight:1.5 }}>{ask.note}</p>
              </div>
            </div>
            <HoldBtn label={t("set.wipeHold")} done={()=>wipe(ask.what)}/>
            <Btn v="ghost" full onClick={()=>sAsk(null)}>Bekor</Btn>
          </div>
        </Modal>
      )}

      {/* sarlavha */}
      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
        <button onClick={onBack} aria-label={t("common.back")} style={{
          width:34, height:34, borderRadius:10, flexShrink:0, cursor:"pointer",
          background:th.s1, border:`1px solid ${th.b1}`, color:th.t2,
          display:"flex", alignItems:"center", justifyContent:"center",
        }}><Ic.Left/></button>
        <div>
          <h1 style={{ fontSize:23, fontWeight:800, letterSpacing:"-0.03em", lineHeight:1.1 }}>{t("set.title")}</h1>
          <p style={{ fontSize:12, color:th.t3, marginTop:2 }}>{t("set.sub")}</p>
        </div>
      </div>

      {/* ── OQIM ── */}
      <SetGroup label={t("set.flow")} delay={0.02}>
        <SetRow icon={<Ic.Bot s={16} c={th.t2}/>} title={t("set.flowStreams")}
          note={t("set.streamsNote")}
          right={<Stepper value={cfg.streams} min={1} max={20} onChange={v=>set("streams",v)} width={94}/>}/>
        <SetRow icon={<Ic.Sig s={16} c={th.t2}/>} title={t("set.flowRetry")}
          note={t("set.retryNote2")}
          right={<Stepper value={cfg.retry} min={0} max={5} onChange={v=>set("retry",v)} width={94}/>}/>
        <SetRow icon={<Ic.Card s={16} c={th.t2}/>} title={t("set.flowCap")}
          note={t("set.capNote2")}
          right={<Stepper value={cfg.cardCap} min={1} max={10} onChange={v=>set("cardCap",v)} width={94}/>} last/>
      </SetGroup>

      {/* ── XAVFSIZLIK ── */}
      <SetGroup label={t("set.security")} delay={0.07}>
        <SetRow icon={<Ic.Lock s={16} c={th.ok}/>} title={t("set.pin")}
          note={t("set.pinOffNote")}
          right={<Tag>{t("set.pinTelegram")}</Tag>}/>
        <SetRow icon={<Ic.Sig s={16} c={th.t2}/>} title={t("set.pinReset")}
          note={t("set.pinResetNote")}
          right={<Ic.Right s={14} c={th.t3}/>}
          onClick={()=>{ setPin(null); toast({kind:"warn",title:t("set.pinCleared"),note:t("set.pinClearedNote")}); }}/>
        <SetRow icon={<Ic.Card s={16} c={th.t2}/>} title={t("set.maskPan")}
          note={t("set.maskNote2")}
          right={<Switch on={cfg.maskPan} onChange={v=>set("maskPan",v)}/>}/>
        {/* eslatma: bu qator HECH NARSA qilmaydi — oyna ochilmaydi, hech
            narsa yuklanmaydi. Backend hali sessiya ro'yxatini bermagani uchun
            vaqtincha bosilmaydigan axborot qatori qilib qoldirildi. */}
        <SetRow icon={<Ic.User s={16} c={th.t4}/>} title={t("set.devices")}
          note={t("set.sessionsSoon")} last/>
      </SetGroup>

      {/* ── BILDIRISHNOMA ── */}
      <SetGroup label={t("set.notif")} delay={0.12}>
        <SetRow icon={<Ic.Star s={16} c={th.t2}/>} title={t("set.notifOk")}
          note={t("set.nOkNote")}
          right={<Switch on={cfg.nOk} onChange={v=>set("nOk",v)} tone={th.ok}/>}/>
        <SetRow icon={<Ic.Warn s={16} c={th.t2}/>} title={t("set.notifLimit")}
          note={t("set.nLimitNote")}
          right={<Switch on={cfg.nLimit} onChange={v=>set("nLimit",v)} tone={th.warn}/>}/>
        <SetRow icon={<Ic.X s={16} c={th.t2}/>} title={t("set.notifErr")}
          note={t("set.nErrNote")}
          right={<Switch on={cfg.nErr} onChange={v=>set("nErr",v)} tone={th.err}/>}/>
        <SetRow icon={<Ic.Clock s={16} c={th.t2}/>} title={t("set.daily")}
          note={cfg.daily ? t("set.dailyNote") : t("set.dailyOff")}
          right={<Switch on={cfg.daily} onChange={v=>set("daily",v)}/>} last={!cfg.daily}/>
        {cfg.daily && (
          <SetRow icon={<Ic.Sig s={16} c={th.t2}/>} title={t("set.dailyTime")}
            right={<Stepper value={cfg.dailyAt} min={0} max={23} unit=":00" onChange={v=>set("dailyAt",v)} width={110}/>} last/>
        )}
      </SetGroup>

      {/* ── ROL (demo) ── */}
      <SetGroup label={t("set.roleDemo")} delay={0.15}>
        {/* avval uchta tugma bir xil ish qilardi ( hammasi setRole(null) ):
            "Yangi foydalanuvchi", "Kirish oqimini sinash",
            "Yangi a'zo sifatida kirish". Chalkash va takroriy edi.
            Endi bitta tugma qoldi — roli pastdagi segiment almashtiradi. */}
        <SetRow icon={<Ic.User s={16} c={th.warn}/>} title={t("set.roleNew")} tone={th.warn}
          note={t("set.roleNewNote")}
          right={<Ic.Right s={14} c={th.t3}/>}
          onClick={()=>{ setRole(null); setPin(null); toast({kind:"info",title:t("set.roleNew"),note:t("set.pinClearedNote")}); }}/>
        <SetRow icon={<Ic.Team s={16} c={th.t2}/>} title={t("set.roleView")}
          note={role==="owner" ? t("set.roleOwner") : role==="partner" ? t("set.rolePartner") : t("set.roleWorker")}
          right={<Segments value={role} onChange={v=>{ setRole(v); toast({kind:"info",title:t("set.roleChanged"),note:{owner:t("set.roleOwnerL"),partner:t("set.rolePartnerL"),worker:t("set.roleWorkerL")}[v]}); }}
            options={[{v:"owner",l:t("set.roleOwnerL")},{v:"partner",l:t("set.rolePartnerL")},{v:"worker",l:t("set.roleWorkerL")}]}/>}/>
        <SetRow icon={<Ic.User s={16} c={th.t2}/>} title={t("set.joinFlow")}
          note={t("set.joinFlowNote")}
          right={<Ic.Right s={14} c={th.t3}/>}
          onClick={()=>{ setRole(null); setPin(null); toast({kind:"info",title:t("set.joinFlow"),note:t("set.pinClearedNote")}); }} last/>
      </SetGroup>

      {/* ── KO'RINISH ── */}
      <SetGroup label={t("set.look")} delay={0.17}>
        <SetRow icon={<Ic.Theme s={16} c={th.t2}/>} title={t("set.theme")}
          right={<Segments value={themeId} onChange={setThemeId}
            options={[{v:"amoled",l:t("prof.themeDark")},{v:"stitch",l:t("prof.themeBlue")},{v:"light",l:t("prof.themeLight")}]}/>}/>
        <SetRow icon={<Ic.Sig s={16} c={th.t2}/>} title={t("set.haptic")}
          note={t("set.hapticNote")}
          right={<Switch on={cfg.haptic} onChange={v=>{ setHaptic(v); set("haptic",v); if(v) hap.ok(); }}/>}/>
        <SetRow icon={<Ic.Play s={16} c={th.t2}/>} title={t("set.calm")}
          note={t("set.calmNote")}
          right={<Switch on={cfg.calm} onChange={v=>set("calm",v)}/>} last/>
      </SetGroup>

      {/* ── MA'LUMOT ── */}
      <SetGroup label={t("set.data")} delay={0.22}>
        <SetRow icon={<Ic.Copy s={15} c={th.t2}/>} title={t("set.backup")}
          note={t("set.backupNote",{p:people.length,c:cards,b:wired})}
          right={<Ic.Right s={14} c={th.t3}/>} onClick={backup}/>
        <SetRow icon={<Ic.Trash s={15} c={th.warn}/>} title={t("set.wipeCards")} tone={th.warn}
          note={t("set.wipeCardsNote")}
          right={<Ic.Right s={14} c={th.t3}/>}
          onClick={()=>sAsk({what:"cards",title:t("set.wipeCardsTitle"),note:t("set.wipeCardsAsk",{p:people.length,c:cards})})}/>
        <SetRow icon={<Ic.Trash s={15} c={th.warn}/>} title={t("set.wipeBots")} tone={th.warn}
          note={t("set.wipeBotsNote")}
          right={<Ic.Right s={14} c={th.t3}/>}
          onClick={()=>sAsk({what:"bots",title:t("set.wipeBotsTitle"),note:t("set.wipeBotsAsk")})} last/>
      </SetGroup>

      {/* ── XAVFLI ── */}
      <div className="rowIn" style={{ animationDelay:"0.27s" }}>
        <p style={{ fontSize:10, fontWeight:700, color:th.err, letterSpacing:"0.14em",
          textTransform:"uppercase", marginBottom:9, paddingLeft:3 }}>{t("set.danger")}</p>
        <div style={{ borderRadius:16, padding:16, background:`${th.err}0d`, border:`1px solid ${th.err}2e` }}>
          <p style={{ fontSize:14, fontWeight:700, color:th.err, letterSpacing:"-0.01em" }}>{t("set.wipeAll")}</p>
          <p style={{ fontSize:12, color:th.t3, marginTop:5, marginBottom:14, lineHeight:1.55 }}>
            {t("set.wipeAllDesc")}
          </p>
          <HoldBtn label={t("set.wipeAllBtn")}
            done={()=>wipe("all")}/>
        </div>
      </div>

      {/* ── TIZIM ── */}
      <div className="rowIn" style={{ animationDelay:"0.32s", textAlign:"center", padding:"6px 0 4px" }}>
        <p style={{ fontSize:11, color:th.t4, fontFamily:"'SF Mono',monospace", letterSpacing:"0.06em" }}>
          PremoLux · v1.0.0
        </p>
      </div>
    </div>
  );
};

// ═════════════════════════════════════════
// BO'SH EKRANLAR
// ═════════════════════════════════════════
const Sketch = {
  // shaxslar yo'q — bo'sh papka
  folder: ({ c, a }) => (
    <svg width="92" height="76" viewBox="0 0 92 76" fill="none">
      <path className="sketch" style={{"--len":230, animationDelay:"0s"}}
        d="M8 22a5 5 0 015-5h20l7 8h39a5 5 0 015 5v33a5 5 0 01-5 5H13a5 5 0 01-5-5z"
        stroke={c} strokeWidth="2" strokeLinejoin="round"/>
      <path className="sketch" style={{"--len":120, animationDelay:".3s"}}
        d="M16 41h60" stroke={c} strokeWidth="2" strokeLinecap="round" opacity=".45"/>
      <path className="sketch" style={{"--len":90, animationDelay:".42s"}}
        d="M16 50h38" stroke={c} strokeWidth="2" strokeLinecap="round" opacity=".28"/>
      <circle className="ePop" style={{animationDelay:".72s"}} cx="70" cy="20" r="11" fill={a}/>
      <path className="ePop" style={{animationDelay:".8s"}} d="M70 15v10M65 20h10" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"/>
    </svg>
  ),
  // karta yo'q
  card: ({ c, a }) => (
    <svg width="96" height="72" viewBox="0 0 96 72" fill="none">
      <rect className="sketch" style={{"--len":250, animationDelay:"0s"}}
        x="9" y="14" width="70" height="45" rx="7" stroke={c} strokeWidth="2"/>
      <path className="sketch" style={{"--len":72, animationDelay:".34s"}}
        d="M9 28h70" stroke={c} strokeWidth="2"/>
      <path className="sketch" style={{"--len":26, animationDelay:".46s"}}
        d="M18 46h14" stroke={c} strokeWidth="2.4" strokeLinecap="round" opacity=".5"/>
      <circle className="ePop" style={{animationDelay:".72s"}} cx="76" cy="52" r="12" fill={a}/>
      <path className="ePop" style={{animationDelay:".8s"}} d="M76 46v12M70 52h12" stroke="#fff" strokeWidth="2.3" strokeLinecap="round"/>
    </svg>
  ),
  // bank yo'q
  bank: ({ c, a }) => (
    <svg width="92" height="74" viewBox="0 0 92 74" fill="none">
      <path className="sketch" style={{"--len":110, animationDelay:"0s"}}
        d="M10 28L46 9l36 19" stroke={c} strokeWidth="2" strokeLinejoin="round"/>
      <path className="sketch" style={{"--len":76, animationDelay:".26s"}}
        d="M10 28h72" stroke={c} strokeWidth="2" strokeLinecap="round"/>
      {[22,38,54,70].map((x,i)=>(
        <path key={x} className="sketch" style={{"--len":26, animationDelay:`${.36+i*.07}s`}}
          d={`M${x} 32v22`} stroke={c} strokeWidth="2" strokeLinecap="round" opacity=".55"/>
      ))}
      <path className="sketch" style={{"--len":76, animationDelay:".68s"}}
        d="M10 58h72" stroke={c} strokeWidth="2" strokeLinecap="round"/>
      <circle className="ePop" style={{animationDelay:".88s"}} cx="76" cy="58" r="11" fill={a}/>
      <path className="ePop" style={{animationDelay:".95s"}} d="M76 53v10M71 58h10" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"/>
    </svg>
  ),
  // qidiruv/filtr natijasi yo'q
  none: ({ c }) => (
    <svg width="88" height="72" viewBox="0 0 88 72" fill="none">
      <circle className="sketch" style={{"--len":170, animationDelay:"0s"}}
        cx="38" cy="32" r="21" stroke={c} strokeWidth="2"/>
      <path className="sketch" style={{"--len":34, animationDelay:".38s"}}
        d="M54 48l14 14" stroke={c} strokeWidth="2.6" strokeLinecap="round"/>
      <path className="sketch" style={{"--len":26, animationDelay:".52s"}}
        d="M31 32h14" stroke={c} strokeWidth="2.4" strokeLinecap="round" opacity=".5"/>
    </svg>
  ),
};

const Empty = ({ art="folder", title, note, action, onAction }) => {
  const th = useTheme();
  const Art = Sketch[art] || Sketch.folder;
  return (
    <div style={{
      display:"flex", flexDirection:"column", alignItems:"center", textAlign:"center",
      padding:"34px 22px 30px", borderRadius:16,
      border:`1px dashed ${th.b1}`,
      background: th.id==="light" ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.015)",
    }}>
      <span className="drift" style={{ display:"block", marginBottom:16, opacity:.9 }}>
        <Art c={th.t3} a={th.acc}/>
      </span>

      <p className="eUp" style={{ animationDelay:".5s", fontSize:15.5, fontWeight:700,
        letterSpacing:"-0.02em", color:th.t1 }}>{title}</p>

      {note && (
        <p className="eUp" style={{ animationDelay:".58s", fontSize:13, color:th.t3,
          marginTop:6, lineHeight:1.55, maxWidth:250 }}>{note}</p>
      )}

      {action && (
        <span className="eUp" style={{ animationDelay:".68s", marginTop:18, display:"block" }}>
          <Btn onClick={onAction}><Ic.Plus s={13} c={th.accTxt}/>{action}</Btn>
        </span>
      )}
    </div>
  );
};

// ═════════════════════════════════════════
// KARTA SALOMATLIGI
// ═════════════════════════════════════════
const CAP = DEFAULT_CARD_CAP;       // bitta kartadan nechta premium (core.js)

const seenLimit = new Set();         // muhr faqat bir marta urilsin


const HEALTH_META = (th) => ({
  fresh:   { tone: th.ok,   key: "health.fresh" },
  active:  { tone: th.ok,   key: "health.active" },
  soon:    { tone: th.warn, key: "health.soon" },
  limit:   { tone: th.err,  key: "health.limit" },
  expired: { tone: th.t3,   key: "health.expired" },
});

// bo'lakli ko'rsatkich
const Pips = ({ used, cap, tone, dead }) => {
  const th = useTheme();
  return (
    <span style={{ display:"inline-flex", gap:3, alignItems:"center" }}>
      {Array.from({length:cap},(_,i)=>(
        <span key={i} style={{
          width:16, height:4, borderRadius:2, display:"block", overflow:"hidden",
          background: th.b1,
        }}>
          <span className={i<used ? "pip" : undefined} style={{
            display:"block", height:"100%", width:"100%", borderRadius:2,
            background: i<used ? (dead ? th.t4 : tone) : "transparent",
            animationDelay:`${i*0.05}s`,
          }}/>
        </span>
      ))}
    </span>
  );
};

// qiya muhr
const Stamp = ({ text, tone, animate }) => (
  <span className={animate ? "stamp" : undefined} style={{
    position:"absolute", top:"50%", left:"50%", zIndex:6,
    transform:"translate(-50%,-50%) rotate(-13deg)", transformOrigin:"center",
    pointerEvents:"none",
  }}>
    <span style={{
      display:"inline-block", padding:"4px 14px", borderRadius:6,
      border:`2.5px solid ${tone}`,
      boxShadow:`inset 0 0 0 1.5px ${tone}44`,
      color: tone, background:`${tone}12`,
      fontFamily:"'Inter',sans-serif", fontWeight:900, fontSize:15,
      letterSpacing:"0.22em", textTransform:"uppercase",
      opacity:.92,
    }}>{text}</span>
  </span>
);

// ── KARTA: BIR TAPDA AG'DARILADI ──────────
// ── to'liq karta ma'lumotlari (faqat xotirada, localStorage'da EMAS) ──
const SECRETS = new Map();

// raqamni niqoblash — backend people_router._card_out bilan BIR XIL
const maskPanNum = (num) => {
  const full = String(num || "").replace(/\s/g, "");
  return full.length >= 8 ? `${full.slice(0,4)} •••• •••• ${full.slice(-4)}` : "••••";
};

const rememberSecret = (id, num, cvv, exp, name) => {
  if (!id) return;
  SECRETS.set(id, { num:(num||"").replace(/\s/g,""), cvv:cvv||"", exp:exp||"", name:name||"" });
};
const moveSecret = (from, to, card) => {
  if (SECRETS.has(from)) { SECRETS.set(to, SECRETS.get(from)); SECRETS.delete(from); }
  else if (card?.num) rememberSecret(to, card.num, card.cvv, card.exp, card.name);
};
const forgetSecret = id => SECRETS.delete(id);

// Niqoblangan raqam ("8600 •••• •••• 1234") bo'lsa — to'liqini olish uchun
// serverga so'ramiz. Endpoint yo'q bo'lsa, ko'rsatilgan qiymat qaytariladi.
const fullValue = async (card, field) => {
  const cached = SECRETS.get(card.id);
  if (cached) {
    const v = cached[field === "cvv" ? "cvv" : field === "exp" ? "exp" : "num"];
    if (v) return v;
  }
  const shown = field === "cvv" ? card.cvv : field === "exp" ? card.exp : card.num;
  const masked = /[•*•]/.test(shown || "") || /\*{2,}/.test(shown || "");
  if (!masked) return shown || "";

  // serverdan so'rashga urinib ko'ramiz
  try {
    const full = await api.get(`/cards/${card.id}/secret`);
    if (full && !/[•*•]/.test(full[field] || "")) {
      rememberSecret(card.id, full.num, full.cvv, full.exp, full.name);
      return full[field] || "";
    }
  } catch (e) {
    // 403 = "Raqamni yashirish" sozlamasi yoqiq: to'liq raqamni
    // faqat EGASI ko'ra oladi — bu xato emas.
    if (e.status === 403) return "";
    logErr("cards/secret", e);
  }
  return shown || "";
};

const copyText = async (txt) => {
  try { await navigator.clipboard.writeText(txt); return true; }
  catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = txt; ta.style.cssText = "position:fixed;opacity:0;";
      document.body.appendChild(ta); ta.select();
      document.execCommand("copy"); ta.remove(); return true;
    } catch { return false; }
  }
};

// Har bir maydon ALOHIDA nusxalanadi: karta raqami bosilsa — to'liq
// 16 ta raqam, CVV bosilsa — to'liq CVV. Ko'rsatilgan niqoblangan
// qiymat emas, haqiqiy qiymat nusxalanadi.
const CopyField = ({ label, value, mono=true, grow, tone, wide, card, field }) => {
  const th = useTheme();
  const [hit,sHit] = useState(false);
  const [busy,sBusy] = useState(false);
  const doCopy = async () => {
    if (busy) return;
    const text = card && field ? await fullValue(card, field) : value;
    if (!text) return;
    sBusy(true);
    const ok = await copyText(text);
    sBusy(false);
    if (ok) { hap.ok(); sHit(true); setTimeout(()=>sHit(false), 1200); }
    else hap.err();
  };
  return (
    <button
      onTouchStart={e=>e.stopPropagation()} onTouchEnd={e=>e.stopPropagation()} onTouchMove={e=>e.stopPropagation()} onMouseDown={e=>e.stopPropagation()} onMouseUp={e=>e.stopPropagation()}
      aria-label={`${label} — ${t("common.copy")}`}
      onClick={async e=>{
        e.stopPropagation();
        await doCopy();
      }}
      style={{
        flex: grow ? 1 : "none", minWidth:0, textAlign:"left",
        display:"flex", alignItems:"center", gap:8,
        padding:"9px 11px", borderRadius:11, cursor:"pointer",
        background: hit ? th.okA : th.s2,
        border:`1px solid ${hit ? th.ok+"66" : th.b2}`,
        boxShadow: hit ? `0 0 0 3px ${th.okA}` : "none",
        fontFamily:"inherit", transition:"all .2s cubic-bezier(.2,0,0,1)",
        WebkitTapHighlightColor:"transparent", touchAction:"manipulation",
      }}>
      <span style={{ flex:1, minWidth:0 }}>
        <span style={{ display:"block", fontSize:8, fontWeight:700, letterSpacing:"0.14em",
          color: hit ? th.ok : th.t4, textTransform:"uppercase", marginBottom:2 }}>
          {busy ? <><Ic.Spin s={9} c={th.t4}/>{" "}{t("common.copying")}</> : hit ? t("common.copied") : label}
        </span>
        <span style={{ display:"block",
          fontFamily: mono ? "'SF Mono','Fira Code',monospace" : "inherit",
          fontSize: wide ? 15 : mono ? 13.5 : 12.5,
          fontWeight:700, letterSpacing: mono ? "0.6px" : "0",
          color: hit ? th.ok : (tone || th.t1),
          overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{value}</span>
      </span>
      {busy ? <Ic.Spin s={13} c={th.t3}/>
        : hit ? <Ic.Check s={13} c={th.ok}/>
        : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={th.t3} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0 }}>
            <rect x="9" y="9" width="12" height="12" rx="2.5"/><path d="M5 15H4a1 1 0 01-1-1V4a1 1 0 011-1h10a1 1 0 011 1v1"/>
          </svg>}
    </button>
  );
};

// "Raqamni yashirish" sozlamasi: ishchilar uchun to'liq raqam/CVV ko'rinmasin
const CardFlip = ({ card, children, masked }) => {
  const th = useTheme();
  const b  = gB(card.bankId);
  const [on,sOn] = useState(false);
  const moved = useRef(false);
  const p0    = useRef({x:0,y:0});
  const lastTouch = useRef(0);          // sichqoncha taqlidini to'sish uchun

  const down = e => {
    moved.current = false;
    const t = e.touches?.[0];
    p0.current = { x: t ? t.clientX : e.clientX, y: t ? t.clientY : e.clientY };
  };
  const track = e => {
    const t = e.touches?.[0];
    const x = t ? t.clientX : e.clientX, y = t ? t.clientY : e.clientY;
    if (Math.abs(x-p0.current.x) > 8 || Math.abs(y-p0.current.y) > 8) moved.current = true;
  };
  const flip = () => { hap.tap(); sOn(v=>!v); };

  const onTouchEnd = () => {
    lastTouch.current = Date.now();
    if (moved.current) return;
    flip();
  };
  const onMouseUp = () => {
    if (Date.now() - lastTouch.current < 800) return;   // touchend keyin kelgan taqlid
    if (moved.current) return;
    flip();
  };

  return (
    <div className="flipStage"
      role="button" tabIndex={0} aria-label={t("card.flip.hint")} aria-pressed={!on}
      onKeyDown={e=>{ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); e.stopPropagation(); flip(); } }}
      onTouchStart={down} onTouchMove={track} onTouchEnd={onTouchEnd}
      onMouseDown={down}  onMouseMove={e=>{ if(e.buttons) track(e); }} onMouseUp={onMouseUp}
      onContextMenu={e=>e.preventDefault()}
      style={{ position:"relative", WebkitTouchCallout:"none", WebkitUserSelect:"none", userSelect:"none", cursor:"pointer" }}>

      <div className="flipInner" style={{ position:"relative", transform: on ? "rotateY(180deg)" : "rotateY(0deg)" }}>

        {/* old tomon */}
        <div className="flipFace" style={{ position:"relative", zIndex: on ? 1 : 2 }}>
          {children}
        </div>

        {/* orqa tomon */}
        <div className="flipFace" style={{
          transform:"rotateY(180deg)",
          borderRadius:13, overflow:"hidden", zIndex: on ? 2 : 1,
          background: th.id==="light"
            ? `linear-gradient(135deg, ${b.c}12, rgba(255,255,255,0.99) 55%)`
            : `linear-gradient(135deg, ${b.c}22, rgba(12,12,14,0.98) 55%)`,
          border:`1px solid ${b.c}3a`,
          padding:"11px 12px", display:"flex", flexDirection:"column", gap:7,
        }}>
          <div style={{ display:"flex", gap:7, alignItems:"stretch" }}>
            {masked
        ? <div style={{
            display:"flex", alignItems:"center", gap:9, padding:"11px 12px",
            borderRadius:12, background:th.s2, border:`1px dashed ${th.b2}`,
            color:th.t3, fontSize:12, lineHeight:1.45,
          }}>
            <Ic.Lock s={15} c={th.t4}/>
            <span>{t("set.maskPanNote")}</span>
          </div>
        : <CopyField label={t("card.flip.number")} value={card.num} card={card} field="num" grow wide/>}
            {/* ortga qaytarish */}
            <button
              onTouchStart={e=>e.stopPropagation()} onTouchEnd={e=>e.stopPropagation()} onTouchMove={e=>e.stopPropagation()} onMouseDown={e=>e.stopPropagation()} onMouseUp={e=>e.stopPropagation()}
              onClick={e=>{ e.stopPropagation(); hap.tap(); sOn(false); }}
              aria-label={t("common.close")}
              style={{
                width:44, flexShrink:0, borderRadius:11, cursor:"pointer",
                background: th.s2, border:`1px solid ${th.b2}`,
                display:"flex", alignItems:"center", justifyContent:"center",
                WebkitTapHighlightColor:"transparent", touchAction:"manipulation",
                transition:"background .16s",
              }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={th.t2}
                strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 9h11a5 5 0 010 10h-3"/><path d="M8 5L4 9l4 4"/>
              </svg>
            </button>
          </div>

          <div style={{ display:"flex", gap:7 }}>
            {!masked && <CopyField label={t("card.flip.cvv")}    value={card.cvv} card={card} field="cvv" tone={b.c}/>}
            <CopyField label={t("card.flip.exp")} value={card.exp} card={card} field="exp"/>
            <CopyField label={t("card.flip.owner")}  value={card.name} mono={false} grow/>
          </div>
        </div>
      </div>
    </div>
  );
};

const Conf=({title,desc,onOk,onClose})=>{
  const th=useTheme();
  return <Modal onClose={onClose}><div style={{ padding:"24px 22px",display:"flex",flexDirection:"column",alignItems:"center",gap:18 }}>
    <div style={{ width:48,height:48,borderRadius:13,background:"rgba(255,69,58,0.1)",border:"1px solid rgba(255,69,58,0.2)",display:"flex",alignItems:"center",justifyContent:"center" }}><Ic.Trash s={20} c={th.err}/></div>
    <div style={{ textAlign:"center" }}><p style={{ fontWeight:700,fontSize:15,letterSpacing:"-0.02em",marginBottom:5 }}>{title}</p><p style={{ fontSize:12,color:th.t3,lineHeight:1.6 }}>{desc}</p></div>
    <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,width:"100%" }}>
      <Btn v="danger" onClick={()=>{onOk();onClose();}}>O'chirish</Btn>
      <Btn v="primary" onClick={onClose}>Bekor</Btn>
    </div>
  </div></Modal>;
};

const BankM=({onAdd,onClose})=>{
  const th=useTheme();
  const [n,sN]=useState("");const[e,sE]=useState("");
  const go=()=>{if(!n.trim()){sE(t("bankm.needName"));return;}onAdd(n.trim());onClose();};
  return <Modal onClose={onClose}><MH title={t("bankm.title")} onClose={onClose}/>
    <div style={{ padding:18,display:"flex",flexDirection:"column",gap:13 }}>
      <div style={{ display:"flex",gap:11 }}>
        <span style={{
          width:40, height:40, borderRadius:12, flexShrink:0,
          background:th.accSub, border:`1px solid ${th.accBd}`,
          display:"flex", alignItems:"center", justifyContent:"center",
        }}><Ic.Wallet s={19} c={th.acc}/></span>
        <div style={{ flex:1, minWidth:0 }}>
          <Lbl>{t("cardm.bankName")}</Lbl>
          <input value={n} onChange={e=>{sN(e.target.value);sE("");}} placeholder="Kapitalbank"
            autoFocus maxLength={32} onKeyDown={e=>e.key==="Enter"&&go()}
            style={{ fontWeight:500,fontSize:16 }}/>
        </div>
      </div>
      <Err msg={e}/>
      {/* tez tanlash — eng ko'p ishlatiladigan banklar bir bosishda */}
      <div style={{ display:"flex",flexWrap:"wrap",gap:6 }}>
        {BL.slice(0,8).map(b=>
          <button key={b.id} onClick={()=>{sN(b.name);sE("");}} style={{
            padding:"6px 10px", borderRadius:9, cursor:"pointer", fontFamily:"inherit",
            fontSize:11.5, fontWeight:600,
            background: n.trim()===b.name ? th.accSub : th.s1,
            border:`1px solid ${ n.trim()===b.name ? th.accBd : th.b1}`,
            color: n.trim()===b.name ? th.acc : th.t2,
          }}>{b.name}</button>)}
      </div>
      <Btn onClick={go} full sz="lg" disabled={!n.trim()}>
        <Ic.Check s={14} c={th.accTxt}/>{t("bankm.add")}
      </Btn>
    </div></Modal>;
};

const CardM=({pN,bN,onAdd,onClose})=>{
  const th=useTheme();const b=gB(BL.find(x=>x.name===bN)?.id||"");
  const { cfg } = useContext(DataCtx) || {};
  const [f,sF]=useState({name:pN?.toUpperCase()||"",num:"",exp:"",cvv:""});const[er,sE]=useState("");
  const up=(k,v)=>sF(p=>({...p,[k]:v}));
  const fN=v=>v.replace(/\D/g,"").slice(0,16).replace(/(.{4})/g,"$1 ").trim();
  const digits = f.num.replace(/\D/g,"").length;
  const ready = digits>=16 && f.exp.length>=5 && f.cvv.length>=3 && !!f.name.trim();
  const fE=v=>{const c=v.replace(/\D/g,"").slice(0,4);return c.length>=2?c.slice(0,2)+"/"+c.slice(2):c;};
  const go=()=>{
    if(f.num.replace(/\s/g,"").length<16){sE(t("cardm.errNum"));return;}
    if(f.exp.length<5){sE(t("cardm.errExp"));return;}
    if(f.cvv.length<3){sE(t("cardm.errCvv"));return;}
    if(!f.name.trim()){sE(t("cardm.errName"));return;}
    // limit "Karta limiti" sozlamasidan olinadi (avval doim 3 qo'yilardi)
    onAdd({...f,bankId:BL.find(x=>x.name===bN)?.id||bN,id:Date.now(),used:0,limit:cfg.cardCap||3});onClose();
  };
  return <Modal onClose={onClose}><MH title={t("cardm.title")} sub={`${pN} · ${bN}`} onClose={onClose}/>
    <div style={{ padding:18,display:"flex",flexDirection:"column",gap:12,maxHeight:"65vh",overflowY:"auto" }}>
      <div style={{
        height:78, borderRadius:13, padding:"11px 15px",
        background:`linear-gradient(130deg, ${b.c||"#fff"}1a, rgba(0,0,0,0.4))`,
        border:`1px solid ${b.c||"#888"}26`,
        display:"flex", alignItems:"center", justifyContent:"space-between",
        boxShadow:`inset 0 1px 0 rgba(255,255,255,0.06)`,
      }}>
        <div><p style={{ fontSize:8,color:b.c||th.t2,fontWeight:700,letterSpacing:"0.12em",marginBottom:3 }}>{bN?.toUpperCase()}</p><p style={{ fontFamily:"monospace",fontSize:12,fontWeight:700,letterSpacing:"1.5px" }}>{f.num||"•••• •••• •••• ••••"}</p></div>
        <div style={{ textAlign:"right" }}><p style={{ fontSize:10,fontWeight:600 }}>{f.name||"—"}</p><p style={{ fontFamily:"monospace",fontSize:10,color:th.t3,marginTop:1 }}>{f.exp||"MM/YY"}</p></div>
      </div>
      <div><Lbl>{t("cardm.name")}</Lbl><input value={f.name} onChange={e=>up("name",e.target.value.toUpperCase())} placeholder={t("cardm.phName")} style={{ fontWeight:600 }}/></div>
      <div>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between" }}>
          <Lbl>{t("cardm.num")}</Lbl>
          <span style={{ fontSize:10.5, fontWeight:700, letterSpacing:"0.02em",
            color: digits>=16 ? th.ok : th.t4 }}>
            {digits}/16
          </span>
        </div>
        <input value={f.num} onChange={e=>up("num",fN(e.target.value))} placeholder="0000 0000 0000 0000" maxLength={19}
          inputMode="numeric"
          style={{ fontFamily:"monospace",fontSize:16,fontWeight:700,letterSpacing:"1.5px",
            borderColor: digits>=16 ? th.ok+"66" : undefined }}/>
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:9 }}>
        <div><Lbl>{t("cardm.exp")}</Lbl><input value={f.exp} onChange={e=>up("exp",fE(e.target.value))} placeholder="MM/YY" maxLength={5} style={{ fontFamily:"monospace",fontSize:16,fontWeight:700,textAlign:"center" }}/></div>
        <div><Lbl>{t("cardm.cvv")}</Lbl><input value={f.cvv} onChange={e=>up("cvv",e.target.value.replace(/\D/g,"").slice(0,3))} placeholder="•••" maxLength={3} type="password" style={{ fontFamily:"monospace",fontSize:18,fontWeight:800,textAlign:"center",letterSpacing:"4px" }}/></div>
      </div>
      <Err msg={er}/>
      <Btn onClick={go} full sz="lg" disabled={!ready}><Ic.Check/>{t("cardm.save")}</Btn>
      <p style={{ fontSize:11, color:th.t4, textAlign:"center", marginTop:-4 }}>
        {ready ? t("cardm.hintReady") : t("cardm.hint")}
      </p>
    </div>
  </Modal>;
};

const CardsPage=()=>{
  const th=useTheme();
  const toast = useToast();
  const { people:P, setPeople:sP, role, cfg } = useData();
  // "Raqamni yashirish" sozlamasi endi ishlaydi: ishchilar (partner/worker)
  // faqat oxirgi 4 raqamni ko'radi, egasi to'liq raqamni ko'radi.
  const masked = cfg?.maskPan !== false && role !== "owner";
  const [stk,sSt]=useState([{v:"p"}]);const[mod,sM]=useState(null);const[cnf,sCn]=useState(null);
  const [add,sA]=useState(false);const[nn,sNN]=useState("");const[ne,sNE]=useState("");
  const [fresh,sFresh]=useState(null);
  const [undo,sUndo]=useState(null);
  const c=stk[stk.length-1];const push=s=>sSt([...stk,s]);const pop=()=>sSt(stk.slice(0,-1));
  const gBN=card=>{const b=BL.find(x=>x.id===card.bankId);return b?b.name:card.bankId;};
  const gBs=p=>{const cs=p?.cards||[];const ns=[...new Set(cs.map(gBN))];return ns.map(n=>({n,bid:BL.find(b=>b.name===n)?.id||n,cards:cs.filter(x=>gBN(x)===n)}));};
  const bc=(P.find(p=>p.id===c.pid)?.cards||[]).filter(x=>gBN(x)===c.bn);
  const pers=P.find(p=>p.id===c.pid);
  // shaxs qo'shish — darhol, server kutmaydi
  const addP = () => {
    const name = nn.trim();
    if(!name){sNE(t("cards.needName"));return;}
    if(P.find(p=>p.name.toLowerCase()===name.toLowerCase())){sNE(t("cards.nameExists"));return;}

    const tmpId = "tmp_" + Date.now().toString(36);
    const local = { id: tmpId, name, cards: [], syncing: true };
    sP(p=>[...p, local]);              // ro'yxatda darhol ko'rinadi
    hap.ok();
    sNN(""); sA(false); sNE("");

    // serverga fon bilan — xato bo'lsa ham shaxs yo'qolmaydi
    api.post("/people", { name }).then(saved=>{
      sP(p=>p.map(x=>x.id===tmpId
        ? { ...saved, cards: x.cards || [], syncing:false }
        : x));
      toast({kind:"ok",title:t("cards.personAdded"),note:name});
    }).catch(e=>{
      sP(p=>p.map(x=>x.id===tmpId ? { ...x, syncing:false, syncError:e.message } : x));
      hap.err();
      toast({kind:"warn",title:t("cards.localSaved"),note:t("cards.syncFailed"),ms:4000});
    });
  };
  const addB=n=>{const pid=c.pid;sM(null);setTimeout(()=>push({v:"c",pid,bn:n}),80);};
const addC = card => {
  const tmpId = "tmpc_" + Date.now().toString(36);

  // 1) to'liq ma'lumot — FAQAT xotirada (sahifa yopilganda yo'qoladi)
  rememberSecret(tmpId, card.num, card.cvv, card.exp, card.name);

  // 2) ro'yxatga (va demak localStorage ga) — FAQAT niqoblangan versiya.
  //    Backend ham aynan shunday qaytaradi (people_router._card_out),
  //    shuning uchun endi holatlar mos keladi va maxfiy ma'lumot
  //    brauzer xotirasiga yozilmaydi.
  const clean = {
    id: tmpId,
    bankId: card.bankId,
    num: maskPanNum(card.num),
    exp: card.exp,
    name: card.name,
    limit: card.limit,
    used: 0,
    syncing: true,
  };

  sP(p=>p.map(x=>x.id===c.pid?{...x,cards:[...(x.cards||[]),clean]}:x));
  sFresh(tmpId); setTimeout(()=>sFresh(null),1500); hap.ok();
  sM(null);
  toast({kind:"ok",title:t("cards.cardAdded"),note:`•••• ${card.num.replace(/\s/g,"").slice(-4)}`});

  api.post(`/people/${c.pid}/cards`, card).then(saved=>{
    // server NIQOBLAGAN raqamni qaytaradi — ro'yxatga aynan shu
    // yoziladi, to'liq raqam esa SECRETS qutida qoladi
    sP(p=>p.map(x=>x.id===c.pid
      ? { ...x, cards:(x.cards||[]).map(k=>k.id===tmpId ? { ...saved, syncing:false } : k) }
      : x));
    moveSecret(tmpId, saved.id, card);
  }).catch(e=>{
    sP(p=>p.map(x=>x.id===c.pid
      ? { ...x, cards:(x.cards||[]).map(k=>k.id===tmpId ? { ...k, syncing:false, syncError:e.message } : k) }
      : x));
    hap.err();
    toast({kind:"warn",title:t("cards.localSaved"),note:t("cards.syncFailed"),ms:4000});
  });
};
  const delC=id=>{forgetSecret(id);sP(p=>p.map(x=>x.id===c.pid?{...x,cards:(x.cards||[]).filter(k=>k.id!==id)}:x));api.del(`/cards/${id}`).catch(e=>logErr("cards/delete", e));};
  const delPerson=id=>{sP(p=>p.filter(x=>x.id!==id));api.del(`/people/${id}`).catch(e=>logErr("people/delete", e));};
  const delB=n=>{sP(p=>p.map(x=>x.id===c.pid?{...x,cards:(x.cards||[]).filter(k=>gBN(k)!==n)}:x));pop();};
  const allCards=P.flatMap(p=>p.cards||[]);
  const tot=allCards.length;
  const act=allCards.filter(k=>cardHealth(k).left>0 && cardHealth(k).state!=="expired").length;
  const lim=allCards.filter(k=>{const h=cardHealth(k);return h.left<=0||h.state==="expired";}).length;
  const { toss } = useToss(th);
  return(
    <div style={{ display:"flex",flexDirection:"column",gap:18,maxWidth:680 }}>
      {undo&&<UndoBar item={undo} onUndo={()=>{undo.restore();sUndo(null);}} onClose={()=>sUndo(null)}/>}
      {cnf&&<Conf {...cnf} onClose={()=>sCn(null)}/>}
      {mod==="bank"&&<BankM onAdd={addB} onClose={()=>sM(null)}/>}
      {mod==="card"&&<CardM pN={pers?.name} bN={c.bn} onAdd={addC} onClose={()=>sM(null)}/>}
      <div style={{ display:"flex",alignItems:"center",gap:11 }}>
        {stk.length>1&&<button onClick={pop} style={{ width:34,height:34,borderRadius:9,...glass(th,0.04),color:th.t2,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",border:`1px solid ${th.b1}`,flexShrink:0 }}><Ic.Left/></button>}
        <div style={{ flex:1 }}>
          <h1 style={{ fontSize:22,fontWeight:800,letterSpacing:"-0.03em",lineHeight:1.15 }}>{c.v==="p"?t("cards.title"):c.v==="b"?pers?.name:c.bn}</h1>
          <p style={{ fontSize:12,color:th.t3,marginTop:2 }}>{c.v==="p"?tp("cards.sub", P.length, { m: tot }):c.v==="b"?t("cards.subBank",{n:gBs(pers).length}):t("cards.subCards",{m:bc.length})}</p>
        </div>
        {c.v==="p"&&<Btn v={add?"ghost":"primary"} sz="sm" onClick={()=>{sA(!add);sNE("");}}>{add?t("common.cancel"):<><Ic.Plus s={12}/>{t("cards.addPerson")}</>}</Btn>}
        {c.v==="c"&&<Btn sz="sm" onClick={e=>{markOrigin(e);sM("card");}}><Ic.Plus s={12}/>{t("cards.addCard")}</Btn>}
      </div>
      {c.v==="p"&&<>
        <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:9 }}>
          <StatCard label={t("cards.statCards")} value={String(tot)} color={th.acc}/>
          <StatCard label={t("cards.statReady")} value={String(act)} color={act?th.ok:th.t3}/>
          <StatCard label={t("cards.statEnded")} value={String(lim)} color={lim?th.err:th.t3}/>
        </div>
        {add&&<div style={{ ...glass(th,0.05),borderRadius:12,padding:14,display:"flex",flexDirection:"column",gap:9,border:"1px solid rgba(255,159,10,0.18)" }}>
          <div style={{
            display:"flex", gap:9, padding:"11px 12px", borderRadius:14,
            background:th.s1, border:`1px solid ${ne ? th.err+"55" : th.b1}`,
            transition:"border-color .2s",
          }}>
            <span style={{
              width:32, height:32, borderRadius:10, flexShrink:0,
              background:th.accSub, border:`1px solid ${th.accBd}`,
              display:"flex", alignItems:"center", justifyContent:"center",
            }}><Ic.User s={15} c={th.acc}/></span>
            <input value={nn} onChange={e=>{sNN(e.target.value);sNE("");}}
              placeholder={t("cards.phPerson")} autoFocus maxLength={40}
              onKeyDown={e=>e.key==="Enter"&&addP()}
              style={{ flex:1, minWidth:0, fontWeight:500 }}/>
            <Btn onClick={addP} disabled={!nn.trim()} style={{ whiteSpace:"nowrap" }}>
              <Ic.Check s={13} c={th.accTxt}/>{t("cards.create")}
            </Btn>
          </div>
          <Err msg={ne}/>
          <p style={{ fontSize:11, color:th.t4, paddingLeft:3, marginTop:-2 }}>
            {t("cards.personHint")}
          </p>
        </div>}
        <div style={{ display:"flex",flexDirection:"column",gap:7 }}>
          {P.map(p=>{const bks=gBs(p);return(
            <div key={p.id} data-item><SwipeRow label="Shaxs" onDelete={()=>{const el=document.querySelector(`[data-pid="${p.id}"]`);const snap=P.find(x=>x.id===p.id);const at=P.findIndex(x=>x.id===p.id);toss(el,()=>{delPerson(p.id);sUndo({id:Date.now(),title:"Shaxs o'chirildi",note:snap.name,restore:()=>sP(l=>{const n=[...l];n.splice(Math.min(at,n.length),0,snap);return n;})});});}}><div data-row data-pid={p.id} className="ho" onClick={()=>push({v:"b",pid:p.id})} style={{ ...glass(th,0.04),borderRadius:13,padding:"12px 14px",display:"flex",alignItems:"center",gap:11 }}>
              <div style={{ width:36,height:36,borderRadius:9,background:th.s1,border:`1px solid ${th.b1}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}><Ic.User s={15} c={th.t3}/></div>
              <div style={{ flex:1,minWidth:0 }}>
                <p style={{ fontWeight:600,fontSize:13,letterSpacing:"-0.01em" }}>{p.name}</p>
                <p style={{ fontSize:11,color:th.t3,marginTop:2 }}>{tp("cards.rowNote", (p.cards||[]).length, { m: bks.length })}</p>
              </div>
              {/* bank logolari yonma-yon turadi (ustma-ust emas) —
                  avval -5px bilan ustma-ust tushib, chalkash ko'rinardi */}
              <div style={{ display:"flex",gap:4,marginRight:2,flexShrink:0 }}>
                {bks.slice(0,2).map(bk=><Ava key={bk.bid} bid={bk.bid} n={20}/>)}
                {bks.length>2&&<span style={{ width:20,height:20,borderRadius:6,...glass(th,0.05),display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:th.t3,fontWeight:600,flexShrink:0 }}>+{bks.length-2}</span>}
              </div>
              <Ic.Right s={13} c={th.t3}/>
            </div></SwipeRow></div>
          );})}
          {!P.length && (
            <Empty art="folder"
              title={t("cards.noPerson")}
              note={t("cards.noPersonNote")}
              action={t("cards.addPersonCta")}
              onAction={()=>{ sA(true); sNE(""); }}/>
          )}
        </div>
      </>}
      {c.v==="b"&&pers&&<div style={{ display:"flex",flexDirection:"column",gap:7 }}>
        {gBs(pers).map(bk=>{const bd=gB(bk.bid);return(
          <div key={bk.bid} data-item><SwipeRow label="Bank" onDelete={()=>{const el=document.querySelector(`[data-bank="${bk.bid}"]`);const snap=[...bk.cards];const pid=c.pid;toss(el,()=>{delB(bk.n);sUndo({id:Date.now(),title:"Bank o'chirildi",note:`${bk.n} · ${snap.length} karta`,restore:()=>sP(l=>l.map(x=>x.id===pid?{...x,cards:[...(x.cards||[]),...snap]}:x))});});}}><div data-row data-bank={bk.bid} className="ho" onClick={()=>push({v:"c",pid:c.pid,bn:bk.n})} style={{ ...glass(th,0.04),borderRadius:13,padding:"12px 14px",display:"flex",alignItems:"center",gap:13 }}>
            <Ava bid={bk.bid} n={42}/>
            <div style={{ flex:1 }}>
              <p style={{ fontWeight:600,fontSize:13,letterSpacing:"-0.01em" }}>{bk.n}</p>
              <div style={{ height:2,background:th.b1,borderRadius:1,marginTop:6,width:80 }}><div style={{ height:"100%",borderRadius:1,background:bd.c,width:`${(bk.cards.filter(k=>cardHealth(k).left>0).length/bk.cards.length)*100}%`,transition:"width .4s" }}/></div>
            </div>
            <div style={{ textAlign:"right",flexShrink:0 }}>
              <p style={{ fontSize:11,color:th.ok,fontWeight:600 }}>{t("cards.readyCount",{n:bk.cards.filter(k=>cardHealth(k).left>0).length})}</p>
              <p style={{ fontSize:10,color:th.t3,marginTop:1 }}>{t("cards.totalCount",{n:bk.cards.length})}</p>
            </div>
            <Ic.Right s={13} c={th.t3}/>
          </div></SwipeRow></div>
        );})}
        {!gBs(pers).length && (
          <Empty art="bank"
            title={t("cards.noBank")}
            note={t("cards.noBankNote",{n:pers.name})}
            action={t("cards.addBank")}
            onAction={e=>{markOrigin(e);sM("bank");}}/>
        )}
        {gBs(pers).length>0 && <button onClick={e=>{markOrigin(e);sM("bank");}} style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:7,padding:"12px",borderRadius:13,border:`1px dashed ${th.b2}`,background:"transparent",color:th.t2,cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:500,transition:"all .18s" }}
          onMouseEnter={e=>{e.currentTarget.style.background=th.s2;e.currentTarget.style.color=th.t1;}}
          onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color=th.t2;}}>
          <Ic.Plus s={13} c="currentColor"/>{t("cards.addBank")}
        </button>}
      </div>}
      {c.v==="c"&&<div style={{ display:"flex",flexDirection:"column",gap:7 }}>
        {bc.map(card=>{
          const t4 = last4(card.num) || "????";
          const H = cardHealth(card);
          const M = HEALTH_META(th)[H.state];
          const dead = H.state==="limit" || H.state==="expired";
          const fresh0 = !seenLimit.has(card.id);
          if (dead && fresh0) seenLimit.add(card.id);
          const slam = dead && fresh0;
          return (
          <div key={card.id} data-item><SwipeRow label="Karta" onDelete={()=>{const el=document.querySelector(`[data-card="${card.id}"]`);const snap={...card};const pid=c.pid;toss(el,()=>{delC(card.id);sUndo({id:Date.now(),title:t("cards.cardDeleted"),note:`•••• ${t4}`,restore:()=>sP(l=>l.map(x=>x.id===pid?{...x,cards:[...x.cards,snap]}:x))});});}}><CardFlip card={card} masked={masked}><div data-row data-card={card.id}
            className={`${fresh===card.id?"land ":""}${slam?"jolt ":""}`}
            style={{ ...glass(th,0.04),borderRadius:13,padding:"12px 14px",display:"flex",alignItems:"center",gap:11,position:"relative",overflow:"hidden",transformStyle:"preserve-3d" }}>

            {fresh===card.id && <span className="sheen" style={{ position:"absolute",top:0,bottom:0,left:0,width:"48%",background:"linear-gradient(90deg,transparent,rgba(255,255,255,.16),transparent)",pointerEvents:"none",zIndex:2 }}/>}

            {/* muhr */}
            {dead && <Stamp text={t(H.state==="limit"?"health.shortLimit":"health.shortExpired")} tone={H.state==="limit"?th.err:th.t3} animate={slam}/>}

            {/* xira qatlam */}
            {dead && <span className={slam?"dim":undefined} style={{ position:"absolute",inset:0,zIndex:5,pointerEvents:"none",background: th.id==="light"?"rgba(244,245,247,0.55)":"rgba(8,8,10,0.5)" }}/>}

            <span style={{ opacity: dead?.5:1, filter: dead?"grayscale(.7)":"none", transition:"all .4s", display:"block", flexShrink:0 }}>
              <Ava bid={card.bankId} n={38}/>
            </span>

            <div style={{ flex:1,minWidth:0, opacity: dead?.55:1, transition:"opacity .4s" }}>
              <p style={{ fontFamily:"monospace",fontSize:13,fontWeight:700,letterSpacing:"0.5px" }}>•••• {t4}</p>
              <p style={{ fontSize:11,color:th.t3,marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{card.name}</p>
              <div style={{ display:"flex",alignItems:"center",gap:8,marginTop:6 }}>
                <Pips used={H.used} cap={H.cap} tone={M.tone} dead={dead}/>
                <span style={{ fontFamily:"'SF Mono',monospace",fontSize:10.5,color: dead?th.t4:M.tone, fontWeight:600 }}>
                  {H.state==="expired" ? "—" : t("health.left",{n:H.left})}
                </span>
              </div>
            </div>

            <div style={{ textAlign:"right",flexShrink:0, opacity: dead?.55:1 }}>
              <p style={{ fontFamily:"monospace",fontSize:12,fontWeight:700, color: H.state==="soon"?th.warn:H.state==="expired"?th.err:th.t1 }}>{card.exp}</p>
              <span style={{ display:"inline-flex",alignItems:"center",gap:4,marginTop:5 }}>
                <span style={{ width:6,height:6,borderRadius:"50%",background:M.tone, boxShadow: dead?"none":`0 0 6px ${M.tone}66` }}/>
                <span style={{ fontSize:9.5,color:M.tone,fontWeight:600,letterSpacing:"0.04em" }}>{t(M.key)}</span>
              </span>
            </div>
          </div></CardFlip></SwipeRow></div>
        );})}
        {!bc.length && (
          <Empty art="card"
            title={t("cards.noCard")}
            note={t("cards.noCardNote",{n:c.bn})}
            action={t("cards.addCardCta")}
            onAction={e=>{markOrigin(e);sM("card");}}/>
        )}
      </div>}
    </div>
  );
};


// ─────────────────────────────────────────────
// KIRISH DARVOZASI
// ─────────────────────────────────────────────
// bo'g'imlari alohida ishlaydigan siluet
const Runner = ({ ink }) => (
  <svg width="26" height="37" viewBox="0 0 26 37" fill="none" style={{ display:"block", overflow:"visible" }}>
    <ellipse className="shd" cx="13" cy="35.2" rx="7.5" ry="2" fill="#000" opacity=".2" style={{ transformOrigin:"13px 35.2px" }}/>

    <g className="bd" style={{ transformOrigin:"13px 35px" }}>

      {/* ORQA QO'L — tana ortida */}
      <g className="aB" style={{ transformOrigin:"10.6px 14px" }}>
        <line x1="10.6" y1="14" x2="10.6" y2="19.4" stroke={ink} strokeWidth="2.5" strokeLinecap="round" opacity=".72"/>
        <g style={{ transformOrigin:"10.6px 19.4px", transform:"rotate(-40deg)" }}>
          <line x1="10.6" y1="19.4" x2="10.6" y2="24.2" stroke={ink} strokeWidth="2.3" strokeLinecap="round" opacity=".72"/>
        </g>
      </g>

      {/* ORQA OYOQ */}
      <g className="tB" style={{ transformOrigin:"12.1px 21.6px" }}>
        <line x1="12.1" y1="21.6" x2="12.1" y2="28" stroke={ink} strokeWidth="3" strokeLinecap="round" opacity=".78"/>
        <g className="sB" style={{ transformOrigin:"12.1px 28px" }}>
          <line x1="12.1" y1="28"   x2="12.1" y2="34" stroke={ink} strokeWidth="2.7" strokeLinecap="round" opacity=".78"/>
          <line x1="12.1" y1="34"   x2="14.8" y2="34.4" stroke={ink} strokeWidth="2.4" strokeLinecap="round" opacity=".78"/>
        </g>
      </g>

      {/* TANA + BOSH */}
      <g className="torso" style={{ transformOrigin:"12.6px 21.6px" }}>
        {/* ingichka gavda — qo'llar chetda qolsin */}
        <path d="M13 11.2c2 .4 2.7 1.9 2.5 3.7l-.6 5.4c-1.5.7-3.3.7-4.8 0l-.6-5.4c-.2-1.8.5-3.3 3.5-3.7z" fill={ink}/>
        {/* bo'yin */}
        <line x1="13" y1="10.4" x2="13" y2="12" stroke={ink} strokeWidth="2.2" strokeLinecap="round"/>
        {/* bosh */}
        <circle cx="13" cy="7.2" r="3.9" fill={ink}/>
        {/* soch/yuz yo'nalishi — o'ngga qaragan */}
        <path d="M9.9 5.6c1.6-1.9 4.4-2 6 -.4" stroke={ink} strokeWidth="2.4" strokeLinecap="round"/>
        <path d="M16.7 7.1c1 .1 1.5.5 1.5 1" stroke={ink} strokeWidth="1.5" strokeLinecap="round"/>
      </g>

      {/* OLD OYOQ */}
      <g className="tA" style={{ transformOrigin:"13.6px 21.6px" }}>
        <line x1="13.6" y1="21.6" x2="13.6" y2="28" stroke={ink} strokeWidth="3.3" strokeLinecap="round"/>
        <g className="sA" style={{ transformOrigin:"13.6px 28px" }}>
          <line x1="13.6" y1="28"   x2="13.6" y2="34" stroke={ink} strokeWidth="2.9" strokeLinecap="round"/>
          <line x1="13.6" y1="34"   x2="16.5" y2="34.4" stroke={ink} strokeWidth="2.6" strokeLinecap="round"/>
        </g>
      </g>

      {/* OLD QO'L — tananing oldida, chetda */}
      <g className="aA" style={{ transformOrigin:"15.2px 14px" }}>
        <line x1="15.2" y1="14" x2="15.2" y2="19.4" stroke={ink} strokeWidth="2.7" strokeLinecap="round"/>
        <g style={{ transformOrigin:"15.2px 19.4px", transform:"rotate(-42deg)" }}>
          <line x1="15.2" y1="19.4" x2="15.2" y2="24.4" stroke={ink} strokeWidth="2.5" strokeLinecap="round"/>
        </g>
      </g>

    </g>
  </svg>
);

const LoginGate = ({ onDone }) => {
  const th = useTheme();
  const [user,sUser] = useState("");
  const [pw,sPw]     = useState("");
  const [seen,sSeen] = useState(false);
  const [phase,sPh]  = useState("idle");  // idle | crouch | run | shut | ok
  const [err,sErr]   = useState("");
  const [shake,sSh]  = useState(false);

  const busy = phase!=="idle";
  const ink  = th.accTxt==="#000000" ? "#0F1319" : "#0A1626";
  const moving = phase==="run" || phase==="shut";

  const submit = () => {
    if (busy) return;
    if (!user.trim() || !pw) {
      sErr(t("login.needAll"));
      sSh(true); setTimeout(()=>sSh(false),460);
      return;
    }
    sErr("");
    sPh("crouch");                          // cho'kkalaydi
    setTimeout(()=>sPh("run"),    210);     // eshik ochiladi, yuguradi
    setTimeout(()=>sPh("shut"),  1230);     // eshik yopiladi
    setTimeout(()=>sPh("ok"),    1560);     // yashil tasdiq
    setTimeout(()=>onDone(),     2360);
  };

  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:"24px 18px" }}>
      <div className={shake?"shake":undefined} style={{
        ...glass(th,0.07,40),
        width:"100%", maxWidth:382, borderRadius:24, padding:"26px 22px 20px",
        boxShadow:"0 28px 70px rgba(0,0,0,0.6)",
      }}>
        <div style={{ marginBottom:20 }}>
          <p style={{ fontSize:10,fontWeight:700,color:th.t3,letterSpacing:"0.2em",textTransform:"uppercase",marginBottom:8 }}>PremoLux</p>
          <h1 style={{ fontSize:25,fontWeight:800,letterSpacing:"-0.03em",lineHeight:1.1 }}>Xush kelibsiz</h1>
          <p style={{ fontSize:13,color:th.t3,marginTop:5 }}>Panelga kirish uchun ma'lumotlarni kiriting</p>
        </div>

        <div style={{ marginBottom:11 }}>
          <Lbl>Login</Lbl>
          <input value={user} onChange={e=>sUser(e.target.value)} placeholder="mansur"
            autoCapitalize="none" disabled={busy}
            onKeyDown={e=>e.key==="Enter"&&submit()} style={{ fontWeight:500 }}/>
        </div>

        <div style={{ marginBottom:14 }}>
          <Lbl>Parol</Lbl>
          <div style={{ position:"relative" }}>
            <input type={seen?"text":"password"} value={pw} onChange={e=>sPw(e.target.value)}
              placeholder="••••••••" disabled={busy}
              onKeyDown={e=>e.key==="Enter"&&submit()} style={{ paddingRight:42 }}/>
            <button onClick={()=>sSeen(v=>!v)} tabIndex={-1} aria-label={t("login.showPw")}
              style={{ position:"absolute",right:6,top:"50%",transform:"translateY(-50%)",width:30,height:30,borderRadius:8,background:"transparent",border:"none",color:th.t3,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>
              {seen
                ? <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={th.t3} strokeWidth="1.6" strokeLinecap="round"><path d="M3 3l18 18M10.6 5.2A9.7 9.7 0 0112 5c5 0 9 4.5 9 7a11 11 0 01-2.6 3.6M6.3 6.9A11.5 11.5 0 003 12c0 2.5 4 7 9 7a9.5 9.5 0 004.2-1M9.9 9.9a3 3 0 004.2 4.2"/></svg>
                : <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={th.t3} strokeWidth="1.6" strokeLinecap="round"><path d="M3 12s3.6-7 9-7 9 7 9 7-3.6 7-9 7-9-7-9-7z"/><circle cx="12" cy="12" r="3"/></svg>}
            </button>
          </div>
        </div>

        {err && <div style={{ marginBottom:12 }}><Err msg={err}/></div>}

        {/* ═══ SAHNA ═══ */}
        <button onClick={submit} disabled={busy} style={{
          position:"relative", width:"100%", height:62,
          borderRadius:16, border:"none", overflow:"hidden",
          cursor: busy ? "default" : "pointer", fontFamily:"inherit",
          background: phase==="ok" ? "linear-gradient(90deg,#35d492,#63e9b8)" : th.acc,
          transition:"background .5s cubic-bezier(.2,0,0,1)",
          boxShadow: phase==="ok" ? "0 8px 30px rgba(53,212,146,0.35)" : "none",
        }}>
          {/* pol chizig'i */}
          {phase!=="ok" && (
            <span style={{ position:"absolute", left:0, right:0, bottom:9, height:1,
              background:`linear-gradient(90deg, transparent, ${ink}22 20%, ${ink}22 88%, transparent)` }}/>
          )}

          {/* yozuv */}
          <span style={{
            position:"absolute", left:22, top:"50%", transform:"translateY(-50%)",
            fontSize:15, fontWeight:700, letterSpacing:"-0.01em", color:th.accTxt,
            opacity: phase==="idle" ? 1 : 0, transition:"opacity .22s",
          }}>Kirish</span>

          {/* eshikdan tushgan yorug'lik dog'i */}
          {moving && (
            <span className="beam" style={{
              position:"absolute", right:20, bottom:6, width:74, height:16,
              transformOrigin:"right center", borderRadius:"50%",
              background:"radial-gradient(ellipse at 88% 50%, rgba(255,214,150,.85) 0%, rgba(255,196,120,.28) 45%, transparent 72%)",
            }}/>
          )}

          {/* chopuvchi */}
          {phase!=="ok" && (
            <span className={phase==="idle" ? "stand" : phase==="crouch" ? "crouch" : "run"}
              style={{
                position:"absolute", bottom:6, left:"calc(100% - 96px)",
                transformStyle:"preserve-3d", transformOrigin:"50% 100%",
              }}>
              <Runner ink={ink}/>
              {phase==="run" && (
                <span className="kick" style={{
                  position:"absolute", left:-4, bottom:0, width:16, height:8,
                  borderRadius:"50%", background:ink, opacity:.35,
                }}/>
              )}
            </span>
          )}

          {/* eshik */}
          {phase!=="ok" && (
            <span style={{
              position:"absolute", right:14, bottom:8, width:30, height:42,
              borderRadius:"5px 5px 1px 1px", overflow:"hidden",
              background: phase==="idle" ? `${ink}1f` : "#0a0703",
              border:`1px solid ${ink}2e`,
              transition:"background .35s",
            }}>
              {moving && (
                <span className="spill" style={{ position:"absolute", inset:0,
                  background:"radial-gradient(ellipse 80% 100% at 14% 50%, rgba(255,228,175,.95) 0%, rgba(255,198,120,.4) 42%, transparent 78%)" }}/>
              )}
              <span className={phase==="run" ? "dOpen" : phase==="shut" ? "dShut" : undefined}
                style={{
                  position:"absolute", inset:0, transformOrigin:"left center",
                  background: th.accTxt==="#000000" ? "rgba(20,24,32,.5)" : "rgba(255,255,255,.2)",
                  borderRight:`1px solid ${ink}33`, borderRadius:"4px 3px 1px 1px",
                }}>
                <span style={{ position:"absolute", right:4, top:"52%", width:3.5, height:3.5, borderRadius:"50%", background:"rgba(255,225,170,.9)" }}/>
              </span>
            </span>
          )}

          {phase==="ok" && (
            <span className="pop" style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#07301e" strokeWidth="2.7" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
            </span>
          )}
        </button>

        <p style={{ textAlign:"center", fontSize:12.5, marginTop:11, minHeight:18,
          color: phase==="ok" ? "#35d492" : th.t3, transition:"color .3s" }}>
          {moving || phase==="crouch" ? "Kirilmoqda…" : phase==="ok" ? "Xush kelibsiz!" : "Faqat ruxsat berilgan hisoblar"}
        </p>
      </div>
    </div>
  );
};


// ── PASTGA TORTIB YANGILASH ───────────────
const Star = ({ n=17, c="currentColor", filled }) => (
  <svg width={n} height={n} viewBox="0 0 24 24" fill={filled?c:"none"} stroke={c}
       strokeWidth="1.6" strokeLinejoin="round">
    <path d="M12 2.2c.7 4.4 2.7 6.4 7.1 7.1-4.4.7-6.4 2.7-7.1 7.1-.7-4.4-2.7-6.4-7.1-7.1 4.4-.7 6.4-2.7 7.1-7.1z"
      transform="translate(0,2.6)"/>
  </svg>
);

const PullRefresh = ({ onRefresh, children }) => {
  const th = useTheme();
  const [pull,sPull]   = useState(0);
  const [state,sState] = useState("idle");   // idle | pull | ready | load | done
  const startY = useRef(0);
  const armed  = useRef(false);
  const box    = useRef(null);
  const timers = useRef([]);
  const TH = 74, MAX = 122;

  // Listenerlar faqat bir marta ulanadi — aks holda har bir
  // touchmove'da qayta ulanib, tortish jarayoni uzilib qolardi.
  // Shuning uchun eng so'nggi qiymatlar ref orqali o'qiлади.
  const live = useRef({ pull:0, state:"idle", onRefresh });
  useEffect(()=>{ live.current = { pull, state, onRefresh }; });

  useEffect(()=>{
    const el = box.current;
    if (!el) return;
    const atTop = () => (window.scrollY || document.documentElement.scrollTop || 0) <= 0;

    const onStart = e => {
      if (!atTop() || live.current.state==="load" || live.current.state==="done") return;
      startY.current = e.touches[0].clientY;
      armed.current  = true;
    };
    const onMove = e => {
      if (!armed.current) return;
      const d = e.touches[0].clientY - startY.current;
      if (d <= 0) { sPull(0); sState("idle"); return; }
      if (!atTop()) { armed.current = false; sPull(0); return; }
      e.preventDefault();
      const p = Math.min(MAX, Math.pow(d,.82)*1.25);
      const wasReady = live.current.state==="ready";
      sPull(p);
      const nowReady = p >= TH;
      if (nowReady && !wasReady) { hap.press(); }
      sState(nowReady ? "ready" : "pull");
    };
    const onEnd = () => {
      if (!armed.current) return;
      armed.current = false;
      if (live.current.pull >= TH) {
        sPull(0); sState("load"); hap.soft();
        timers.current.push(setTimeout(()=>{ live.current.onRefresh?.(); sState("done"); hap.ok(); }, 900));
        timers.current.push(setTimeout(()=>sState("idle"), 1450));
      } else { sPull(0); sState("idle"); }
    };

    el.addEventListener("touchstart", onStart, { passive:true });
    el.addEventListener("touchmove",  onMove,  { passive:false });
    el.addEventListener("touchend",   onEnd);
    el.addEventListener("touchcancel",onEnd);
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove",  onMove);
      el.removeEventListener("touchend",   onEnd);
      el.removeEventListener("touchcancel",onEnd);
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, []);

  const prog  = Math.min(1, pull / TH);
  const ready = state==="ready";
  const load  = state==="load";
  const done  = state==="done";
  const busy  = load || done;
  const zone  = busy ? 62 : pull;

  const R = 17, C = 2*Math.PI*R, S = 44;
  const tone = done ? th.ok : (ready||load) ? th.acc : th.t3;

  return (
    <div ref={box} style={{ position:"relative" }}>
      <div style={{
        height: zone, overflow:"hidden", position:"relative",
        transition: (state==="idle"||busy) ? "height .42s cubic-bezier(.2,.9,.25,1)" : "none",
      }}>
        <div style={{ position:"absolute", left:0, right:0, bottom:8,
          display:"flex", flexDirection:"column", alignItems:"center", gap:7 }}>

          {/* halqa + yulduz */}
          <span style={{ position:"relative", width:S, height:S, display:"block",
            transform:`scale(${busy ? 1 : .72 + prog*.28})`,
            transition: state==="idle" ? "transform .3s" : "none" }}>

            {/* tashqi to'lqin */}
            {done && <span className="ringOut" style={{ position:"absolute", inset:0,
              borderRadius:"50%", border:`1.5px solid ${th.ok}` }}/>}

            <span className={load ? "arcSpin" : undefined}
              style={{ position:"absolute", inset:0, display:"block" }}>
              <svg width={S} height={S} style={{ transform:"rotate(-90deg)", display:"block" }}>
                <circle cx={S/2} cy={S/2} r={R} fill="none" stroke={th.b1} strokeWidth="2"/>
                <circle cx={S/2} cy={S/2} r={R} fill="none" stroke={tone} strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray={load ? `${C*0.28} ${C}` : C}
                  strokeDashoffset={load ? 0 : done ? 0 : C*(1-prog)}
                  style={{ transition: state==="idle" ? "stroke-dashoffset .3s, stroke .3s" : "stroke .3s" }}/>
              </svg>
            </span>

            {/* markaz */}
            <span style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
              {done ? (
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke={th.ok}
                  strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                  <path className="ckDraw" d="M20 6L9 17l-5-5"/>
                </svg>
              ) : (
                <span className={load ? "breath" : ready ? "starPop" : undefined}
                  key={ready||load ? "on" : "off"}
                  style={{ color: tone, display:"flex",
                    filter: (ready||load) ? `drop-shadow(0 0 9px ${th.accSub})` : "none",
                    transform: `rotate(${prog*90}deg)`,
                    transition: state==="idle" ? "transform .3s" : "none" }}>
                  <Star n={19} c="currentColor" filled={ready||load}/>
                </span>
              )}
            </span>
          </span>

          {/* yozuv + yorug'lik chizig'i */}
          <span style={{ position:"relative", height:12, width:150, overflow:"hidden",
            display:"flex", alignItems:"center", justifyContent:"center" }}>
            <span style={{
              fontSize:9.5, fontWeight:700, letterSpacing:"0.16em", textTransform:"uppercase",
              color: done ? th.ok : (ready||load) ? th.acc : th.t4,
              opacity: prog>.2 || busy ? 1 : 0,
              transition:"opacity .2s, color .25s", whiteSpace:"nowrap",
            }}>
              {done ? t("pull.done") : load ? t("pull.loading") : ready ? t("common.release") : t("pull.pull")}
            </span>
            {load && (
              <span className="sweep" style={{ position:"absolute", top:0, bottom:0, left:0, width:"45%",
                background:`linear-gradient(90deg,transparent,${th.accSub},transparent)` }}/>
            )}
          </span>
        </div>
      </div>

      <div>{children}</div>
    </div>
  );
};


// ═════════════════════════════════════════
// PIN QULF
// ═════════════════════════════════════════
const Pad = ({ onKey, onBack, dim }) => {
  const th = useTheme();
  const [hit,sHit] = useState(null);
  const K = ["1","2","3","4","5","6","7","8","9",null,"0","back"];
  return (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:11, width:"100%", maxWidth:268, margin:"0 auto",
      opacity: dim ? 0 : 1, transform: dim ? "translateY(12px)" : "none",
      transition:"opacity .3s, transform .3s", pointerEvents: dim ? "none" : "auto" }}>
      {K.map((k,i)=>{
        if (k===null) return <span key={i}/>;
        const back = k==="back";
        const down = hit===i;
        return (
          <button key={i} type="button"
            onClick={()=>{ hap.tap(); sHit(i); setTimeout(()=>sHit(null),110); back ? onBack() : onKey(k); }}
            style={{
              height:56, borderRadius:18, display:"flex", alignItems:"center", justifyContent:"center",
              cursor:"pointer", border:`1px solid ${back ? "transparent" : (down ? th.b2 : th.b1)}`,
              background: back ? "transparent" : (down ? th.s3 : th.s1),
              transform: down ? "scale(.92)" : "none",
              fontFamily:"'SF Mono','Fira Code',monospace", fontSize:23, fontWeight:600,
              color: back ? th.t3 : th.t1, letterSpacing:"-0.02em",
              transition:"transform .13s cubic-bezier(.2,0,0,1), background .13s, border-color .13s",
              WebkitTapHighlightColor:"transparent", touchAction:"manipulation", userSelect:"none", outline:"none",
            }}>
            {back
              ? <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={th.t3} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 5.5H9.4L3 12l6.4 6.5H20a1.5 1.5 0 001.5-1.5V7A1.5 1.5 0 0020 5.5z"/>
                  <path d="M17 9.5l-5 5M12 9.5l5 5"/>
                </svg>
              : k}
          </button>
        );
      })}
    </div>
  );
};

const PinGate = ({ saved, onSet, onOpen }) => {
  const th = useTheme();
  const N = 4;

  const [mode,sMode]   = useState(saved ? "enter" : "create");  // create | repeat | enter
  const [first,sFirst] = useState("");
  const [pin,sPin]     = useState("");
  const [phase,sPh]    = useState("idle");   // idle | merge | seal | gone
  const [bad,sBad]     = useState(false);
  const [msg,sMsg]     = useState("");

  const win = (code) => {
    hap.ok();
    sPh("merge");
    setTimeout(()=>sPh("seal"), 340);
    setTimeout(()=>sPh("gone"), 1000);
    setTimeout(()=>onOpen(code), 1480);
  };

  const fail = (m) => {
    hap.err(); sMsg(m); sBad(true);
    setTimeout(()=>{ sBad(false); sPin(""); }, 540);
  };

  const push = d => {
    if (phase!=="idle" || pin.length>=N) return;
    const next = pin + d;
    sPin(next); sMsg("");
    if (next.length < N) return;

    setTimeout(()=>{
      if (mode==="create") { hap.select(); sFirst(next); sPin(""); sMode("repeat"); }
      else if (mode==="repeat") {
        if (next===first) { onSet(next); win(next); }
        else { sMode("create"); sFirst(""); fail("Kodlar mos kelmadi"); }
      }
      else next===saved ? win(next) : fail(t("pin.wrong"));
    }, 170);
  };

  const back = () => { if(phase==="idle"){ sPin(p=>p.slice(0,-1)); sMsg(""); } };

  useEffect(()=>{
    const h = e => {
      if (phase!=="idle") return;
      if (/^[0-9]$/.test(e.key)) push(e.key);
      else if (e.key==="Backspace") back();
    };
    window.addEventListener("keydown", h);
    return ()=>window.removeEventListener("keydown", h);
  });

  const title = mode==="create" ? t("pin.create")
              : mode==="repeat" ? t("pin.repeat") : t("pin.enter");
  const note  = mode==="create" ? t("pin.createNote")
              : mode==="repeat" ? t("pin.repeatNote")
              : t("pin.note");

  const merging = phase!=="idle";
  const sealed  = phase==="seal" || phase==="gone";
  const gone    = phase==="gone";
  const GAP = 26, DOT = 15;

  return (
    <div className={gone ? "iris" : undefined} style={{
      position:"fixed", inset:0, zIndex:9800, overflow:"hidden",
      background: th.bgCss,
      display:"flex", flexDirection:"column",
      padding:"calc(26px + env(safe-area-inset-top,0px)) 20px calc(26px + env(safe-area-inset-bottom,0px))",
    }}>
      {/* fon nuri */}
      <span style={{ position:"absolute", inset:0, pointerEvents:"none",
        background: th.id==="light"
          ? "radial-gradient(ellipse 70% 45% at 50% 22%, rgba(16,19,26,0.05) 0%, transparent 60%)"
          : `radial-gradient(ellipse 70% 45% at 50% 22%, ${th.acc}1c 0%, transparent 60%)`,
        opacity: sealed ? 0 : 1, transition:"opacity .5s" }}/>

      {/* yuqori qism */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center",
        justifyContent:"center", gap:22, position:"relative", minHeight:0 }}>

        {/* brend */}
        <div className="brandIn" style={{ textAlign:"center",
          opacity: merging ? 0 : 1, transform: merging ? "translateY(-10px)" : "none",
          transition:"opacity .32s, transform .32s" }}>
          <span className="lockPulse" style={{
            width:54, height:54, borderRadius:18, margin:"0 auto 14px",
            display:"flex", alignItems:"center", justifyContent:"center",
            background:th.s2, border:`1px solid ${th.b1}`,
            boxShadow:`inset 0 1px 0 ${th.b2}`,
          }}>
            <Ic.Lock s={22} c={th.acc}/>
          </span>
          <p style={{ fontSize:10, fontWeight:700, color:th.t3, letterSpacing:"0.24em",
            textTransform:"uppercase", marginBottom:9 }}>PremoLux</p>
          <h1 style={{ fontSize:23, fontWeight:800, letterSpacing:"-0.03em", lineHeight:1.15 }}>{title}</h1>
          <p style={{ fontSize:13, color: msg ? th.err : th.t3, marginTop:6, transition:"color .2s" }}>
            {msg || note}
          </p>
        </div>

        {/* nuqtalar */}
        <div className={bad ? "shakeX" : undefined} style={{ position:"relative", height:56,
          display:"flex", alignItems:"center", justifyContent:"center" }}>
          {[0,1,2,3].map(i=>{
            const on = pin.length > i;
            const c  = (GAP+DOT);
            const x0 = (i - (N-1)/2) * c;
            return (
              <span key={i} style={{
                position:"absolute", left:"50%", top:"50%",
                width:DOT, height:DOT, marginLeft:-DOT/2, marginTop:-DOT/2,
                borderRadius:"50%",
                background: on ? (bad ? th.err : merging ? th.ok : th.acc) : "transparent",
                border:`1.6px solid ${on ? (bad?th.err:merging?th.ok:th.acc) : th.b2}`,
                transform:`translateX(${merging ? 0 : x0}px) scale(${merging ? .55 : 1})`,
                opacity: merging ? 0 : 1,
                boxShadow: on && !bad ? `0 0 12px ${merging?th.ok:th.acc}55` : "none",
                transition:"transform .34s cubic-bezier(.3,.9,.25,1), opacity .3s .06s, background .25s, border-color .25s, box-shadow .25s",
              }}>
                {on && !merging && <span className="dotIn" style={{ display:"block", width:"100%", height:"100%", borderRadius:"50%" }}/>}
              </span>
            );
          })}

          {/* muhr */}
          {sealed && (
            <>
              <span className="ringOut2" style={{ position:"absolute", width:52, height:52,
                borderRadius:"50%", border:`2px solid ${th.ok}` }}/>
              {Array.from({length:10},(_,k)=>{
                const a=(k/10)*Math.PI*2, d=54+(k%3)*14;
                return <span key={k} className="sparkO" style={{
                  position:"absolute", width:5, height:5, borderRadius:"50%", background:th.ok,
                  "--dx":`${Math.cos(a)*d}px`, "--dy":`${Math.sin(a)*d}px`,
                  animationDelay:`${(k%4)*0.03}s`,
                }}/>;
              })}
              <span className="sealPop" style={{
                position:"absolute", width:52, height:52, borderRadius:"50%",
                background:`${th.ok}22`, border:`2px solid ${th.ok}`,
                display:"flex", alignItems:"center", justifyContent:"center",
                boxShadow:`0 0 34px ${th.ok}55`,
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={th.ok}
                  strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                  <path className="ckLine" d="M20 6L9 17l-5-5"/>
                </svg>
              </span>
            </>
          )}
        </div>
      </div>

      {/* klaviatura */}
      <Pad onKey={push} onBack={back} dim={merging}/>

      {mode==="repeat" && phase==="idle" && (
        <button onClick={()=>{ sMode("create"); sFirst(""); sPin(""); sMsg(""); }}
          style={{ background:"none", border:"none", color:th.t3, fontSize:12, marginTop:14,
            cursor:"pointer", fontFamily:"inherit", textDecoration:"underline", alignSelf:"center" }}>
          Boshqa kod tanlash
        </button>
      )}
    </div>
  );
};


// Onboarding sarlavhasi — MODUL darajasida. Ichida e'lon qilingan bo'lsa,
// har render'da yangi komponent deb hisoblanadi va sarlavha qayta
// chizilib, animatsiya qayta boshlanadi.
const OnboardHead = ({ n, title, note, msg }) => {
  const th = useTheme();
  return (
    <div style={{ textAlign:"center", marginBottom:22 }}>
      <div style={{ display:"flex", justifyContent:"center", gap:7, marginBottom:18 }}>
        {[1,2,3].map(i=>(
          <span key={i} style={{
            width: i===n ? 22 : 7, height:7, borderRadius:4,
            background: i<n ? th.ok : i===n ? th.acc : th.b2,
            transition:"all .34s cubic-bezier(.3,1.2,.3,1)",
          }}/>
        ))}
      </div>
      <h1 style={{ fontSize:22, fontWeight:800, letterSpacing:"-0.03em", lineHeight:1.15 }}>{title}</h1>
      <p style={{ fontSize:13, color: msg ? th.err : th.t3, marginTop:7, lineHeight:1.5 }}>{msg || note}</p>
    </div>
  );
};

// ═════════════════════════════════════════
// KIRISH JARAYONI — kanal · PIN · kod
// ═════════════════════════════════════════
const Onboarding = ({ codes, onJoin }) => {
  const th = useTheme();
  const [step,sStep] = useState("channel");   // channel | code | done
  // har bir kanal/guruh uchun alohida holat: idle | wait | ok
  const [chk,sChk]   = useState(() => REQUIRED_SUBS.map(() => "idle"));
  const [code,sCode] = useState("");
  const [msg,sMsg]   = useState("");
  const [bad,sBad]   = useState(false);
  const [seal,sSeal] = useState(false);
  const [subErr,sSubErr] = useState("");

  // ── 1. kanal/guruh — HAQIQIY tekshiruv server orqali ──
  // Backend Telegram'da foydalanuvchi a'zoligini tekshiradi
  // (Telethon get_dialogs). Barcha kanal/guruhlarga a'zo
  // bo'lgandagina taklif kodi bosqichiga o'tiladi.
  const check = async () => {
    sChk(c => c.map(() => "wait"));
    sSubErr("");
    hap.tap();
    try {
      const res = await api.checkSub();
      if (res.ok) {
        sChk(c => c.map(() => "ok"));
        hap.ok();
        setTimeout(goCode, 900);
      } else {
        // hali a'zo bo'lmaganlar bor — qaysilari ekanini ko'rsatamiz
        const missing = (res.missing || []).map(m => m.replace(/^@/, "").toLowerCase());
        sChk(c => REQUIRED_SUBS.map(s =>
          missing.includes(s.name.replace(/^@/, "").toLowerCase()) ? "idle" : "ok"
        ));
        hap.err();
        sSubErr(t("ob.stillMissing"));
      }
    } catch (e) {
      // server ishlamayapti — foydalanuvchiga xabar, qayta urinish
      sChk(c => c.map(() => "idle"));
      hap.warn();
      sSubErr(e.code === "NETWORK" || e.code === "TIMEOUT"
        ? t("net.serverDown")
        : (e.message || t("ob.checkFail")));
    }
  };

  // ── 2. taklif kodi — BIR MARTALIK ──
  //
  // AVVAL bu qator faqat localStorage'dagi ro'yxatga qaragan edi
  // (codes.find). Ya'ni kod faqat EGASINING o'z qurilmasida mavjud
  // bo'lardi — boshqa foydalanuvchi hech qanday kodni kiritib olmasdi.
  // Endi:
  //   1) mahalliy ro'yxatda bo'lsa — darhol qabul (eski tartib)
  //   2) serverga yuboriladi — /auth/join haqiqiy tekshiradi va
  //      kodni BIR MARTALIK sarflaydi
  // Ishlatilgan kod qaytarilsa — "allaqal ishlatilgan" xabari.
  const [busy, sBusy] = useState(false);

  const fail = (msgKey) => {
    hap.err(); sMsg(msgKey); sBad(true);
    setTimeout(()=>sBad(false), 540);
  };

  const submit = async () => {
    if (busy) return;
    const raw = normCode(code);
    if (raw.length < CODE_MIN) return fail(t("ob.codeShort"));

    // ── mahalliy ro'yxat (eganing o'z qurilmasi) ──
    const local = codes.find(x => normCode(x.code) === raw);
    if (local && codeUsed(local)) return fail(t("ob.codeUsed"));
    if (local) {
      hap.ok(); sSeal(true); sMsg("");
      setTimeout(()=>onJoin({ ...local, code: raw }), 1200);
      return;
    }

    // ── server: haqiqiy va BIR MARTALIK tekshiruv ──
    sBusy(true); sMsg("");
    hap.tap();
    try {
      const data = await api.join(raw);
      const r = readJoinResult(data);
      hap.ok(); sSeal(true); sMsg("");
      setTimeout(()=>onJoin({ ...r.inv, code: raw, kind: r.kind, by: r.by || "owner" }, r.role), 1200);
    } catch (e) {
      // ishlatilgan kod — ikkinchi marta kiritilmoqda
      if (isUsedCodeError(e)) fail(t("ob.codeUsed"));
      // noto'g'ri / topilmagan kod
      else if (isBadCodeError(e)) fail(t("ob.badCode"));
      // serverga ulanib bo'lmadi — MAHALLIY ro'yxatga qaytamiz,
      // aks holda foydalanuvchi "noto'g'ri kod" deb o'ylab qolardi
      else if (e.code === "NETWORK" || e.code === "TIMEOUT") fail(t("net.serverDown"));
      else fail(e.message || t("ob.checkFail"));
    } finally {
      sBusy(false);
    }
  };

  // ── majburiy obuna END bo'lgach kodga o'tish ──
  const goCode = () => { hap.select(); sStep("code"); };

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:9800, overflow:"hidden", background:th.bgCss,
      display:"flex", flexDirection:"column",
      padding:"calc(28px + env(safe-area-inset-top,0px)) 20px calc(24px + env(safe-area-inset-bottom,0px))",
    }}>
      <span style={{ position:"absolute", inset:0, pointerEvents:"none",
        background: th.id==="light"
          ? "radial-gradient(ellipse 70% 45% at 50% 20%, rgba(16,19,26,0.05) 0%, transparent 60%)"
          : `radial-gradient(ellipse 70% 45% at 50% 20%, ${th.acc}1c 0%, transparent 60%)` }}/>

      <p style={{ textAlign:"center", fontSize:10, fontWeight:700, color:th.t3,
        letterSpacing:"0.26em", textTransform:"uppercase", marginBottom:26 }}>PremoLux</p>

      <div style={{ flex:1, display:"flex", flexDirection:"column", justifyContent:"center", minHeight:0 }}>

        {/* ── KANAL + GRUH ── */}
        {step==="channel" && (
          <div className="stepIn">
            <OnboardHead n={1} title={t("ob.title1")}
              note={t("ob.note1")}/>

            {REQUIRED_SUBS.map((sub, i) => (
              <div key={sub.name} style={{ ...glass(th,0.05), borderRadius:18, padding:"18px 16px", marginBottom:14 }}>
                <div style={{ display:"flex", alignItems:"center", gap:13 }}>
                  <span style={{ width:46, height:46, borderRadius:15, flexShrink:0,
                    background:th.accSub, border:`1px solid ${th.accBd}`,
                    display:"flex", alignItems:"center", justifyContent:"center" }}>
                    {sub.kind === "group" ? (
                      <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke={th.acc}
                        strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                      </svg>
                    ) : (
                      <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke={th.acc}
                        strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 3L10.5 13.5M21 3l-6.5 18-4-8-8-4z"/>
                      </svg>
                    )}
                  </span>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontSize:15, fontWeight:700, letterSpacing:"-0.01em" }}>{sub.name}</p>
                    <p style={{ fontSize:12, color:th.t3, marginTop:2 }}>
                      {sub.kind === "group" ? t("ob.officialGroup") : t("ob.official")}
                    </p>
                  </div>
                  {chk[i]==="ok" && <span className="tick2"><Ic.Check s={20} c={th.ok}/></span>}
                </div>
              </div>
            ))}

            <a href={`https://t.me/${CHANNEL.replace("@","")}`} target="_blank" rel="noreferrer"
              className="linkBtn" style={{
              padding:"12px 22px", fontSize:14, borderRadius:11,
              background:th.s2, border:`1px solid ${th.b1}`, color:th.t1,
              fontWeight:700, textDecoration:"none", display:"flex", width:"100%", marginBottom:9,
            }}>
              {t("ob.openChannel")}
            </a>
            <a href={`https://t.me/${REQUIRED_SUBS[1].name.replace("@","")}`} target="_blank" rel="noreferrer"
              className="linkBtn" style={{
              padding:"12px 22px", fontSize:14, borderRadius:11,
              background:th.s2, border:`1px solid ${th.b1}`, color:th.t1,
              fontWeight:700, textDecoration:"none", display:"flex", width:"100%", marginBottom:9,
            }}>
              {t("ob.openGroup")}
            </a>
            {subErr ? (
              <p style={{ textAlign:"center", fontSize:12.5, color:th.err, marginBottom:9, lineHeight:1.5 }}>{subErr}</p>
            ) : null}
            <Btn full sz="lg" onClick={check} disabled={chk.some(c=>c==="wait")}>
              {chk.some(c=>c==="wait") ? <><Ic.Spin s={14} c={th.accTxt}/>{t("ob.checking")}</>
               : chk.every(c=>c==="ok") ? <><Ic.Check s={14} c={th.accTxt}/>{t("ob.confirmed")}</>
                : t("ob.subscribed")}
            </Btn>
          </div>
        )}

        {/* ── KOD ── */}
        {step==="code" && (
          <div className="stepIn">
            {seal ? (
              <div style={{ textAlign:"center" }}>
                <span className="sealPop" style={{
                  width:74, height:74, borderRadius:"50%", margin:"0 auto 20px",
                  background:`${th.ok}22`, border:`2px solid ${th.ok}`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  boxShadow:`0 0 40px ${th.ok}55`,
                }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={th.ok}
                    strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                    <path className="ckLine" d="M20 6L9 17l-5-5"/>
                  </svg>
                </span>
                <h1 style={{ fontSize:22, fontWeight:800, letterSpacing:"-0.03em" }}>{t("ob.welcome")}</h1>
                <p style={{ fontSize:13, color:th.t3, marginTop:7 }}>{t("ob.opening")}</p>
              </div>
            ) : (
              <>
                <OnboardHead n={2} title={t("ob.title3")}
                  note={t("ob.note3")}/>
                <div className={bad?"shakeX":undefined} style={{ marginBottom:14 }}>
                  <input value={code} onChange={e=>sCode(fmtCode(e.target.value))}
                    placeholder="PLX-XXXX-XXXX-XXXX" autoCapitalize="characters" autoFocus
                    onKeyDown={e=>e.key==="Enter"&&submit()}
                    style={{ fontFamily:"'SF Mono','Fira Code',monospace", fontSize:17,
                      fontWeight:700, textAlign:"center", letterSpacing:"1.4px", padding:"15px 12px",
                      borderColor: bad ? th.err : undefined }}/>
                </div>
                {msg ? (
                  <p style={{ textAlign:"center", fontSize:12.5, color:th.err,
                    marginTop:-4, marginBottom:12, lineHeight:1.5 }}>{msg}</p>
                ) : null}
                <Btn full sz="lg" onClick={submit}
                  disabled={busy || normCode(code).length < CODE_MIN}>
                  {busy ? <><Ic.Spin s={14} c={th.accTxt}/>{t("ob.checkingCode")}</>
                   : <>{t("ob.confirmCode")}</>}
                </Btn>
                <p style={{ textAlign:"center", fontSize:11.5, color:th.t4, marginTop:14, lineHeight:1.5 }}>
                  {t("ob.noCode",{ch:CHANNEL})}
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};


// ─────────────────────────────────────────────
// APP ROOT
// ─────────────────────────────────────────────
export default function App() {
  const [themeId, setThemeId] = useState("amoled");
  // til — global o'zgaruvchida ham saqlanadi (t() undan o'qiydi),
  // React esa qayta render qilish uchun state'dan foydalanadi
  const [lang, setLangState] = useState(() => getLang());
  const setLang = l => { setLangGlobal(l); setLangState(l); };
  const [page, setPage] = useState("premium");
  const [entered, setEntered] = useState(true);   // PIN qulfi olib tashlandi — doim ochiq
  const [pin, setPin] = useState(null);
  const [ready, setReady] = useState(false);
  // ochilish ekranidagi bosqich: 0 telegram · 1 sozlamalar · 2 kartalar · 3 tayyor
  const [bootStage, setBootStage] = useState(0);
  // ochilish animatsiyasi — kamida SPLASH_MIN ko'rinib turadi.
  // Aks holda ilova 1 kadrda ochilib, animatsiya ko'rinmasdi.
  const [introDone, setIntroDone] = useState(false);
  useEffect(()=>{ const t = setTimeout(()=>setIntroDone(true), SPLASH_MIN); return ()=>clearTimeout(t); }, []);
  const [dir, setDir] = useState(0);              // sahifa yo'nalishi

  // ── umumiy ma'lumot ──
  const [account, setAccount] = useState("");
  const [bots, setBots] = useState([
    { id:1, username:"", connected:false, active:0, maxLogins:15, online:false },
    { id:2, username:"", connected:false, active:0, maxLogins:15, online:false },
    { id:3, username:"", connected:false, active:0, maxLogins:15, online:false },
  ]);
  const [people, setPeople] = useState([]);
  // role — null: ro'yxatdan o'tmagan (Onboarding ko'rsatiladi)
  // localStorage'dan tiklangan bo'lsa — saqlanadi
  const [role, setRole] = useState(() => {
    try {
      const raw = localStorage.getItem("premolux_v1");
      const d = raw ? JSON.parse(raw) : null;
      return d?.role || null;
    } catch { return null; }
  });
  const [codes, setCodes] = useState([]);
  const [hist, setHist] = useState([]);   // null | owner | partner | worker

  const [partners, setPartners] = useState([]);
  const [workers, setWorkers] = useState([]);



  const [cfg, setCfg] = useState({
    streams:8, retry:1, cardCap:3,
    maskPan:true,
    nOk:true, nLimit:true, nErr:true, daily:false, dailyAt:21,
    haptic:true, calm:false,
  });
  // har muvaffaqiyatli premium — statistikaga +1
  const bump = () => {
    const k = dayKey(), hr = new Date().getHours();
    setHist(l => {
      const i = l.findIndex(x=>x.d===k);
      if (i < 0) {
        const h = Array(24).fill(0); h[hr] = 1;
        return [...l, { d:k, n:1, h }].slice(-120);
      }
      const c = [...l];
      const h = [...c[i].h]; h[hr] = (h[hr]||0) + 1;
      c[i] = { ...c[i], n: c[i].n + 1, h };
      return c;
    });
  };

  const data = { account, setAccount, bots, setBots, people, setPeople, cfg, setCfg,
                 role, setRole, partners, setPartners, workers, setWorkers, pin, setPin,
                 codes, setCodes, hist, setHist, bump };

  // toast navbati
  const [toasts, setToasts] = useState([]);
  // Bildirishnoma sozlamalari avval faqat o'zgaruvchida saqlanardi va
  // hech qayerda ishlatilmasdi. Endi ular haqiqiy:
  //   nOk    — muvaffaqiyat xabarlari
  //   nErr   — xato xabarlari
  //   nLimit — ogohlantirish xabarlari (limit / muddat)
  const toastAllowed = kind => kind === "ok"    ? cfg.nOk    !== false
                             : kind === "err"   ? cfg.nErr   !== false
                             : kind === "warn"  ? cfg.nLimit !== false
                             : true;                       // info — doim
  const pushToast = ({ kind="info", title, note, ms=2600 }) => {
    if (!toastAllowed(kind)) return;
    setToasts(l => [...l.slice(-2), { id: Date.now()+Math.random(), kind, title, note, ms }]);
  };
  const killToast = id => setToasts(l => l.filter(t => t.id !== id));


  // <html lang> — ekran o'quvchi va tarjima kengaytmalari uchun
  useEffect(()=>{ document.documentElement.lang = lang; }, [lang]);

  // Telegram oynasini to'liq ochish
  useEffect(()=>{
    try { window.Telegram?.WebApp?.expand?.(); window.Telegram?.WebApp?.ready?.(); }
    catch (e) { logErr("telegram/sdk", e); }
  },[]);

  const bootWarned = useRef(false);
  // sozlamadagi haptik bayrog'i har o'zgarishda ham global o'zgaruvchiga yozilishi kerak
  useEffect(()=>{ setHaptic(cfg.haptic !== false); }, [cfg.haptic]);

  // ── saqlangan holatni yuklash + serverga "salom" ──
  // DIQQAT: window.storage FAQAT Claude'ning ichki muhitida ishlaydi —
  // mustaqil (Vercel) saytda mavjud emas. Shuning uchun oddiy, har
  // qanday brauzerda ishlaydigan localStorage ishlatiladi.
  useEffect(()=>{
    (async()=>{
      // ── 1. MAHALLIY ma'lumotni SINXRON tiklash ──
      // Bu kutishni talab qilmaydi, shuning uchun ilova darhol ochiladi.
      try {
        const raw0 = localStorage.getItem("premolux_v1");
        const d0 = raw0 ? JSON.parse(raw0) : null;
        if (d0) {
          if (d0.account  !== undefined) setAccount(d0.account);
          if (d0.bots)      setBots(d0.bots);
          if (d0.people)    setPeople(d0.people);
          if (d0.cfg)     { setCfg(c=>({ ...c, ...d0.cfg })); setHaptic(d0.cfg.haptic !== false); }
          if (d0.role)      setRole(d0.role);
          if (d0.partners)  setPartners(d0.partners);
          if (d0.workers)   setWorkers(d0.workers);
          if (d0.codes)     setCodes(d0.codes);
          if (d0.hist?.length) setHist(d0.hist);
          if (d0.themeId)   setThemeId(d0.themeId);
          if (d0.lang && LANGS.some(x=>x.id===d0.lang)) { setLangGlobal(d0.lang); setLangState(d0.lang); }
          if (d0.pin)       setPin(d0.pin);
        }
      } catch (e) { logErr("boot/restore", e); }

      // ── 2. Ilova darhol ochiladi ──
      // AVVAL bu qator network so'rovidan KEYIN turardi — server sekin
      // bo'lsa yoki javob bermasa, qulf ekrani 25 soniyaga qolardi
      // (request timeout). Endi mahalliy ma'lumot tiklangan zahoti
      // oynani ochamiz, server esa fon bilan tekshiriladi.
      setReady(true);
      setBootStage(1);          // endi sozlamalar yuklanmoqda

      // ── 3. FONDA server bilan sinxronlash ──
      // Sozlamalarni serverdan olishni shu yerga, verify BILAN
      // BIRRGA ketma-ket qilib olamiz. Alohida effektda bo'lsa,
      // StrictMode da mount effekti ikki marta ishlab, mahalliy
      // sozlamalarni server qiymati USTIGA qayta yozib ketardi.
      const settingsP = api.get("/settings").catch(() => null);

      try {
        await api.post("/auth/verify", {}).catch(e=>{
          // 428 (sub_required) HAR DOIM ishlashi kerak —
          // foydalanuvchi kanal/guruhdan chiqib ketgan bo'lsa,
          // keyingi ochilishda ham Onboarding ko'rsatiladi.
          // Bu xato EMAS — toast ko'rsatilmaydi.
          if (e.status === 428 && e.code === "sub_required") {
            setRole(null);
            return;
          }
          // 401/403 — ro'yxatdan o'tmagan yoki imzo noto'g'ri.
          // Bu ham xato EMAS — Onboarding ko'rsatiladi.
          if (e.status === 401 || e.status === 403) {
            setRole(null);
            return;
          }
          if (bootWarned.current) return;
          bootWarned.current = true;
          if (e.code === "NETWORK" || e.code === "TIMEOUT") {
            setTimeout(()=>pushToast({ kind:"warn", title:t("net.serverDown"),
              note:t("net.serverDownNote"), ms:3400 }), 900);
          }
        });

        const sv = await settingsP;
        const serverHasCfg = !!(sv && typeof sv === "object");
        if (serverHasCfg) {
          const next = {};
          for (const k of SETTINGS_KEYS) if (sv[k] !== undefined) next[k] = sv[k];
          // server holatini eslab qolamiz — keyingi o'zgarishlar
          // faqat shundan FARQ qilsa yuboriladi
          cfgServer.current = pickCfg(next);
          setCfg(c => ({ ...c, ...next }));
        }
        setBootStage(2);          // endi kartalar yuklanmoqda

        const raw = localStorage.getItem("premolux_v1");
        const d = raw ? JSON.parse(raw) : null;
        if (d) {
          if (d.account  !== undefined) setAccount(d.account);
          if (d.bots)      setBots(d.bots);
          if (d.people)    setPeople(d.people);
          // server javob BERGAN bo'lsa — uning qiymati ustiga yozmaymiz
          // (aks holda StrictMode da mahalliy qiymat server ustiga tushib qolardi)
          if (d.cfg && !serverHasCfg) { setCfg(c=>({ ...c, ...d.cfg })); }
          if (d.cfg) setHaptic(d.cfg.haptic !== false);
          if (d.role)      setRole(d.role);
          if (d.partners)  setPartners(d.partners);
          if (d.workers)   setWorkers(d.workers);
          if (d.codes)     setCodes(d.codes);
          if (d.hist?.length) setHist(d.hist);
          if (d.themeId)   setThemeId(d.themeId);
          if (d.lang && LANGS.some(x=>x.id===d.lang)) { setLangGlobal(d.lang); setLangState(d.lang); }
          if (d.pin)       setPin(d.pin);
        }
      } catch (e) { logErr("boot/verify", e); }

      // Mahalliy (localStorage) ma'lumot ESKIRGAN bo'lishi mumkin
      // (masalan boshqa qurilmada qo'shilgan karta) — shuning uchun
      // BACKEND'dan HAQIQIY ro'yxatni FONDA olib, ustidan yozamiz.
      // Bu endi ILOVA OCHILISHINI SEKINLASHTIRMAYDI.
      try {
        const realPeople = await api.get("/people");
        if (Array.isArray(realPeople)) setPeople(realPeople);
      } catch (e) { logErr("boot/people", e); }
      finally { setBootStage(3); }
    })();
  },[]);

  // ══════════════════════════════════════════════════════════
  // SOZLAMALARNI SERVER BILAN SINXRONLASH
  // ══════════════════════════════════════════════════════════
  // Backendda GET/PUT /settings bor va order_service.py "streams"
  // qiymatidan foydalangan holda Lane'larni Semaphore bilan
  // cheklaydi. Lekin frontend sozlamalarni faqat localStorage da
  // saqlar edi — server hech qachon xabar bermagan, shuning uchun
  // "Bir vaqtda oqim" har doim server standarti (8) bo'lib qolardi.
  //
  // Endi: ochilishda serverdan olinadi, o'zgarishda serverga yuboriladi.
  // cfgSync oqimi:
  //   boot  — ilova birinchi marta ochildi (hech narsa yuborilmaydi)
  //   skip  — qiymat serverdan keldi (yana yuborilmasligi kerak)
  //   idle  — foydalanuvchi o'zgartirdi -> serverga yuboriladi
  const SETTINGS_KEYS = ["streams","retry","cardCap","maskPan","nOk","nLimit","nErr","daily","dailyAt","haptic","calm"];

  const pickCfg = (c) => {
    const o = {};
    for (const k of SETTINGS_KEYS) o[k] = c[k];
    return o;
  };

  // Serverdagi OXIRGI ma'lum holat. Faqat shu bilan FARQ qilsakgina
  // serverga yuboramiz — shu yo'l bilan:
  //   · ilova birinchi ochilganda hech narsa yuborilmaydi
  //   · serverdan olgan qiymat qayta yuborilmaydi (ping-pong yo'q)
  //   · StrictMode da effektning ikki marta ishlashi muammosiz
  const cfgServer = useRef(null);
  const cfgBusy   = useRef(false);

  // foydalanuvchi o'zgartirsa — serverga yuboramiz
  useEffect(()=>{
    // serverdan hali olmaganmiz — yuborishning ma'nosi yo'q
    if (!ready || !cfgServer.current) return;

    const cur = pickCfg(cfg);
    // server bilan farq yo'q — hech narsa yubormaymiz
    if (JSON.stringify(cur) === JSON.stringify(cfgServer.current)) return;
    if (cfgBusy.current) return;

    const id = setTimeout(()=>{
      cfgBusy.current = true;
      api.put("/settings", { ...cur, pin:false, lockAfter:5 })   // PIN olib tashlangan
        .then(sv=>{ if (sv && typeof sv === "object") cfgServer.current = pickCfg(sv); })
        .catch(e=>logErr("settings/put", e))
        .finally(()=>{ cfgBusy.current = false; });
    }, 700);
    return ()=>clearTimeout(id);
  }, [ready, ...SETTINGS_KEYS.map(k=>cfg[k])]);

  // ── o'zgarishlarni saqlash ──
  useEffect(()=>{
    if (!ready) return;
    const t = setTimeout(()=>{
      try {
        localStorage.setItem("premolux_v1", JSON.stringify({
          account, bots, people, cfg, role, partners, workers, themeId, pin, codes, hist, lang,
        }));
      } catch (e) { logErr("state/save", e); }
    }, 350);
    return ()=>clearTimeout(t);
  }, [ready, account, bots, people, cfg, role, partners, workers, themeId, pin, codes, hist, lang]);

  // ── kunlik hisobot ──
  // Belgilangan soatda (masalan 21:00) ilova ochiq bo'lgan paytda kecha
  // qancha premium olingani haqida xabar beriladi. Ilova yopiq bo'lsa,
  // keyingi ochilishda "kechagi hisobot" ko'rsatiladi.
  useEffect(()=>{
    if (!ready || !cfg.daily) return;
    const hh = Math.max(0, Math.min(23, cfg.dailyAt ?? 21));
    const now = new Date();
    const keyOf = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
    const todayKey = keyOf(now);
    const sent = (()=>{ try { return localStorage.getItem("premolux_daily_sent"); } catch { return null; } })();

    const fire = () => {
      if (localStorage.getItem("premolux_daily_sent") === todayKey) return;
      try { localStorage.setItem("premolux_daily_sent", todayKey); } catch (e) { logErr("daily/save", e); }
      const n = hist.find(x=>x.d===todayKey)?.n || 0;
      pushToast({
        kind:"info", ms:4200,
        title: t("set.dailyFired"),
        note: n > 0 ? t("set.dailyFiredNote",{n}) : t("set.dailyFiredZero"),
      });
    };

    // kechagi hisobotni ko'rsatib qo'ymagan bo'lsak — ko'rsatamiz
    const y = new Date(now); y.setDate(y.getDate()-1);
    const yKey = keyOf(y);
    const yh = sent === yKey ? null : hist.find(x=>x.d===yKey);
    if (yh && yh.n > 0) {
      try { localStorage.setItem("premolux_daily_sent", yKey); } catch (e) { logErr("daily/save", e); }
      const n = yh.n;
      setTimeout(()=>pushToast({ kind:"info", ms:4200,
        title: t("set.dailyLate"), note: t("set.dailyLateNote",{n}) }), 1400);
      return;
    }

    // bugungi soatgacha kutamiz
    const next = new Date(now);
    next.setHours(hh, 0, 0, 0);
    if (next <= now) next.setDate(next.getDate()+1);
    const timer = setTimeout(fire, Math.min(next - now, 2147483647));
    return () => clearTimeout(timer);
  }, [ready, cfg.daily, cfg.dailyAt]);

  // sahifa yo'nalishi: o'ngdagi tabga o'tsa chapdan sirg'aladi
  const ORDER = ["premium","bots","cards","team","stats","profile"];
  useEffect(()=>{
    if (role==="worker" && (page==="bots" || page==="team")) setPage("premium");
  }, [role]);
  // pastga tortib yangilash — haqiqiy ma'lumotni qayta oladi
  const refresh = async () => {
    try {
      const real = await api.get("/people");
      if (Array.isArray(real)) setPeople(real);
      pushToast({ kind:"ok", title:t("toast.refreshed"), ms:1500 });
    } catch (e) {
      pushToast({ kind:"err", title:t("toast.refreshFail"), note:e.message, ms:2600 });
    }
  };

  const go = next => {
    if (next === page) return;
    setDir(ORDER.indexOf(next) > ORDER.indexOf(page) ? 1 : -1);
    setPage(next);
  };
  const theme = themes[themeId] || themes.amoled;

  // Bir martalik kod kiritilganda chaqiriladi. Bitta joyda yoziladi —
  // mantiq takrorlanmasa, keyin biri esdan chiqib qoladi.
  const join = (inv, serverRole) => {
    const me = window.Telegram?.WebApp?.initDataUnsafe?.user;
    const nm = me ? [me.first_name, me.last_name].filter(Boolean).join(" ") : "Yangi foydalanuvchi";
    // BIR MARTALIK: bu kod endi ishlatildi deb belgilanadi. Server'da
    // ham sarflangan, lekin mahalliy ro'yxatni ham yangilash kerak —
    // aks holda boshqa qurilmada kod qayta ishlatilsa, "ishlatilgan"
    // xabosi chiqmasdi.
    setCodes(l => markCodeUsed(l, inv.code, nm));
    const id = me?.id ? String(me.id) : String(700000000 + Math.floor(Math.random()*99999999));
    // server rolini afzal ko'ramiz (u haqiqiy), bo'lmasa kod turidan:
    //   partner kod -> hamkor · worker kod -> ishchi
    const kind = String(serverRole || inv.kind || "worker").toLowerCase();
    if (kind === "partner") {
      setRole("partner");
      setPartners(l=>[...l, { id:"me", name:nm, tgId:id, share:10, balance:0, orders:0, goal:2000000, today:0, week:[0,0,0,0,0,0,0] }]);
    } else if (kind === "owner") {
      setRole("owner");
    } else {
      setRole("worker");
      setWorkers(l=>[...l, { id:"me", name:nm, tag:"@"+(me?.username||"worker"), parent: inv.by,
        online:true, today:0, ok:100, last:"hozir", week:[0,0,0,0,0,0,0] }]);
    }
    setEntered(true);
  };

  // ── 1. OCHILISH (loading) ekrani ──
  // ma'lumot tayyor bo'lishi kutiladi va kamida SPLASH_MIN ko'rinib
  // turadi — keyin puflab o'chadi
  if (!ready || !introDone) return <Splash theme={theme} done={ready && introDone} stage={bootStage}/>;

  // ── 2. MAJBURIY OBUNA + BIR MARTALIK KOD ──
  // Bu loading ekranidan keyingi bosqich. Ilova orqasida emas, uni
  // TO'LIQ qopadi — kirmagan foydalanuvchi hech narsani ko'ra olmaydi
  // va boshqa sahifaga o'ta olmaydi.
  if (!role) return (
    <ThemeCtx.Provider value={theme}>
      <Css theme={theme}/>
      <div className={cfg.calm ? "calm" : undefined}>
        <Onboarding codes={codes} onJoin={join}/>
      </div>
    </ThemeCtx.Provider>
  );

  return (
    <ThemeCtx.Provider value={theme}>
    <DataCtx.Provider value={data}>
    <ToastCtx.Provider value={pushToast}>
      <Css theme={theme}/>
      <OfflineBanner/>
      {/* PIN qulfi olib tashlandi — foydalanuvchi so'ragan */}
      <ToastHost list={toasts} onKill={killToast}/>
      <div className={cfg.calm ? "calm" : undefined} style={{ position:"relative", zIndex:1, minHeight:"100vh", paddingBottom:118 }}>
        <main className={entered ? "wake" : undefined} style={{ padding:"14px 18px 18px", maxWidth:720, margin:"0 auto" }}>
          <PullRefresh onRefresh={refresh}>
            <div className={`${dir===0?"u":dir>0?"slideL":"slideR"} stg`} key={page} style={{ paddingTop:12 }}>
              {page==="premium" && <PremiumPage goto={setPage}/>}
              {page==="bots"    && <BotsPage/>}
              {page==="cards"   && <CardsPage/>}
              {page==="team"    && <TeamPage/>}
              {page==="stats"   && <StatsPage/>}
              {page==="profile" && <ProfilePage themeId={themeId} setThemeId={setThemeId} lang={lang} onLang={setLang}/>}
            </div>
          </PullRefresh>
        </main>
        <Nav page={page} setPage={go}/>
      </div>
    </ToastCtx.Provider>
    </DataCtx.Provider>
    </ThemeCtx.Provider>
  );
}
