import { useState, useEffect, useRef, createContext, useContext } from "react";

// ─────────────────────────────────────────────
// THEME SYSTEM
// ─────────────────────────────────────────────
const themes = {
  amoled: {
    id: "amoled",
    bg:    "#000000",
    bg2:   "#0a0a0a",
    s1:    "rgba(255,255,255,0.05)",
    s2:    "rgba(255,255,255,0.08)",
    s3:    "rgba(255,255,255,0.12)",
    b1:    "rgba(255,255,255,0.09)",
    b2:    "rgba(255,255,255,0.16)",
    b3:    "rgba(255,255,255,0.28)",
    t1:    "#FFFFFF",
    t2:    "rgba(255,255,255,0.58)",
    t3:    "rgba(255,255,255,0.32)",
    t4:    "rgba(255,255,255,0.18)",
    acc:   "#FFFFFF",
    accTxt:"#000000",
    accSub:"rgba(255,255,255,0.12)",
    accBd: "rgba(255,255,255,0.2)",
    nav:   "rgba(8,8,8,0.9)",
    bgCss: "#000",
    ok:"#34C759", warn:"#FF9F0A", err:"#FF453A",
    okA:"rgba(52,199,89,0.12)", warnA:"rgba(255,159,10,0.12)", errA:"rgba(255,69,58,0.1)",
  },
  stitch: {
    id: "stitch",
    bg:    "#050c1a",
    bg2:   "#070f22",
    s1:    "rgba(100,160,255,0.07)",
    s2:    "rgba(100,160,255,0.11)",
    s3:    "rgba(100,160,255,0.16)",
    b1:    "rgba(100,160,255,0.12)",
    b2:    "rgba(100,160,255,0.22)",
    b3:    "rgba(100,160,255,0.4)",
    t1:    "#E8F4FF",
    t2:    "rgba(232,244,255,0.58)",
    t3:    "rgba(232,244,255,0.32)",
    t4:    "rgba(232,244,255,0.18)",
    acc:   "#4F86D8",
    accTxt:"#FFFFFF",
    accSub:"rgba(79,134,216,0.15)",
    accBd: "rgba(79,134,216,0.3)",
    nav:   "rgba(5,12,26,0.88)",
    bgCss: "#050c1a",
    ok:"#34C759", warn:"#FF9F0A", err:"#FF453A",
    okA:"rgba(52,199,89,0.12)", warnA:"rgba(255,159,10,0.12)", errA:"rgba(255,69,58,0.1)",
  },

  light: {
    id: "light",
    bg:    "#F4F5F7",
    bg2:   "#FFFFFF",
    s1:    "rgba(16,19,26,0.035)",
    s2:    "rgba(16,19,26,0.06)",
    s3:    "rgba(16,19,26,0.09)",
    b1:    "rgba(16,19,26,0.09)",
    b2:    "rgba(16,19,26,0.15)",
    b3:    "rgba(16,19,26,0.32)",
    t1:    "#101319",
    t2:    "rgba(16,19,26,0.62)",
    t3:    "rgba(16,19,26,0.42)",
    t4:    "rgba(16,19,26,0.24)",
    acc:   "#101319",
    accTxt:"#FFFFFF",
    accSub:"rgba(16,19,26,0.07)",
    accBd: "rgba(16,19,26,0.16)",
    nav:   "rgba(255,255,255,0.86)",
    bgCss: "#F4F5F7",
    ok:"#12894A", warn:"#B46A00", err:"#C62B23",
    okA:"rgba(18,137,74,0.1)", warnA:"rgba(180,106,0,0.1)", errA:"rgba(198,43,35,0.08)",
  },
};

const ThemeCtx = createContext(themes.amoled);
const useTheme = () => useContext(ThemeCtx);

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
const Css = ({ theme }) => {
  const stitch = theme.id === "stitch";
  const light  = theme.id === "light";
  return <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
    html,body{height:100%;}
    body{
      font-family:'Inter',-apple-system,sans-serif;
      font-size:14px; line-height:1.5;
      color:${theme.t1};
      background:${theme.bgCss};
      -webkit-font-smoothing:antialiased;
      overflow-x:hidden;
    }
    body::before{
      content:''; position:fixed; inset:0; z-index:0; pointer-events:none;
      background:${light ? `
        radial-gradient(ellipse 85% 55% at 8% -8%, rgba(16,19,26,0.05) 0%, transparent 55%),
        radial-gradient(ellipse 70% 45% at 100% 102%, rgba(16,19,26,0.04) 0%, transparent 55%),
        ${theme.bgCss}
      ` : stitch ? `
        radial-gradient(ellipse 90% 55% at -5% -5%, rgba(59,109,193,0.35) 0%, transparent 50%),
        radial-gradient(ellipse 70% 50% at 105% 105%, rgba(8,145,178,0.22) 0%, transparent 50%),
        radial-gradient(ellipse 50% 40% at 50% 50%, rgba(30,58,138,0.18) 0%, transparent 60%),
        ${theme.bgCss}
      ` : `
        radial-gradient(ellipse 70% 45% at 50% 0%, rgba(255,255,255,0.025) 0%, transparent 55%),
        #000
      `};
    }
    ${stitch ? `
    body::after{
      content:''; position:fixed; inset:0; z-index:0; pointer-events:none;
      background:
        radial-gradient(ellipse 40% 30% at 80% 60%, rgba(6,182,212,0.12) 0%, transparent 60%),
        radial-gradient(ellipse 30% 20% at 20% 80%, rgba(59,109,193,0.1) 0%, transparent 60%);
      animation:_bl 14s ease-in-out infinite alternate;
    }
    @keyframes _bl{from{opacity:0.6;transform:scale(1);}to{opacity:1;transform:scale(1.08);}}
    ` : ""}

    #root{position:relative;z-index:1;}

    input{
      width:100%; padding:10px 13px;
      background:${theme.s1};
      border:1px solid ${theme.b1};
      border-radius:10px;
      color:${theme.t1};
      font-family:'Inter',-apple-system,sans-serif;
      font-size:16px; outline:none;
      backdrop-filter:blur(16px);
      -webkit-backdrop-filter:blur(16px);
      transition:border-color .15s,background .15s,box-shadow .15s;
    }
    input:focus{
      border-color:${theme.b3};
      background:${theme.s2};
      box-shadow:0 0 0 3px ${theme.accSub};
    }
    input::placeholder{color:${theme.t4};}

    @keyframes _up  {from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
    @keyframes _in  {from{opacity:0;transform:scale(.95) translateY(5px)}to{opacity:1;transform:none}}
    @keyframes _fd  {from{opacity:0}to{opacity:1}}
    @keyframes _sp  {to{transform:rotate(360deg)}}
    .u{animation:_up .28s cubic-bezier(.2,0,0,1) both}
    .i{animation:_in .22s cubic-bezier(.2,0,0,1) both}
    .f{animation:_fd .18s ease both}
    @keyframes _sh{from{transform:translateY(100%)}to{transform:none}}
    .sh{animation:_sh .3s cubic-bezier(.2,0,0,1) both}

    /* — g'ijimlanish: bukiladi, ezg'ilanadi, koptok bo'ladi — */
    @keyframes _crush{
      0%   {transform:scale(1,1) rotate(0) skewX(0);            border-radius:13px; filter:none}
      18%  {transform:scale(.97,.82) rotate(-1.5deg) skewX(-7deg); border-radius:18px}
      34%  {transform:scale(.8,.6) rotate(4deg) skewX(10deg);   border-radius:26px; filter:blur(.3px)}
      52%  {transform:scale(.58,.46) rotate(-7deg) skewX(-11deg);border-radius:38%; filter:blur(.7px)}
      70%  {transform:scale(.38,.34) rotate(9deg) skewX(7deg);  border-radius:46%; filter:blur(1.3px)}
      86%  {transform:scale(.22,.21) rotate(-11deg);            border-radius:50%; filter:blur(2px); opacity:.5}
      100% {transform:scale(.1,.1) rotate(16deg);               border-radius:50%; filter:blur(3px); opacity:0}
    }
    .crush{animation:_crush .42s cubic-bezier(.45,0,.7,.35) forwards; pointer-events:none; transform-origin:center center; will-change:transform, filter}

    /* — qator bo'shlig'i yopilishi — */
    @keyframes _fold{
      from{max-height:150px; margin-bottom:0;  opacity:1}
      to  {max-height:0;     margin-bottom:-7px; opacity:0}
    }
    .fold{animation:_fold .3s cubic-bezier(.45,0,.25,1) .3s forwards; overflow:hidden}

    /* — savat — */
    @keyframes _binPop{from{transform:translateY(74px) scale(.82); opacity:0}to{transform:none;opacity:1}}
    @keyframes _lid{0%{transform:rotate(0)}25%{transform:rotate(-38deg) translateY(-2px)}60%{transform:rotate(6deg)}100%{transform:rotate(0)}}
    @keyframes _squash{0%{transform:scaleY(1)}30%{transform:scaleY(.86) scaleX(1.07)}100%{transform:scaleY(1)}}
    @keyframes _puff{from{transform:scale(.3);opacity:.55}to{transform:scale(2.1);opacity:0}}
    .binPop{animation:_binPop .34s cubic-bezier(.18,.9,.28,1) both}
    .lidHit{animation:_lid .42s cubic-bezier(.3,0,.3,1)}
    .binHit{animation:_squash .34s cubic-bezier(.3,0,.3,1)}
    .puff{animation:_puff .45s ease-out forwards}

    /* ═══ KIRISH SAHNASI ═══ */

    /* — turgan holat: nafas olish, vazn almashishi — */
    @keyframes _breathe { 0%,100%{transform:translateY(0) scaleY(1)} 50%{transform:translateY(-.7px) scaleY(1.015)} }
    @keyframes _sway    { 0%,100%{transform:rotate(1.4deg)} 50%{transform:rotate(-1deg)} }
    @keyframes _idleArm { 0%,100%{transform:rotate(6deg)} 50%{transform:rotate(-5deg)} }

    /* — cho'kkalash (harakatdan oldin) — */
    @keyframes _crouch  { 0%{transform:translateY(0) scaleY(1) scaleX(1)} 55%{transform:translateY(2.4px) scaleY(.9) scaleX(1.06)} 100%{transform:translateY(0) scaleY(1) scaleX(1)} }

    /* — yugurish: tizza faqat oyoq ko'tarilganda bukiladi — */
    @keyframes _thighA { 0%,100%{transform:rotate(28deg)}  50%{transform:rotate(-22deg)} }
    @keyframes _thighB { 0%,100%{transform:rotate(-22deg)} 50%{transform:rotate(28deg)} }
    @keyframes _shinA  { 0%,100%{transform:rotate(-4deg)}  50%{transform:rotate(-42deg)} }
    @keyframes _shinB  { 0%,100%{transform:rotate(-42deg)} 50%{transform:rotate(-4deg)} }
    @keyframes _armA   { 0%,100%{transform:rotate(-44deg)} 50%{transform:rotate(32deg)} }
    @keyframes _armB   { 0%,100%{transform:rotate(32deg)}  50%{transform:rotate(-44deg)} }
    /* gavda: har qadamda bir marta ko'tariladi */
    @keyframes _bob    { 0%,50%,100%{transform:translateY(0)} 25%,75%{transform:translateY(-1.8px)} }
    @keyframes _lean   { 0%{transform:rotate(7deg)} 25%{transform:rotate(10deg)} 50%{transform:rotate(7deg)} 75%{transform:rotate(10deg)} 100%{transform:rotate(7deg)} }

    /* — yo'l: yuguradi, ostonada eshikka buriladi — */
    @keyframes _travel {
      0%   { left:calc(100% - 96px); transform:perspective(320px) rotateY(0deg)   scale(1);   opacity:1 }
      62%  { left:calc(100% - 60px); transform:perspective(320px) rotateY(0deg)   scale(1);   opacity:1 }
      /* burilish — yelkasi eshikka qaraydi */
      80%  { left:calc(100% - 48px); transform:perspective(320px) rotateY(-58deg) scale(.98); opacity:1 }
      92%  { left:calc(100% - 41px); transform:perspective(320px) rotateY(-80deg) scale(.94); opacity:.8 }
      100% { left:calc(100% - 37px); transform:perspective(320px) rotateY(-88deg) scale(.9);  opacity:0 }
    }
    /* soya — oyoq ostida siljiydi va yumshaydi */
    @keyframes _shadow {
      0%,50%,100% { transform:scaleX(1) scaleY(1); opacity:.2 }
      25%,75%     { transform:scaleX(.72) scaleY(.7); opacity:.1 }
    }
    /* itarilishdagi chang */
    @keyframes _kick { 0%{transform:scale(.35) translateX(0);opacity:.32} 100%{transform:scale(1.2) translateX(-9px);opacity:0} }

    /* — eshik — */
    @keyframes _door  { from{transform:perspective(260px) rotateY(0)} to{transform:perspective(260px) rotateY(-82deg)} }
    @keyframes _shut  { from{transform:perspective(260px) rotateY(-82deg)} to{transform:perspective(260px) rotateY(0)} }
    @keyframes _spill { 0%{opacity:0} 18%{opacity:1} 84%{opacity:1} 100%{opacity:0} }
    @keyframes _beam  { 0%{opacity:0;transform:scaleX(.2)} 22%{opacity:.75;transform:scaleX(1)} 84%{opacity:.75} 100%{opacity:0;transform:scaleX(.2)} }

    @keyframes _shake { 0%,100%{transform:translateX(0)} 18%{transform:translateX(-9px)} 38%{transform:translateX(8px)} 58%{transform:translateX(-5px)} 78%{transform:translateX(3px)} }
    @keyframes _pop   { from{transform:scale(.4);opacity:0} to{transform:scale(1);opacity:1} }

    /* turgan holat */
    .stand      { animation:_sway 3.4s ease-in-out infinite }
    .stand .bd  { animation:_breathe 3.4s ease-in-out infinite }
    .stand .aA  { animation:_idleArm 3.4s ease-in-out infinite }
    .stand .aB  { animation:_idleArm 3.4s ease-in-out infinite reverse }

    /* cho'kkalash */
    .crouch .bd { animation:_crouch .22s cubic-bezier(.3,0,.3,1) }

    /* yugurish */
    .run        { animation:_travel .92s cubic-bezier(.32,.02,.7,1) forwards }
    .run .bd    { animation:_bob .46s linear infinite }
    .run .torso { animation:_lean .46s ease-in-out infinite; transform:rotate(7deg) }
    .run .tA    { animation:_thighA .46s linear infinite }
    .run .tB    { animation:_thighB .46s linear infinite }
    .run .sA    { animation:_shinA .46s linear infinite }
    .run .sB    { animation:_shinB .46s linear infinite }
    .run .aA    { animation:_armA .46s linear infinite }
    .run .aB    { animation:_armB .46s linear infinite }
    .run .shd   { animation:_shadow .46s linear infinite }

    .kick   { animation:_kick .45s ease-out forwards }
    .dOpen  { animation:_door .3s cubic-bezier(.3,0,.2,1) forwards }
    .dShut  { animation:_shut .26s cubic-bezier(.4,0,.2,1) forwards }
    .spill  { animation:_spill 1.35s ease-in-out forwards }
    .beam   { animation:_beam 1.35s ease-in-out forwards }
    .shake  { animation:_shake .45s ease-in-out }
    .pop    { animation:_pop .32s cubic-bezier(.2,1.4,.4,1) both }

    /* ═══ KOD KATAKLARI ═══ */
    @keyframes _digit { from{opacity:0;transform:translateY(-8px) scale(.7)} 60%{opacity:1;transform:translateY(1px) scale(1.06)} to{opacity:1;transform:none} }
    @keyframes _caret { 0%,45%{opacity:1} 55%,100%{opacity:.15} }
    .digit { animation:_digit .24s cubic-bezier(.2,1.3,.4,1) both }
    .caret { animation:_caret 1.05s steps(1,end) infinite }

    /* ═══ BUYURTMA ═══ */
    @keyframes _scan  { 0%{transform:translateX(-100%)} 100%{transform:translateX(300%)} }
    @keyframes _ring  { 0%{transform:scale(1);opacity:.55} 100%{transform:scale(2.3);opacity:0} }
    @keyframes _tick  { 0%,100%{opacity:1} 50%{opacity:.35} }
    @keyframes _flow  { to{stroke-dashoffset:-14} }
    @keyframes _burst { 0%{transform:scale(.2) rotate(0);opacity:1} 100%{transform:scale(1.9) rotate(70deg);opacity:0} }
    @keyframes _countUp{ from{transform:translateY(6px);opacity:0} to{transform:none;opacity:1} }
    .scan  { animation:_scan 2.4s cubic-bezier(.4,0,.6,1) infinite }
    .ping  { animation:_ring 1.6s cubic-bezier(.2,0,.4,1) infinite }
    .tick  { animation:_tick 1.1s ease-in-out infinite }
    .flow  { animation:_flow .7s linear infinite }
    .burst { animation:_burst .7s cubic-bezier(.2,0,.4,1) forwards }
    .cUp   { animation:_countUp .3s cubic-bezier(.2,0,0,1) both }

    /* ═══ PIN QULF ═══ */
    @keyframes _pinIn  { from{opacity:0;transform:scale(.5)} 65%{transform:scale(1.14)} to{opacity:1;transform:scale(1)} }
    @keyframes _pinErr { 0%,100%{transform:translateX(0)} 15%{transform:translateX(-10px)} 32%{transform:translateX(9px)} 50%{transform:translateX(-6px)} 68%{transform:translateX(4px)} 84%{transform:translateX(-2px)} }
    @keyframes _spark  { from{transform:translate(0,0) scale(1);opacity:.9} to{transform:translate(var(--dx),var(--dy)) scale(0);opacity:0} }
    @keyframes _halo   { from{transform:scale(.5);opacity:.5} to{transform:scale(2.4);opacity:0} }
    @keyframes _seal   { from{opacity:0;transform:scale(.3) rotate(-25deg)} 60%{transform:scale(1.12) rotate(4deg)} to{opacity:1;transform:scale(1) rotate(0)} }
    @keyframes _draw   { from{stroke-dashoffset:26} to{stroke-dashoffset:0} }
    .pinIn { animation:_pinIn .22s cubic-bezier(.2,1.4,.4,1) both }
    .pinErr{ animation:_pinErr .5s cubic-bezier(.36,.07,.19,.97) }
    .spark { animation:_spark .72s cubic-bezier(.2,.7,.3,1) forwards }
    .halo  { animation:_halo .8s cubic-bezier(.2,.7,.3,1) forwards }
    .seal  { animation:_seal .42s cubic-bezier(.2,1.35,.4,1) both }
    .draw  { stroke-dasharray:26; animation:_draw .3s cubic-bezier(.4,0,.2,1) .12s both }
    @keyframes _grow { from{transform:scaleY(.15);opacity:.4} to{transform:none;opacity:1} }
    .bar   { animation:_grow .45s cubic-bezier(.2,.9,.3,1) both; transform-origin:bottom }

    /* ═══ KARTA QO'NISHI ═══ */
    @keyframes _land {
      0%   { opacity:0; transform:perspective(760px) translate3d(0,-96px,220px) rotateX(52deg) rotateZ(-7deg) scale(1.08) }
      40%  { opacity:1 }
      68%  { transform:perspective(760px) translate3d(0,7px,0) rotateX(-5deg) rotateZ(1.2deg) scale(1) }
      84%  { transform:perspective(760px) translate3d(0,-2px,0) rotateX(1.5deg) rotateZ(-.4deg) }
      100% { opacity:1; transform:none }
    }
    @keyframes _sheen { 0%{transform:translateX(-130%) skewX(-18deg)} 100%{transform:translateX(230%) skewX(-18deg)} }
    .land  { animation:_land .78s cubic-bezier(.22,.7,.28,1) both }
    .sheen { animation:_sheen .8s cubic-bezier(.3,0,.2,1) .3s both }

    /* ═══ PASTGA TORTIB YANGILASH ═══ */
    @keyframes _arcSpin  { to{transform:rotate(360deg)} }
    @keyframes _ringOut  { from{transform:scale(.55);opacity:.5} to{transform:scale(2.4);opacity:0} }
    @keyframes _starPop  { 0%{transform:scale(.35) rotate(-50deg);opacity:0} 55%{transform:scale(1.2) rotate(10deg);opacity:1} 100%{transform:scale(1) rotate(0);opacity:1} }
    @keyframes _breath   { 0%,100%{transform:scale(1);opacity:.85} 50%{transform:scale(1.14);opacity:1} }
    @keyframes _ckDraw   { from{stroke-dashoffset:24} to{stroke-dashoffset:0} }
    @keyframes _sweep    { 0%{transform:translateX(-120%);opacity:0} 22%{opacity:1} 100%{transform:translateX(220%);opacity:0} }
    .arcSpin { animation:_arcSpin .9s linear infinite }
    .ringOut { animation:_ringOut .8s cubic-bezier(.2,.7,.3,1) forwards }
    .starPop { animation:_starPop .42s cubic-bezier(.2,1.35,.4,1) both }
    .breath  { animation:_breath 1.15s ease-in-out infinite }
    .ckDraw  { stroke-dasharray:24; animation:_ckDraw .3s cubic-bezier(.4,0,.2,1) both }
    .sweep   { animation:_sweep 1.1s cubic-bezier(.4,0,.3,1) infinite }

    /* ═══ TOAST ═══ */
    @keyframes _toastIn  { from{opacity:0;transform:translateY(-22px) scale(.94)} to{opacity:1;transform:none} }
    @keyframes _toastOut { from{opacity:1;transform:none} to{opacity:0;transform:translateY(-16px) scale(.96)} }
    @keyframes _tBar     { from{transform:scaleX(1)} to{transform:scaleX(0)} }
    .toastIn  { animation:_toastIn .34s cubic-bezier(.18,1.2,.34,1) both }
    .toastOut { animation:_toastOut .26s cubic-bezier(.4,0,.7,.4) both }
    .tBar     { transform-origin:left center; animation:_tBar linear forwards }

    /* ═══ CHAPGA SURISH ═══ */
    .swipeWrap { position:relative; overflow:hidden; border-radius:13px; }
    .swipeRow  { position:relative; z-index:2; will-change:transform; }
    @keyframes _revealPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.16)} }
    .revealPulse { animation:_revealPulse .5s ease-in-out infinite }

    /* ═══ QAYTARISH PANELI ═══ */
    @keyframes _undoIn  { from{opacity:0;transform:translateY(26px) scale(.94)} to{opacity:1;transform:none} }
    @keyframes _undoOut { from{opacity:1;transform:none} to{opacity:0;transform:translateY(16px) scale(.96)} }
    .undoIn  { animation:_undoIn .38s cubic-bezier(.18,1.15,.32,1) both }
    .undoOut { animation:_undoOut .24s cubic-bezier(.4,0,.7,.4) both }

    /* ═══ SAHIFA ALMASHINUVI ═══ */
    @keyframes _slideL { from{opacity:0;transform:translateX(28px)}  to{opacity:1;transform:none} }
    @keyframes _slideR { from{opacity:0;transform:translateX(-28px)} to{opacity:1;transform:none} }
    .slideL { animation:_slideL .34s cubic-bezier(.22,.9,.28,1) both }
    .slideR { animation:_slideR .34s cubic-bezier(.22,.9,.28,1) both }

    /* ═══ SKELET YALTIRASHI ═══ */
    @keyframes _shine { 0%{transform:translateX(-120%)} 100%{transform:translateX(220%)} }
    .shine { animation:_shine 1.25s cubic-bezier(.4,0,.3,1) infinite }
    @keyframes _iconIn { from{opacity:0;transform:scale(.82)} to{opacity:1;transform:none} }
    .iconIn { animation:_iconIn .3s cubic-bezier(.2,1.2,.4,1) both }

    /* ═══ LIMIT MUHRI ═══ */
    @keyframes _stamp {
      0%   { opacity:0; transform:rotate(-26deg) scale(2.6); filter:blur(3px) }
      55%  { opacity:1; transform:rotate(-13deg) scale(.94); filter:blur(0) }
      70%  { transform:rotate(-13deg) scale(1.05) }
      82%  { transform:rotate(-12deg) scale(.98) }
      100% { opacity:1; transform:rotate(-13deg) scale(1) }
    }
    @keyframes _jolt { 0%,100%{transform:translateX(0)} 22%{transform:translateX(-4px)} 46%{transform:translateX(3px)} 70%{transform:translateX(-2px)} }
    @keyframes _dim  { from{filter:grayscale(0) opacity(1)} to{filter:grayscale(.75) opacity(.62)} }
    .stamp { animation:_stamp .52s cubic-bezier(.2,.9,.25,1) both }
    .jolt  { animation:_jolt .34s cubic-bezier(.36,.07,.19,.97) .34s }
    .dim   { animation:_dim .5s ease-out .4s both }
    @keyframes _pipIn { from{transform:scaleX(0)} to{transform:scaleX(1)} }
    .pip { transform-origin:left center; animation:_pipIn .34s cubic-bezier(.2,.9,.3,1) both }

    /* ═══ BO'SH EKRAN ═══ */
    @keyframes _sketch { from{stroke-dashoffset:var(--len)} to{stroke-dashoffset:0} }
    @keyframes _driftY { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
    @keyframes _fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }
    @keyframes _popIn  { from{opacity:0;transform:scale(.7)} 60%{transform:scale(1.08)} to{opacity:1;transform:scale(1)} }
    .sketch { stroke-dasharray:var(--len); animation:_sketch .9s cubic-bezier(.35,0,.2,1) both }
    .drift  { animation:_driftY 3.4s ease-in-out infinite }
    .eUp    { animation:_fadeUp .42s cubic-bezier(.2,.9,.3,1) both }
    .ePop   { animation:_popIn .4s cubic-bezier(.2,1.3,.4,1) both }

    /* ═══ RAQAM SANASHI ═══ */
    @keyframes _numIn { from{opacity:0;transform:translateY(7px)} to{opacity:1;transform:none} }
    .numIn { animation:_numIn .3s cubic-bezier(.2,.9,.3,1) both }

    /* ═══ MODAL TUGMADAN O'SISHI ═══ */
    @keyframes _grow {
      from { opacity:0; transform:translate(var(--gx), var(--gy)) scale(var(--gs)); }
      to   { opacity:1; transform:translate(0,0) scale(1); }
    }
    .grow { animation:_grow .42s cubic-bezier(.22,1.02,.3,1) both; transform-origin:center center; }

    /* ═══ SOZLAMALAR ═══ */
    @keyframes _rowIn { from{opacity:0;transform:translateY(9px)} to{opacity:1;transform:none} }
    .rowIn { animation:_rowIn .34s cubic-bezier(.2,.9,.3,1) both }
    @keyframes _knob { 0%{transform:scaleX(1)} 45%{transform:scaleX(1.22)} 100%{transform:scaleX(1)} }
    .knob { animation:_knob .28s cubic-bezier(.3,.9,.3,1) }
    @keyframes _fill { from{transform:scaleX(0)} to{transform:scaleX(1)} }
    .fill { transform-origin:left center; animation:_fill 1.4s linear forwards }
    @keyframes _danger { 0%,100%{box-shadow:0 0 0 0 rgba(255,69,58,0)} 50%{box-shadow:0 0 0 5px rgba(255,69,58,.16)} }
    .danger { animation:_danger 1.3s ease-in-out infinite }

    /* ═══ PIN SAHNASI ═══ */
    @keyframes _dotIn   { 0%{transform:scale(0);opacity:0} 55%{transform:scale(1.35)} 100%{transform:scale(1);opacity:1} }
    @keyframes _dotOut  { from{transform:scale(1);opacity:1} to{transform:scale(0);opacity:0} }
    @keyframes _shakeX  { 0%,100%{transform:translateX(0)} 12%{transform:translateX(-13px)} 28%{transform:translateX(11px)} 44%{transform:translateX(-8px)} 62%{transform:translateX(6px)} 80%{transform:translateX(-3px)} }
    @keyframes _lockPulse{ 0%,100%{transform:scale(1);opacity:.9} 50%{transform:scale(1.06);opacity:1} }
    @keyframes _sealPop { 0%{transform:scale(.2);opacity:0} 55%{transform:scale(1.16);opacity:1} 100%{transform:scale(1);opacity:1} }
    @keyframes _ringOut2{ from{transform:scale(.4);opacity:.6} to{transform:scale(2.8);opacity:0} }
    @keyframes _ckLine  { from{stroke-dashoffset:26} to{stroke-dashoffset:0} }
    @keyframes _iris    { from{transform:scale(1);opacity:1} to{transform:scale(2.2);opacity:0} }
    @keyframes _wake    { from{transform:scale(.94);opacity:0} 99%{transform:scale(1)} to{transform:none;opacity:1} }
    @keyframes _sparkO  { from{transform:translate(0,0) scale(1);opacity:.95} to{transform:translate(var(--dx),var(--dy)) scale(0);opacity:0} }
    @keyframes _brandIn { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:none} }

    .dotIn   { animation:_dotIn .26s cubic-bezier(.2,1.5,.4,1) both }
    .dotOut  { animation:_dotOut .18s cubic-bezier(.5,0,.8,.4) both }
    .shakeX  { animation:_shakeX .52s cubic-bezier(.36,.07,.19,.97) }
    .lockPulse{ animation:_lockPulse 2.6s ease-in-out infinite }
    .sealPop { animation:_sealPop .4s cubic-bezier(.2,1.35,.4,1) both }
    .ringOut2{ animation:_ringOut2 .85s cubic-bezier(.2,.7,.3,1) forwards }
    .ckLine  { stroke-dasharray:26; animation:_ckLine .3s cubic-bezier(.4,0,.2,1) .1s both }
    .iris    { animation:_iris .58s cubic-bezier(.5,0,.75,0) forwards }
    .wake    { animation:_wake .5s cubic-bezier(.2,.9,.3,1) both }
    .sparkO  { animation:_sparkO .8s cubic-bezier(.2,.7,.3,1) forwards }
    .brandIn { animation:_brandIn .5s cubic-bezier(.2,.9,.3,1) both }

    /* ═══ TAKLIF KODI ═══ */
    @keyframes _codeIn  { from{opacity:0;transform:translateY(-10px) scale(.96)} to{opacity:1;transform:none} }
    @keyframes _charIn  { from{opacity:0;transform:translateY(-6px) scale(.7)} to{opacity:1;transform:none} }
    @keyframes _scanLine{ 0%{transform:translateY(-100%)} 100%{transform:translateY(400%)} }
    @keyframes _usedX   { from{opacity:0;transform:scaleX(0)} to{opacity:1;transform:scaleX(1)} }
    .codeIn  { animation:_codeIn .42s cubic-bezier(.2,1.05,.3,1) both }
    .charIn  { animation:_charIn .3s cubic-bezier(.2,1.3,.4,1) both }
    .scanLine{ animation:_scanLine 2.2s cubic-bezier(.4,0,.6,1) infinite }
    .usedX   { transform-origin:left center; animation:_usedX .34s cubic-bezier(.3,.9,.3,1) both }

    /* ═══ STATISTIKA GRAFIGI ═══ */
    @keyframes _draw2  { from{stroke-dashoffset:1} to{stroke-dashoffset:0} }
    @keyframes _rise   { from{transform:scaleY(0);opacity:0} to{transform:scaleY(1);opacity:1} }
    @keyframes _dotPop { from{transform:scale(0);opacity:0} 60%{transform:scale(1.45)} to{transform:scale(1);opacity:1} }
    @keyframes _gridIn { from{opacity:0;transform:scaleX(.7)} to{opacity:1;transform:scaleX(1)} }
    @keyframes _heroIn { from{opacity:0;transform:translateY(14px) scale(.94)} to{opacity:1;transform:none} }
    @keyframes _barGrow{ from{transform:scaleX(0)} to{transform:scaleX(1)} }
    @keyframes _glowPulse{ 0%,100%{opacity:.28} 50%{opacity:.6} }
    .draw2   { stroke-dasharray:1; stroke-dashoffset:1; animation:_draw2 1.15s cubic-bezier(.32,.02,.2,1) both }
    .rise    { transform-origin:bottom; animation:_rise .8s cubic-bezier(.24,.9,.3,1) both }
    .dotPop  { animation:_dotPop .34s cubic-bezier(.2,1.4,.4,1) both }
    .gridIn  { transform-origin:left center; animation:_gridIn .5s cubic-bezier(.2,.9,.3,1) both }
    .heroIn  { animation:_heroIn .5s cubic-bezier(.2,.95,.3,1) both }
    .barGrow { transform-origin:left center; animation:_barGrow .7s cubic-bezier(.22,.9,.28,1) both }
    .glowPulse{ animation:_glowPulse 3s ease-in-out infinite }

    /* ═══ PARASHYUT YUKLANISH ═══ */
    @keyframes _chuteIn   { from{opacity:0;transform:translateY(-14px) scale(.7)} to{opacity:1;transform:none} }
    @keyframes _chuteSway { 0%,100%{transform:rotate(-2.5deg)} 50%{transform:rotate(2.5deg)} }
    @keyframes _cordPull  { from{stroke-dashoffset:1} to{stroke-dashoffset:0} }
    @keyframes _dlBounce  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(3px)} }
    @keyframes _landPop   { 0%{transform:scale(1)} 35%{transform:scale(.88,1.1)} 60%{transform:scale(1.05,.94)} 100%{transform:scale(1)} }
    @keyframes _dustOut   { from{transform:scale(.3) translateY(0);opacity:.7} to{transform:scale(1.6) translateY(-4px);opacity:0} }
    @keyframes _checkPop  { from{opacity:0;transform:scale(.5)} 60%{transform:scale(1.15)} to{opacity:1;transform:scale(1)} }
    @keyframes _checkLine { from{stroke-dashoffset:22} to{stroke-dashoffset:0} }
    .chuteIn   { animation:_chuteIn .4s cubic-bezier(.2,1.1,.3,1) both }
    .chuteSway { animation:_chuteSway 1.8s ease-in-out infinite }
    .cordPull  { stroke-dasharray:1; animation:_cordPull .3s linear both }
    .dlBounce  { animation:_dlBounce 1.1s ease-in-out infinite }
    .landPop   { animation:_landPop .5s cubic-bezier(.3,0,.2,1) both }
    .dustOut   { animation:_dustOut .5s ease-out forwards }
    .checkPop  { animation:_checkPop .38s cubic-bezier(.2,1.3,.4,1) both }
    .checkLine { stroke-dasharray:22; animation:_checkLine .3s cubic-bezier(.4,0,.2,1) .1s both }

    /* ═══ TARMOQ HOLATI ═══ */
    @keyframes _bannerIn  { from{opacity:0;transform:translateY(-100%)} to{opacity:1;transform:none} }
    @keyframes _bannerOut { from{opacity:1;transform:none} to{opacity:0;transform:translateY(-100%)} }
    @keyframes _dotBlink  { 0%,100%{opacity:1} 50%{opacity:.3} }
    @keyframes _skelShine { 0%{transform:translateX(-100%)} 100%{transform:translateX(200%)} }
    .bannerIn  { animation:_bannerIn .32s cubic-bezier(.2,.9,.3,1) both }
    .bannerOut { animation:_bannerOut .26s cubic-bezier(.4,0,.7,.4) both }
    .dotBlink  { animation:_dotBlink 1.1s ease-in-out infinite }
    .skelShine { animation:_skelShine 1.3s cubic-bezier(.4,0,.3,1) infinite }

    /* ═══ TAKLIF KODI ═══ */
    @keyframes _codeIn  { from{opacity:0;transform:translateY(-6px) scale(.9)} to{opacity:1;transform:none} }
    @keyframes _scanLine{ 0%{transform:translateY(-100%)} 100%{transform:translateY(320%)} }
    @keyframes _joinIn  { from{opacity:0;transform:translateY(14px) scale(.96)} to{opacity:1;transform:none} }
    @keyframes _tick2   { from{stroke-dashoffset:26} to{stroke-dashoffset:0} }
    @keyframes _bubble  { 0%{transform:translateY(0) scale(1);opacity:.5} 100%{transform:translateY(-34px) scale(.3);opacity:0} }
    .codeIn  { animation:_codeIn .28s cubic-bezier(.2,1.3,.4,1) both }
    .scanLine{ animation:_scanLine 2.2s cubic-bezier(.4,0,.6,1) infinite }
    .joinIn  { animation:_joinIn .42s cubic-bezier(.2,.95,.3,1) both }
    .tick2   { stroke-dasharray:26; animation:_tick2 .34s cubic-bezier(.4,0,.2,1) both }
    .bubble  { animation:_bubble 1.6s ease-out infinite }

    /* ═══ TAKLIF KODI ═══ */
    @keyframes _codeIn  { from{opacity:0;transform:translateY(10px) scale(.96)} to{opacity:1;transform:none} }
    @keyframes _scanLine{ 0%{transform:translateY(-120%)} 100%{transform:translateY(320%)} }
    @keyframes _charIn  { from{opacity:0;transform:translateY(-9px) scale(.7)} to{opacity:1;transform:none} }
    @keyframes _joinPop { 0%{transform:scale(.3);opacity:0} 55%{transform:scale(1.15)} 100%{transform:scale(1);opacity:1} }
    .codeIn   { animation:_codeIn .4s cubic-bezier(.2,1.05,.3,1) both }
    .scanLine { animation:_scanLine 2.2s cubic-bezier(.4,0,.6,1) infinite }
    .charIn   { animation:_charIn .24s cubic-bezier(.2,1.4,.4,1) both }
    .joinPop  { animation:_joinPop .42s cubic-bezier(.2,1.3,.4,1) both }

    /* ═══ TAKLIF KODI ═══ */
    @keyframes _chIn   { from{opacity:0;transform:translateY(-9px) scale(.8)} to{opacity:1;transform:none} }
    @keyframes _codeGl { 0%,100%{box-shadow:0 0 0 0 transparent} 50%{box-shadow:0 0 22px -4px currentColor} }
    @keyframes _stepIn { from{opacity:0;transform:translateX(26px)} to{opacity:1;transform:none} }
    @keyframes _stepOut{ from{opacity:1;transform:none} to{opacity:0;transform:translateX(-26px)} }
    @keyframes _tick2  { from{transform:scale(.4);opacity:0} 60%{transform:scale(1.14)} to{transform:scale(1);opacity:1} }
    .chIn   { animation:_chIn .3s cubic-bezier(.2,1.3,.4,1) both }
    .codeGl { animation:_codeGl 2.4s ease-in-out infinite }
    .stepIn { animation:_stepIn .36s cubic-bezier(.2,.9,.3,1) both }
    .tick2  { animation:_tick2 .38s cubic-bezier(.2,1.35,.4,1) both }

    /* ═══ PREMIUM BAYRAMI ═══ */
    @keyframes _conf {
      0%   { transform:translate3d(0,0,0) rotate(0deg) scale(1); opacity:0 }
      8%   { opacity:1 }
      100% { transform:translate3d(var(--cx), var(--cy), 0) rotate(var(--cr)) scale(var(--cs)); opacity:0 }
    }
    @keyframes _burstRing { from{transform:scale(.3);opacity:.75} to{transform:scale(3.4);opacity:0} }
    @keyframes _starPop2 {
      0%   { transform:scale(0) rotate(-140deg); opacity:0 }
      45%  { transform:scale(1.35) rotate(12deg); opacity:1 }
      70%  { transform:scale(.92) rotate(-4deg) }
      100% { transform:scale(1) rotate(0); opacity:1 }
    }
    @keyframes _glowUp { 0%{opacity:0} 30%{opacity:1} 100%{opacity:0} }
    @keyframes _rise2  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:none} }
    .conf      { animation:_conf var(--cd) cubic-bezier(.15,.6,.35,1) forwards }
    .burstRing { animation:_burstRing .95s cubic-bezier(.2,.7,.3,1) forwards }
    .starPop2  { animation:_starPop2 .62s cubic-bezier(.2,1.2,.35,1) both }
    .glowUp    { animation:_glowUp 1.5s ease-out forwards }
    .rise2     { animation:_rise2 .45s cubic-bezier(.2,.9,.3,1) both }

    /* harakatlarni kamaytirish */
    .calm *, .calm *::before, .calm *::after {
      animation-duration:.01ms !important; animation-iteration-count:1 !important;
      transition-duration:.06s !important;
    }

    /* ═══ KARTANI AG'DARISH ═══ */
    .flipStage { perspective:1200px; }
    .flipInner { display:grid; transform-style:preserve-3d; transition:transform .6s cubic-bezier(.3,.78,.24,1); }
    .flipFace  { grid-area:1 / 1; backface-visibility:hidden; -webkit-backface-visibility:hidden; min-width:0; }
    @keyframes _stagger { from{opacity:0;transform:translateY(9px)} to{opacity:1;transform:none} }
    .stg > * { animation:_stagger .34s cubic-bezier(.2,0,0,1) both }
    .stg > *:nth-child(1){animation-delay:.02s} .stg > *:nth-child(2){animation-delay:.06s}
    .stg > *:nth-child(3){animation-delay:.1s}  .stg > *:nth-child(4){animation-delay:.14s}
    .stg > *:nth-child(5){animation-delay:.18s} .stg > *:nth-child(6){animation-delay:.22s}
    .ho{transition:all .18s cubic-bezier(.2,0,0,1);cursor:pointer;}
    .ho:hover{background:${theme.s3}!important;border-color:${theme.b2}!important;}
    ::-webkit-scrollbar{width:2px}
    ::-webkit-scrollbar-track{background:transparent}
    ::-webkit-scrollbar-thumb{background:${theme.b2};border-radius:1px}
    ::selection{background:${theme.accSub};}
  `}</style>;
};

const glass = (th, op=0.06, bl=32) => th.id==="light" ? ({
  background: `rgba(255,255,255,${Math.min(1, 0.72 + op*3)})`,
  backdropFilter: `blur(${bl}px) saturate(1.4)`,
  WebkitBackdropFilter: `blur(${bl}px) saturate(1.4)`,
  border: `1px solid ${th.b1}`,
  boxShadow: `0 1px 2px rgba(16,19,26,0.04), 0 6px 20px rgba(16,19,26,0.06)`,
}) : ({
  background: th.id==="stitch" ? `rgba(100,160,255,${op*0.6})` : `rgba(255,255,255,${op})`,
  backdropFilter: `blur(${bl}px) saturate(1.7)`,
  WebkitBackdropFilter: `blur(${bl}px) saturate(1.7)`,
  border: `1px solid ${th.b1}`,
  boxShadow: `inset 0 1px 0 ${th.b2}, 0 4px 20px rgba(0,0,0,0.4)`,
});

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
  return <button onClick={disabled?undefined:(e)=>{hap.tap();onClick?.(e);}} onMouseEnter={()=>sH(true)} onMouseLeave={()=>sH(false)}
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

const Modal = ({ children, onClose }) => {
  const th = useTheme();
  return <div className="f" onClick={onClose} style={{ position:"fixed",inset:0,zIndex:9999,background: th.id==="light" ? "rgba(30,34,44,0.4)" : "rgba(0,0,0,0.72)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",display:"flex",alignItems:"center",justifyContent:"center",padding:16 }}>
    <div className="grow" onClick={e=>e.stopPropagation()} style={{ ...glass(th,0.07,48),borderRadius:20,width:"100%",maxWidth:380,boxShadow:"0 32px 80px rgba(0,0,0,0.8)", ...growVars() }}>
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
    <button onClick={onClose} style={{ width:26,height:26,borderRadius:7,background:th.s1,border:`1px solid ${th.b1}`,color:th.t3,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}><Ic.X/></button>
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
  return (
    <div className="f" onClick={onClose} style={{ position:"fixed",inset:0,zIndex:9999,background: th.id==="light" ? "rgba(30,34,44,0.35)" : "rgba(0,0,0,0.6)",backdropFilter:"blur(10px)",WebkitBackdropFilter:"blur(10px)",display:"flex",alignItems:"flex-end",justifyContent:"center" }}>
      <div className="sh" onClick={e=>e.stopPropagation()} style={{
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
const LANGS = [
  { id:"uz", flag:"🇺🇿", label:"O'zbek"  },
  { id:"ru", flag:"🇷🇺", label:"Русский" },
  { id:"en", flag:"🇬🇧", label:"English" },
];

const ProfilePage = ({ themeId, setThemeId }) => {
  const th = useTheme();
  const [view,sView] = useState("main");
  const [sheet,sS] = useState(null);
  const [lang,sL]  = useState("uz");
  const [copied,sC]= useState(false);

  const tg   = typeof window!=="undefined" ? window.Telegram?.WebApp : null;
  const me   = tg?.initDataUnsafe?.user;
  const name = me ? [me.first_name, me.last_name].filter(Boolean).join(" ") : "Mehmon";
  const uid  = me?.id ? String(me.id) : "—";

  const copyId = () => {
    if (!me?.id) return;
    navigator.clipboard?.writeText(uid);
    sC(true); setTimeout(()=>sC(false),1500);
  };

  const langLabel = LANGS.find(l=>l.id===lang)?.label;

  if (view === "settings")
    return <SettingsPage onBack={()=>sView("main")} themeId={themeId} setThemeId={setThemeId}/>;

  if (view === "app")
    return (
      <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
        <button onClick={()=>sView("main")} aria-label="Orqaga" style={{
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
        <Row icon={<Ic.Cog s={19} c={th.t2}/>} title="Sozlamalar" sub="Limitlar, xavfsizlik, bildirishnoma"
             onClick={()=>sView("settings")}/>
        <Row icon={<Ic.Send s={19} c={th.t2}/>} title="Ilova" sub="SMS ulagich — bank kodlarini avtomatlashtiradi"
             onClick={()=>sView("app")}/>
        <Row icon={<Ic.Globe s={19} c={th.t2}/>} title="Ilova tili" sub={langLabel} onClick={e=>{markOrigin(e);sS("lang");}}/>
        <Row icon={<Ic.Help  s={19} c={th.t2}/>} title="Qo'llab-quvvatlash" onClick={e=>{markOrigin(e);sS("help");}}/>
        <Row icon={<Ic.Info  s={19} c={th.t2}/>} title="Ilova haqida" onClick={e=>{markOrigin(e);sS("about");}}/>
        <Row icon={<Ic.Theme s={19} c={th.t2}/>} title="Mavzuni o'zgartirish"
             sub={{amoled:"Qora",stitch:"To'q ko'k",light:"Yorug'"}[themeId]} onClick={e=>{markOrigin(e);sS("theme");}}/>
      </div>

      {/* ── Til ── */}
      {sheet==="lang" && (
        <Sheet title="Ilova tili" onClose={()=>sS(null)}>
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
        <Sheet title="Mavzuni tanlang" onClose={()=>sS(null)}>
          <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
            {[
              { id:"amoled", label:"Qora",      note:"AMOLED ekran uchun",  swatch:"#000000", ring:"rgba(255,255,255,0.16)" },
              { id:"stitch", label:"To'q ko'k", note:"Yumshoq to'q fon",    swatch:"#0b1730", ring:"rgba(120,170,255,0.3)" },
              { id:"light",  label:"Yorug'",    note:"Kunduzi qulay",       swatch:"#F4F5F7", ring:"rgba(16,19,26,0.14)" },
            ].map(t=>{
              const on = themeId===t.id;
              return (
                <button key={t.id} onClick={()=>{ hap.select(); setThemeId(t.id); sS(null); }} style={{
                  display:"flex",alignItems:"center",gap:12,padding:"13px 15px",borderRadius:14,cursor:"pointer",
                  background: on ? th.accSub : th.s1,
                  border:`1px solid ${on ? th.accBd : th.b1}`,
                  fontFamily:"inherit",transition:"all .15s",
                }}>
                  <span style={{ width:34,height:34,borderRadius:11,flexShrink:0,background:t.swatch,border:`1.5px solid ${t.ring}`,boxShadow:"inset 0 1px 0 rgba(255,255,255,0.08)" }}/>
                  <span style={{ flex:1,textAlign:"left" }}>
                    <span style={{ display:"block",fontSize:15,fontWeight:on?600:500,color:on?th.acc:th.t1 }}>{t.label}</span>
                    <span style={{ display:"block",fontSize:12,color:th.t3,marginTop:1 }}>{t.note}</span>
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
        <Sheet title="Qo'llab-quvvatlash"
          icon={<Ic.Help s={26} c={th.t2}/>}
          onClose={()=>sS(null)}>
          <p style={{ textAlign:"center",fontSize:13,color:th.t3,marginTop:-8,marginBottom:16,lineHeight:1.55 }}>
            Savol yoki muammo bo'lsa yozing — kunning istalgan vaqtida javob beramiz.
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
        <Sheet title="PremoLux" icon={<Ic.Info s={26} c={th.t2}/>} onClose={()=>sS(null)}>
          <p style={{ textAlign:"center",fontSize:13.5,color:th.t2,lineHeight:1.65,marginTop:-8,marginBottom:18 }}>
            Telegram Premium buyurtmalarini avtomatik bajaruvchi boshqaruv paneli.
          </p>
          <div style={{ display:"flex",flexDirection:"column",gap:1,borderRadius:14,overflow:"hidden",border:`1px solid ${th.b1}` }}>
            {[["Versiya","1.0.0"],["Kanal","@PremoLux"],["Yangilangan","Avgust 2026"]].map(([k,v])=>(
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

const API_BASE = "https://premolux-beckend.onrender.com";
const MOCK = false;                // backend ulandi

class ApiError extends Error {
  constructor(status, code, message) {
    super(message || code || "Xatolik yuz berdi");
    this.status = status; this.code = code;
  }
}

// Telegram initData — har so'rovga qo'shiladi, server shu bilan foydalanuvchini tekshiradi
const authHeader = () => {
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

const request = async (path, { method="GET", body, timeout=25000 } = {}) => {
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
    try { data = await res.json(); } catch {}

    if (!res.ok) {
      throw new ApiError(res.status, data?.code, data?.message || `Server xatosi (${res.status})`);
    }
    return data;
  } catch (e) {
    clearTimeout(t);
    if (e.name === "AbortError") throw new ApiError(0, "TIMEOUT", "Kutish vaqti tugadi");
    if (e instanceof ApiError) throw e;
    throw new ApiError(0, "NETWORK", "Tarmoqqa ulanib bo'lmadi");
  }
};

const api = {
  get:  (p)      => request(p),
  post: (p, b)   => request(p, { method:"POST",  body:b }),
  put:  (p, b)   => request(p, { method:"PUT",   body:b }),
  del:  (p)      => request(p, { method:"DELETE" }),
};

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
let HAPTIC_ON = true;
const setHaptic = v => { HAPTIC_ON = v; };

const hap = (() => {
  const H = () => window.Telegram?.WebApp?.HapticFeedback;
  const safe = fn => { if (!HAPTIC_ON) return; try { fn(); } catch {} };
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

const Toast = ({ t, onKill }) => {
  const th = useTheme();
  const [out,sOut] = useState(false);
  const TONE = { ok:th.ok, err:th.err, warn:th.warn, info:th.acc };
  const c = TONE[t.kind] || th.acc;
  const Ico = TOAST_ICON[t.kind] || TOAST_ICON.info;

  useEffect(()=>{
    const a = setTimeout(()=>sOut(true), t.ms - 260);
    const b = setTimeout(()=>onKill(t.id), t.ms);
    return ()=>{ clearTimeout(a); clearTimeout(b); };
  },[]);

  return (
    <div className={out?"toastOut":"toastIn"}
      onClick={()=>{ sOut(true); setTimeout(()=>onKill(t.id),240); }}
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
        <span style={{ display:"block", fontSize:13.5, fontWeight:600, color:th.t1, letterSpacing:"-0.01em" }}>{t.title}</span>
        {t.note && <span style={{ display:"block", fontSize:11.5, color:th.t3, marginTop:1.5 }}>{t.note}</span>}
      </span>

      <span className="tBar" style={{
        position:"absolute", left:0, right:0, bottom:0, height:2,
        background:`linear-gradient(90deg, ${c}, ${c}55)`,
        animationDuration:`${t.ms}ms`,
      }}/>
    </div>
  );
};

const ToastHost = ({ list, onKill }) => (
  <div style={{
    position:"fixed", top:"calc(12px + env(safe-area-inset-top,0px))", left:0, right:0, zIndex:9500,
    display:"flex", flexDirection:"column", alignItems:"center", gap:8,
    padding:"0 16px", pointerEvents:"none",
  }}>
    {list.map(t=><Toast key={t.id} t={t} onKill={onKill}/>)}
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
          {online ? "Qayta ulandi" : "Internet aloqasi yo'q"}
        </span>
      </div>
    </div>
  );
};

// so'rov xatosini chiroyli ko'rsatish
const ErrorState = ({ err, onRetry }) => {
  const th = useTheme();
  const [busy, sBusy] = useState(false);
  const msg = err instanceof Error ? err.message : "Nomalum xatolik";
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
        {isNet ? "Ulanib bo'lmadi" : "Xatolik yuz berdi"}
      </p>
      <p style={{ fontSize:12.5, color:th.t3, marginTop:6, lineHeight:1.5, maxWidth:260 }}>{msg}</p>
      {onRetry && (
        <span style={{ marginTop:16 }}>
          <Btn v="outline" sz="sm" onClick={retry} disabled={busy}>
            {busy ? <><Ic.Spin s={12} c={th.t1}/>Qayta urinilmoqda</> : "Qayta urinish"}
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
const SwipeRow = ({ children, onDelete, label="O'chirish", disabled }) => {
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
        }}>Qo'yib yuboring</span>

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
    const b = setTimeout(()=>{ sOut(true); setTimeout(onClose, 320); }, 3600);
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
        Barcha oqimlar muvaffaqiyatli yakunlandi
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
const LANE_STEPS = [
  { key:"num",   label:"Raqam",   note:"/GetNumber yuborildi" },
  { key:"code",  label:"Kod",     note:"Get code bosildi" },
  { key:"login", label:"Login",   note:"Hisobga kirildi" },
  { key:"card",  label:"Karta",   note:"Forma to'ldirilmoqda" },
  { key:"done",  label:"Premium", note:"Faollashtirildi" },
];

const rnd = (a,b) => a + Math.random()*(b-a);
const fakeNum = () => "+9989" + Math.floor(10000000 + Math.random()*89999999);

const Lane = ({ lane }) => {
  const th = useTheme();
  const b  = gB(lane.bankId);
  const at = lane.step;
  const done = at >= LANE_STEPS.length;
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
        {LANE_STEPS.map((st,i)=>{
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
        {bad ? "Karta rad etildi" : done ? "Premium faollashtirildi" : LANE_STEPS[at]?.note}
      </p>
    </div>
  );
};

const PremiumPage = ({ goto }) => {
  const th = useTheme();
  const toast = useToast();
  const { account, bots, people, setPeople, role, bump } = useData();

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
  const groups = p => [...new Set(p?.cards.map(nameOf)||[])].map(name=>({
    name, id: BL.find(b=>b.name===name)?.id || name,
    cards: p.cards.filter(c=>nameOf(c)===name && cardHealth(c).left>0 && cardHealth(c).state!=="expired"),
  })).filter(g=>g.cards.length>0);

  const avail = who ? groups(who) : [];
  const max   = avail.length;
  const n     = Math.min(parseInt(want||"0",10)||0, max);
  const chosen= avail.slice(0, n);

  const setQty = v => {
    const q = v.replace(/\D/g,"").slice(0,2);
    sWant(q);
    const num = parseInt(q||"0",10);
    if (num > max) { hap.warn(); sWarn(`Sizda ${max} tagacha mumkin`); } else sWarn("");
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

  const startPolling = (orderId, L, pid2) => {
    let cancelled = false;
    const poll = async () => {
      if (cancelled) return;
      try {
        const data = await api.get(`/orders/${orderId}`);

        sLanes(prev => prev.map((l, idx) => {
          const remote = data?.lanes?.[idx];
          if (!remote) return l;
          const failed = ["failed","login_failed","waiting_stuck"].includes(remote.status);
          return {
            ...l,
            num: remote.phoneNumber || l.num,
            step: STATUS_STEP[remote.status] ?? l.step,
            failed,
          };
        }));

        const allDone = (data?.lanes || []).every(l =>
          ["confirmed","failed","login_failed","waiting_stuck"].includes(l.status)
        );

        if (allDone && data?.lanes?.length) {
          data.lanes.forEach((remote, idx) => {
            if (remote.status === "confirmed") {
              hap.ok(); bump?.();
              const cid = L[idx]?.cardId;
              if (cid) {
                setPeople(list => list.map(pr => pr.id===pid2 ? {
                  ...pr, cards: pr.cards.map(cd => cd.id===cid ? { ...cd, used:(cd.used||0)+1 } : cd)
                } : pr));
              }
            }
          });
          // MUHIM: buyurtma tugadi — saqlangan "faol buyurtma"ni tozalaymiz
          try { localStorage.removeItem("premolux_active_order"); } catch {}
          return;
        }
      } catch {}
      if (!cancelled) setTimeout(poll, 1500);
    };
    poll();
    return () => { cancelled = true; };
  };

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
    startPolling(saved.orderId, saved.lanes, saved.personId);
  }, []);

  const launch = async () => {
    sLaunchErr(null);
    let orderId;
    try {
      const res = await api.post("/orders/start", {
        personId: who?.id,
        banks: chosen.map(g=>({ bankId:g.id, cardId: picks[g.id] || g.cards[0].id })),
      });
      orderId = res?.orderId;
    } catch (e) {
      hap.err(); sLaunchErr(e.message); toast({kind:"err",title:"Ishga tushmadi",note:e.message});
      return;
    }

    const pid2 = who?.id;
    const L = chosen.map((g,i)=>{
      const cd = g.cards.find(c=>c.id===picks[g.id]) || g.cards[0];
      return { key:i, bankId:g.id, cardId:cd.id,
        card: cd.num.replace(/\s/g,"").slice(-4),
        step:0, num:"", code:"", failed:false };
    });
    sLanes(L);
    sStep(4);
    hap.heavy();
    toast({kind:"info",title:`${L.length} oqim ishga tushdi`,note:who?.name,ms:3200});

    if (!orderId) return;

    // MUHIM: buyurtmani localStorage'ga saqlaymiz — boshqa sahifaga
    // o'tib qaytilsa yoki sahifa yangilansa ham jarayon YO'QOLMAYDI
    try {
      localStorage.setItem("premolux_active_order", JSON.stringify({
        orderId, personId: pid2, lanes: L,
      }));
    } catch {}

    startPolling(orderId, L, pid2);
  };

  const reset = () => {
    sStep(1); sPid(null); sWant(""); sWarn(""); sPicks({}); sLanes([]);
    try { localStorage.removeItem("premolux_active_order"); } catch {}
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
          title: `${okCount}/${lanes.length} premium olindi`,
          note: `${lanes.length-okCount} ta karta rad etildi`, ms:3400 });
      }
    }
    if (!finished) told.current = false;
  }, [finished]);

  if (!ready) return (
    <div style={{ display:"flex", flexDirection:"column", gap:18, maxWidth:680 }}>
      <div>
        <h1 style={{ fontSize:24, fontWeight:800, letterSpacing:"-0.03em", lineHeight:1.1 }}>Premium olish</h1>
        <p style={{ fontSize:13, color:th.t3, marginTop:3 }}>Ishga tushirishdan oldin tizim sozlanishi kerak</p>
      </div>
      <div style={{ ...glass(th,0.04), borderRadius:16, padding:"20px 18px", display:"flex", flexDirection:"column", gap:14 }}>
        <span style={{ width:46, height:46, borderRadius:14, background:`${th.warn}1a`,
          border:`1px solid ${th.warn}38`, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <Ic.Lock s={20} c={th.warn}/>
        </span>
        <div>
          <p style={{ fontWeight:700, fontSize:15.5, letterSpacing:"-0.02em" }}>Tizim tayyor emas</p>
          <p style={{ fontSize:13, color:th.t3, marginTop:4, lineHeight:1.55 }}>Quyidagilar ulanmaguncha buyurtma boshlanmaydi.</p>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {[
            { ok: !!account,      label:"Dostup hisob",       note: account || "ulanmagan" },
            { ok: wired.length>0, label:"Raqam beruvchi bot", note: wired.length ? wired.map(b=>b.username).join(", ") : "ulanmagan" },
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
        <Btn full sz="lg" onClick={()=>goto("bots")}>Botlar bo'limiga o'tish</Btn>
      </div>
    </div>
  );

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:18, maxWidth:680 }}>
      {gala>0 && <Gala total={gala} onClose={()=>sGala(0)}/>}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:800, letterSpacing:"-0.03em", lineHeight:1.1 }}>Premium olish</h1>
          <p style={{ fontSize:13, color:th.t3, marginTop:3 }}>
            {step===1 ? "Kartalar egasini tanlang"
             : step===2 ? "Bir vaqtda nechta bankdan olinsin?"
             : step===3 ? "Har bank uchun kartani belgilang"
             : "Oqimlar bir vaqtda ishlamoqda"}
          </p>
        </div>
        {step>1 && step<4 && <Btn v="ghost" sz="sm" onClick={()=>sStep(step-1)}>Orqaga</Btn>}
        {step===4 && finished && <Btn v="ghost" sz="sm" onClick={reset}>Yangi</Btn>}
      </div>

      {isWorker && step===1 && (
        <div style={{ display:"flex", alignItems:"center", gap:9, padding:"10px 13px", borderRadius:11,
          background:th.s1, border:`1px solid ${th.b1}` }}>
          <Ic.Info s={14} c={th.t3}/>
          <span style={{ fontSize:12, color:th.t3 }}>Yuqoridagi hisob va bot orqali ishlaysiz</span>
        </div>
      )}

      <div style={{ display:"flex", alignItems:"center" }}>
        {["Shaxs","Miqdor","Kartalar","Ishga tushdi"].map((lb,i)=>{
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
              title="Tayyor karta yo'q"
              note="Premium olish uchun kamida bitta shaxsda bo'sh limitli karta bo'lishi kerak."
              action="Kartalarga o'tish"
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
                    {empty ? "Bo'sh karta yo'q" : `${gs.length} bank · ${gs.reduce((a,g)=>a+g.cards.length,0)} karta`}
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
            {n>0 ? `${n} ta bank — kartalarni tanlash` : "Miqdorni kiriting"}
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
                      {g.cards.length>1 ? `${g.cards.length} karta — birini tanlang` : "1 karta"}
                    </p>
                  </div>
                  {g.cards.length===1 && (
                    <span style={{ fontFamily:"'SF Mono',monospace", fontSize:12, color:th.acc }}>
                      •••• {g.cards[0].num.replace(/\s/g,"").slice(-4)}
                    </span>
                  )}
                </div>

                {g.cards.length>1 && (
                  <div style={{ display:"flex", gap:7, flexWrap:"wrap" }}>
                    {g.cards.map(c=>{
                      const on = picks[g.id]===c.id;
                      const t4 = c.num.replace(/\s/g,"").slice(-4);
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
                {finished ? `${okCount}/${lanes.length} premium olindi` : `${lanes.length} oqim ishlamoqda`}
              </p>
              <p style={{ fontSize:12, color:th.t3, marginTop:2 }}>
                {finished ? "Barcha oqimlar tugadi" : `${who?.name} · bir vaqtda`}
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
const CH = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
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
          {c.kind==="partner" ? "Hamkor kodi" : "Ishchi kodi"}
        </span>
        <span style={{ flex:1 }}/>
        {used
          ? <Tag>Ishlatilgan</Tag>
          : <Tag v="acc">Bir martalik</Tag>}
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
          {used ? `${c.usedBy} ishlatdi` : "Nusxalab yuboring"}
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
            {hit ? <><Ic.Check s={12} c={th.ok}/>Nusxalandi</> : <><Ic.Copy s={12} c={th.accTxt}/>Nusxalash</>}
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
          {owner ? `${owner} · ` : ""}{w.online ? "Faol" : w.last}
        </p>
      </div>

      <Spark data={w.week} color={th.acc} track={th.b2}/>

      <div style={{ textAlign:"right", flexShrink:0, minWidth:40 }}>
        <p style={{ fontSize:19, fontWeight:800, fontFamily:"'SF Mono',monospace", letterSpacing:"-0.02em" }}>
          <Count value={w.today}/>
        </p>
        <p style={{ fontSize:9, color:th.t3, letterSpacing:"0.08em", textTransform:"uppercase" }}>bugun</p>
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
          <p style={{ fontSize:9, color:th.t3, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:4 }}>Balans</p>
          <p style={{ fontSize:20, fontWeight:800, fontFamily:"'SF Mono',monospace", letterSpacing:"-0.03em" }}>
            <Count value={num}/><span style={{ fontSize:11, fontWeight:500, color:th.t3, marginLeft:4 }}>so'm</span>
          </p>
        </div>
        <div style={{ textAlign:"right" }}>
          <p style={{ fontSize:11.5, color:th.t2, fontFamily:"'SF Mono',monospace" }}>{p.orders} buyurtma</p>
          <p style={{ fontSize:11, color:th.t3, marginTop:2 }}>{mine.length} ishchi</p>
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
const som = n => (n||0).toLocaleString("ru-RU");

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
          {open ? "To'lov oynasi ochiq" : "To'lov oynasi yopiq"}
        </span>
        <span style={{ fontFamily:"'SF Mono','Fira Code',monospace", fontSize:13, fontWeight:700,
          color: open ? th.warn : th.t2, fontVariantNumeric:"tabular-nums" }}>
          {hh}:{mm}<span style={{ opacity:.45 }}>:{ss}</span>
        </span>
      </div>

      <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", gap:12, marginBottom:14 }}>
        <div>
          <p style={{ fontSize:9.5, color:th.t3, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:5 }}>Bugun jami</p>
          <p style={{ fontSize:27, fontWeight:800, fontFamily:"'SF Mono',monospace", letterSpacing:"-0.03em", lineHeight:1 }}>
            <Count value={due}/><span style={{ fontSize:12, fontWeight:500, color:th.t3, marginLeft:5 }}>so'm</span>
          </p>
        </div>
        <div style={{ textAlign:"right" }}>
          <p style={{ fontSize:12, color:th.t2, fontFamily:"'SF Mono',monospace" }}>{cnt} premium</p>
          <p style={{ fontSize:11, color:th.t3, marginTop:3 }}>{partners.length} hamkor</p>
        </div>
      </div>

      <p style={{ fontSize:11, color:th.t3, marginBottom:11, lineHeight:1.5 }}>
        {open
          ? "To'lov qabul qilingach sanoq nolga tushadi va yangi kun boshlanadi."
          : `Oyna ${PAY_FROM}:00 da ochiladi — ${left()} qoldi. Zarur bo'lsa hozir ham yopish mumkin.`}
      </p>

      <HoldBtn tone={open ? th.warn : th.t3}
        label={due ? `Bosib turing — ${som(due)} so'm qabul qilindi` : "Yopish uchun hisob yo'q"}
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
                textTransform:"uppercase", marginBottom:5 }}>1 premium narxi</p>
              <p style={{ fontSize:22, fontWeight:800, fontFamily:"'SF Mono',monospace",
                letterSpacing:"-0.03em", color:th.acc }}>
                {som(p.price)}<span style={{ fontSize:11, fontWeight:500, color:th.t3, marginLeft:4 }}>so'm</span>
              </p>
            </div>
            {!edit && (
              <Btn v="ghost" sz="sm" onClick={()=>{ sVal(String(p.price||0)); sEdit(true); }}>O'zgartirish</Btn>
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
                <Btn v="ghost" onClick={()=>sEdit(false)}>Bekor</Btn>
                <Btn onClick={save}><Ic.Check s={13} c={th.accTxt}/>Saqlash</Btn>
              </div>
            </div>
          )}
        </div>

        {/* ── BUGUNGI HISOB ── */}
        <div style={{ padding:"14px 15px", borderRadius:15, background:th.s1,
          border:`1px solid ${due ? th.warn+"3d" : th.b1}` }}>
          <p style={{ fontSize:9.5, fontWeight:700, color:th.t3, letterSpacing:"0.12em",
            textTransform:"uppercase", marginBottom:11 }}>Bugungi hisob</p>

          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
            <span style={{ fontFamily:"'SF Mono',monospace", fontSize:15, fontWeight:700, color:th.t1 }}>{cnt}</span>
            <span style={{ fontSize:12, color:th.t3 }}>×</span>
            <span style={{ fontFamily:"'SF Mono',monospace", fontSize:15, fontWeight:700, color:th.t2 }}>{som(p.price)}</span>
            <span style={{ flex:1, height:1, background:th.b1 }}/>
            <span style={{ fontFamily:"'SF Mono',monospace", fontSize:19, fontWeight:800,
              color: due ? th.warn : th.t3, letterSpacing:"-0.02em" }}>{som(due)}</span>
          </div>

          <HoldBtn tone={th.warn}
            label={due ? `Bosib turing — ${som(due)} qabul qilindi` : "Hisob yo'q"}
            done={()=>{ if(due){ onSettle(p.id); onClose(); } }}/>
        </div>

        {/* ── KO'RSATKICHLAR ── */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
          <StatCard label="Bugun"    value={String(cnt)} color={th.acc}/>
          <StatCard label="Ishchi"   value={`${online}/${mine.length}`} color={online?th.ok:th.t3}/>
          <StatCard label="Ulush"    value={`${p.share}%`}/>
        </div>

        {/* ── 7 KUN ── */}
        <div style={{ padding:"14px 15px", borderRadius:14, background:th.s1, border:`1px solid ${th.b1}` }}>
          <p style={{ fontSize:9.5, fontWeight:700, color:th.t3, letterSpacing:"0.12em",
            textTransform:"uppercase", marginBottom:12 }}>Oxirgi 7 kun</p>
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
            textTransform:"uppercase", marginBottom:9 }}>Ishchilari</p>
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
            {!mine.length && <p style={{ fontSize:12, color:th.t3, textAlign:"center", padding:"14px 0" }}>Ishchi yo'q</p>}
          </div>
        </div>

        {/* ── TO'LOV TARIXI ── */}
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:9 }}>
            <p style={{ flex:1, fontSize:9.5, fontWeight:700, color:th.t3, letterSpacing:"0.12em",
              textTransform:"uppercase" }}>To'lov tarixi</p>
            <span style={{ fontSize:11, color:th.t3, fontFamily:"'SF Mono',monospace" }}>
              jami {som(p.paid)}
            </span>
          </div>
          <div style={{ borderRadius:13, overflow:"hidden", border:`1px solid ${th.b1}` }}>
            {(p.history||[]).map((h,i,arr)=>(
              <div key={i} style={{ display:"flex", alignItems:"center", gap:10,
                padding:"11px 13px", background:th.s1,
                borderBottom: i<arr.length-1 ? `1px solid ${th.b1}` : "none" }}>
                <span style={{ fontFamily:"'SF Mono',monospace", fontSize:12, color:th.t3, width:44 }}>{h.d}</span>
                <span style={{ flex:1, fontSize:12, color:th.t2 }}>{h.n} premium</span>
                <span style={{ fontFamily:"'SF Mono',monospace", fontSize:13, fontWeight:700, color:th.ok }}>
                  {som(h.s)}
                </span>
              </div>
            ))}
            {!(p.history||[]).length && (
              <p style={{ fontSize:12, color:th.t3, textAlign:"center", padding:"16px 0", background:th.s1 }}>
                Hali to'lov bo'lmagan
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
  const { role, partners, setPartners, workers, setWorkers, codes, setCodes } = useData();
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
    toast({ kind:"ok", title:"Kod yaratildi", note:"Nusxalab yuboring", ms:2600 });
  };
  const drop = code => { setCodes(l=>l.filter(c=>c.code!==code)); hap.warn(); toast({kind:"warn",title:"Kod o'chirildi"}); };

  const parentName = id => id==="owner" ? "Siz" : id==="me" ? "Siz" : (partners.find(p=>p.id===id)?.name || "—");

  const cntAll = partners.reduce((a,p)=>a + cntOf(p, workers), 0);

  const setPrice = (pid, price) => {
    setPartners(l=>l.map(x=>x.id===pid?{...x, price}:x));
    toast({kind:"ok",title:"Narx saqlandi",note:`${som(price)} so'm / premium`});
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
    toast({ kind:"ok", title:`${som(sum)} so'm qabul qilindi`,
      note:`${cnt} premium · ${list.length} hamkor · yangi kun boshlandi`, ms:3600 });
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:18, maxWidth:680 }}>
      {open && <PartnerSheet p={partners.find(x=>x.id===open.id) || open} workers={workers}
        onPrice={setPrice} onSettle={id=>settle([id])} onClose={()=>sOpen(null)}/>}

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:800, letterSpacing:"-0.03em", lineHeight:1.1 }}>Jamoa</h1>
          <p style={{ fontSize:13, color:th.t3, marginTop:3 }}>
            {isOwner ? "Taklif kodi orqali qo'shiladi" : "O'z ishchilaringiz"}
          </p>
        </div>
        <Btn sz="sm" onClick={gen}><Ic.Plus s={13} c={th.accTxt}/>Kod</Btn>
      </div>

      {isOwner && (
        <div style={{ display:"flex", gap:4, padding:4, borderRadius:14, background:th.s1, border:`1px solid ${th.b1}` }}>
          {[{id:"partners",label:"Hamkorlar",n:partners.length},{id:"workers",label:"Ishchilar",n:workers.length}].map(x=>{
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
          <StatCard label="Hamkor" value={String(partners.length)}/>
          <StatCard label="Bugun"  value={String(pToday)} color={th.acc}/>
          <StatCard label="Kodlar" value={String(myCodes.length)}/>
        </div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:9 }}>
          <StatCard label="Faol"   value={`${online}/${myWorkers.length}`} color={online?th.ok:th.t3}/>
          <StatCard label="Bugun"  value={String(today)} color={th.acc}/>
          <StatCard label="Kodlar" value={String(myCodes.length)}/>
        </div>
      )}

      {/* faol kodlar */}
      {myCodes.length > 0 && (
        <div>
          <Lbl>Faol taklif kodlari</Lbl>
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
          {partners.length>0 && <Lbl>Hamkorlar</Lbl>}
          {partners.map(p=>{
            const mine = workers.filter(w=>w.parent===p.id);
            const tot  = p.today + mine.reduce((a,w)=>a+w.today,0);
            return (
              <div key={p.id} data-item>
                <SwipeRow label="Hamkor" onDelete={()=>{const el=document.querySelector(`[data-partner="${p.id}"]`);toss(el,()=>{setPartners(l=>l.filter(x=>x.id!==p.id)); setWorkers(l=>l.filter(w=>w.parent!==p.id)); toast({kind:"ok",title:"Hamkor o'chirildi",note:p.name});});}}>
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
                      <p style={{ fontSize:10.5, color:th.t4, marginTop:3 }}>{mine.length} ishchi</p>
                    </div>
                    <div style={{ textAlign:"right", flexShrink:0 }}>
                      <p style={{ fontSize:20, fontWeight:800, fontFamily:"'SF Mono',monospace", letterSpacing:"-0.02em" }}>
                        <Count value={tot}/>
                      </p>
                      <p style={{ fontSize:9, color:th.t3, letterSpacing:"0.08em", textTransform:"uppercase" }}>bugun</p>
                    </div>
                    <Ic.Right s={13} c={th.t3}/>
                  </div>
                </SwipeRow>
              </div>
            );
          })}
          {!partners.length && !myCodes.length && (
            <Empty art="folder" title="Hamkor yo'q"
              note="Taklif kodi yaratib tanishingizga yuboring. Kod kiritgan odam hamkor bo'ladi."
              action="Kod yaratish" onAction={gen}/>
          )}
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
          {myWorkers.length>0 && <Lbl>Ishchilar</Lbl>}
          {myWorkers.map(w=>(
            <div key={w.id} data-item>
              <SwipeRow label="Ishchi" onDelete={()=>{const el=document.querySelector(`[data-worker="${w.id}"]`);toss(el,()=>{setWorkers(l=>l.filter(x=>x.id!==w.id)); toast({kind:"ok",title:"Ishchi o'chirildi",note:w.name});});}}>
                <WorkerRow w={w} owner={isOwner ? parentName(w.parent) : null}/>
              </SwipeRow>
            </div>
          ))}
          {!myWorkers.length && !myCodes.length && (
            <Empty art="folder" title="Ishchi yo'q"
              note="Kod yaratib bering — kod kiritgan odam ishchi bo'ladi va sizning botingiz orqali ishlaydi."
              action="Kod yaratish" onAction={gen}/>
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

  const label = phase==="idle" ? "Yuklab olish"
              : phase==="chute" ? "Boshlanmoqda"
              : phase==="down"  ? `${Math.round(prog*100)}%`
              : phase==="land"  ? "Qo'nmoqda"
              : "Tayyor";

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20, maxWidth:520, margin:"0 auto" }}>

      <div style={{ textAlign:"center", paddingTop:6 }}>
        <span style={{ width:52, height:52, borderRadius:16, margin:"0 auto 14px",
          display:"flex", alignItems:"center", justifyContent:"center",
          background:th.accSub, border:`1px solid ${th.accBd}` }}>
          <Ic.Send s={22} c={th.acc}/>
        </span>
        <h1 style={{ fontSize:22, fontWeight:800, letterSpacing:"-0.03em" }}>SMS ulagich</h1>
        <p style={{ fontSize:13, color:th.t3, marginTop:6, lineHeight:1.55, maxWidth:290, margin:"6px auto 0" }}>
          Bank yuborgan tasdiqlash kodini avtomatik ilib, PremoLux ga yetkazadi — hech narsa yozib o'tirish shart emas.
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
            <a href={CHUTE_URL} download style={{ textDecoration:"none" }}>
              <Btn v="ghost" sz="sm">Qayta yuklash</Btn>
            </a>
          </span>
        )}
      </div>

      {/* ── o'rnatish qadamlari ── */}
      <div>
        <p style={{ fontSize:10, fontWeight:700, color:th.t3, letterSpacing:"0.13em",
          textTransform:"uppercase", marginBottom:10, paddingLeft:3 }}>O'rnatish</p>
        <div style={{ ...glass(th,0.04), borderRadius:16, overflow:"hidden" }}>
          {[
            ["APK faylni oching","Yuklab olingan faylga bosing"],
            ["Noma'lum manbadan o'rnatishga ruxsat bering","Bir martalik tizim so'rovi"],
            ["SMS ruxsatini tasdiqlang","Faqat bank xabarlarini o'qiydi"],
            ["Tayyor","Ilova fonda ishlaydi, hech narsa ko'rsatmaydi"],
          ].map(([t,d],i,arr)=>(
            <div key={i} style={{ display:"flex", gap:12, padding:"12px 14px",
              borderBottom: i<arr.length-1 ? `1px solid ${th.b1}` : "none" }}>
              <span style={{ width:22, height:22, borderRadius:"50%", flexShrink:0,
                background:th.s2, border:`1px solid ${th.b1}`,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:10.5, fontWeight:700, color:th.t2 }}>{i+1}</span>
              <div>
                <p style={{ fontSize:13, fontWeight:600 }}>{t}</p>
                <p style={{ fontSize:11.5, color:th.t3, marginTop:2 }}>{d}</p>
              </div>
            </div>
          ))}
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
const dayKey = (d=new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;

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
  const { hist, partners, workers, role } = useData();
  const [per,sPer] = useState("day");   // day | week | month

  const today = hist.find(x=>x.d===dayKey()) || { d:dayKey(), n:0, h:Array(24).fill(0) };
  const last  = (k) => hist.slice(-k);

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
        label:"Bugun", sub:"soat kesimida",
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
        label:"Bu hafta", sub:"7 kun",
      };
    }
    const m = last(30);
    return {
      data: m.map(x=>x.n),
      labels: m.map(x=>{ const d=new Date(x.d+"T00:00"); return String(d.getDate()); }),
      kind:"line", unit:"-kun",
      total: m.reduce((a,x)=>a+x.n,0),
      prev:  hist.slice(-60,-30).reduce((a,x)=>a+x.n,0),
      label:"Bu oy", sub:"30 kun",
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
    rows.unshift({ name:"O'z ishchilarim", value: mine });
    return rows.filter(r=>r.value>0).sort((a,b)=>b.value-a.value);
  })();
  const distTotal = dist.reduce((a,r)=>a+r.value,0);

  // eng gavjum soat
  const peakH = today.h.indexOf(Math.max(...today.h));

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:18, maxWidth:680 }}>
      <div>
        <h1 style={{ fontSize:24, fontWeight:800, letterSpacing:"-0.03em", lineHeight:1.1 }}>Hisobot</h1>
        <p style={{ fontSize:13, color:th.t3, marginTop:3 }}>Olingan premiumlar statistikasi</p>
      </div>

      {/* davr */}
      <div style={{ display:"flex", gap:4, padding:4, borderRadius:14, background:th.s1, border:`1px solid ${th.b1}` }}>
        {[{v:"day",l:"Kun"},{v:"week",l:"Hafta"},{v:"month",l:"Oy"}].map(x=>{
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
            <p style={{ fontSize:11.5, color:th.t3, marginTop:6 }}>premium olingan</p>
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
        <StatCard label={per==="day"?"Eng gavjum":"O'rtacha"}
          value={per==="day" ? `${String(peakH).padStart(2,"0")}:00` : String(avg)}/>
        <StatCard label="Eng yaxshi" value={String(best)} color={th.acc}/>
        <StatCard label="O'tgan davr" value={String(view.prev)} color={th.t2}/>
      </div>

      {/* taqsimot */}
      {dist.length > 0 && (
        <div style={{ ...glass(th,0.04), borderRadius:16, padding:"15px 16px" }}>
          <p style={{ fontSize:9.5, fontWeight:700, color:th.t3, letterSpacing:"0.13em",
            textTransform:"uppercase", marginBottom:14 }}>Kim qancha oldi</p>
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
          textTransform:"uppercase", marginBottom:13 }}>Oylar kesimida</p>
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
const NAV = [
  { id:"premium", lbl:"Premium",  I:Ic.Star },
  { id:"bots",    lbl:"Botlar",   I:Ic.Bot  },
  { id:"cards",   lbl:"Kartalar", I:Ic.Card },
  { id:"team",    lbl:"Jamoa",    I:Ic.Team },
  { id:"stats",   lbl:"Hisobot",  I:Ic.Chart },
];

const ProfileAvatar = ({ size=38, active, onClick }) => {
  const th = useTheme();
  const tg = typeof window!=="undefined" ? window.Telegram?.WebApp : null;
  const user = tg?.initDataUnsafe?.user;
  const photo = user?.photo_url;
  const name = user?.first_name || "A";
  return (
    <button onClick={onClick} aria-label="Profil" style={{
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
  const items = NAV.filter(n =>
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
      sEr(e.message || "Xatolik yuz berdi");
    } finally {
      sLd(false);
    }
  };
  const send=()=>!phone.match(/^\+\d{9,15}$/)?sEr("Format: +998901234567"):run("/auth/send-code",{phone},()=>sStep("otp"));
  const verify=()=>code.length<5?sEr("5 xonali kod kiriting"):run("/auth/verify-code",{phone,code},(res)=>{
    if (res?.needPassword) { sFa2(true); sStep("pass"); hap.warn(); }
    else { sStep("done"); onChange(phone); hap.ok(); toast({kind:"ok",title:"Hisob ulandi",note:phone}); }
  });
  const login=()=>!pass?sEr("Parol kiriting"):run("/auth/verify-2fa",{phone,pass},()=>{sStep("done");onChange(phone);hap.ok();toast({kind:"ok",title:"Hisob ulandi",note:phone});});
  const reset=()=>{sStep("phone");sPh("");sCd("");sPas("");sEr("");sFa2(false);onChange("");};

  if(step==="done") return(
    <div style={{ ...glass(th,0.05),borderRadius:13,padding:"13px 16px",display:"flex",alignItems:"center",gap:13 }}>
      <div style={{ width:38,height:38,borderRadius:10,background:"rgba(52,199,89,0.12)",border:"1px solid rgba(52,199,89,0.2)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}><Ic.Check s={16} c={th.ok}/></div>
      <div style={{ flex:1 }}>
        <p style={{ fontWeight:600,fontSize:13,fontFamily:"'SF Mono','Fira Code',monospace",letterSpacing:"0.3px" }}>{phone}</p>
        <div style={{ display:"flex",gap:5,marginTop:5 }}><Tag v="ok">Ulandi</Tag>{fa2&&<Tag v="warn">2FA</Tag>}</div>
      </div>
      <Btn v="ghost" sz="sm" onClick={reset}>Uzish</Btn>
    </div>
  );

  const STEPS=["Raqam","Kod","2FA"];
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
          <p style={{ fontSize:12,color:th.t3 }}>Telegram hisobingizga kirish kodini yuboramiz</p>
          <div style={{ display:"flex",gap:9 }}>
            <input value={phone} onChange={e=>sPh(e.target.value)} placeholder="+998 90 123 45 67" inputMode="tel" onKeyDown={e=>e.key==="Enter"&&!load&&send()} style={{ fontFamily:"'SF Mono','Fira Code',monospace",fontSize:16,letterSpacing:"0.4px" }}/>
            <Btn onClick={send} disabled={load} style={{ whiteSpace:"nowrap",minWidth:120 }}>{load?<><Ic.Spin s={12}/>Yuborilmoqda</>:"Kod yuborish"}</Btn>
          </div>
          <Err msg={err}/>
        </div>}
        {step==="otp"&&<div style={{ display:"flex",flexDirection:"column",gap:12 }}>
          <div style={{ ...glass(th,0.05),borderRadius:9,padding:"9px 13px",display:"flex",alignItems:"center",gap:8,border:"1px solid rgba(52,199,89,0.18)" }}>
            <Ic.Sig s={13} c={th.ok}/>
            <span style={{ fontSize:12,color:th.t2 }}><span style={{ fontFamily:"monospace",color:th.t1,fontWeight:600 }}>{phone}</span> ga kod yuborildi</span>
          </div>
          <div>
            <Lbl>Tasdiqlash kodi</Lbl>
            <CodeBoxes value={code} onChange={sCd} onDone={verify} autoFocus/>
            <div style={{ display:"flex",alignItems:"center",gap:9,marginTop:11 }}>
              <p style={{ flex:1,fontSize:11,color:th.t4 }}>Demo: istalgan 5 raqam</p>
              <Btn onClick={verify} disabled={load||code.length<5} style={{ whiteSpace:"nowrap",minWidth:118 }}>{load?<><Ic.Spin s={12}/>...</>:<><Ic.Check/>Tasdiqlash</>}</Btn>
            </div>
          </div>
          <Err msg={err}/>
          <div style={{ display:"flex",gap:16 }}>
            {["Qayta yuborish","Raqamni o'zgartirish"].map((t,i)=><button key={i} onClick={i===0?send:()=>{sStep("phone");sCd("");sEr("");}} style={{ background:"none",border:"none",color:th.t3,fontSize:11,cursor:"pointer",fontFamily:"inherit",textDecoration:"underline" }}>{t}</button>)}
          </div>
        </div>}
        {step==="pass"&&<div style={{ display:"flex",flexDirection:"column",gap:10 }}>
          <div style={{ ...glass(th,0.05),borderRadius:9,padding:"9px 13px",display:"flex",alignItems:"center",gap:8,border:"1px solid rgba(255,69,58,0.18)" }}>
            <Ic.Lock s={13} c={th.err}/>
            <span style={{ fontSize:12,color:th.t2 }}>Hisobda <b style={{ color:th.t1 }}>ikki bosqichli himoya</b> yoqilgan</span>
          </div>
          <div>
            <Lbl>2FA Parol</Lbl>
            <div style={{ display:"flex",gap:9 }}>
              <input type="password" value={pass} onChange={e=>sPas(e.target.value)} placeholder="Parolni kiriting" autoFocus onKeyDown={e=>e.key==="Enter"&&!load&&login()}/>
              <Btn onClick={login} disabled={load}>{load?<><Ic.Spin s={12}/>...</>:"Kirish"}</Btn>
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
    if(!inp.startsWith("@")){hap.err();sE("@ bilan boshlang");return;}
    sBusy(true); sE("");
    try {
      await api.post("/bots/connect", { slot: idx+1, username: inp, maxLogins: bot.maxLogins||15 });
      onChange({...bot,username:inp,connected:true,active:0});
      hap.ok(); toast({kind:"ok",title:"Bot ulandi",note:inp});
      sI(""); sO(false);
    } catch (e) {
      hap.err(); sE(e.message || "Ulanmadi");
    } finally { sBusy(false); }
  };
  const disc=async ()=>{
    try { await api.post(`/bots/${idx+1}/disconnect`, {}); } catch {}
    onChange({id:bot.id,username:"",connected:false,active:0,maxLogins:15,online:false});
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
            <Btn v="ghost" sz="sm" onClick={()=>onChange({...bot,online:!bot.online})}>{bot.online?"Stop":"Start"}</Btn>
            <Btn v="danger" sz="sm" onClick={disc}><Ic.Trash/></Btn>
          </div>
        </>:<>
          <span style={{ flex:1,color:th.t3,fontSize:13 }}>Bo'sh slot</span>
          <Btn v="outline" sz="sm" onClick={()=>sO(!open)}>{open?"Bekor":<><Ic.Plus/>Ulash</>}</Btn>
        </>}
      </div>
      {open&&!bot.connected&&<div style={{ padding:"11px 14px",borderTop:`1px solid ${th.b1}`,background:th.id==="light"?"rgba(16,19,26,0.03)":"rgba(0,0,0,0.2)",display:"flex",flexDirection:"column",gap:7 }}>
        <div style={{ display:"flex",gap:9 }}><input value={inp} onChange={e=>sI(e.target.value)} placeholder="@BotUsername" autoFocus onKeyDown={e=>e.key==="Enter"&&conn()}/><Btn onClick={conn} style={{ whiteSpace:"nowrap" }}>Ulash</Btn></div>
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
  const { account:acc, setAccount:sAcc, bots, setBots:sBots } = useData();
  const [saved,sSav]=useState(false);
  const conn=bots.filter(b=>b.connected); const ready=acc&&conn.length>0;
  const upB=(i,v)=>sBots(p=>{const n=[...p];n[i]=v;return n;});
  return(
    <div style={{ display:"flex",flexDirection:"column",gap:22,maxWidth:680 }}>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12 }}>
        <div><h1 style={{ fontSize:24,fontWeight:800,letterSpacing:"-0.03em",lineHeight:1.1 }}>Botlar</h1><p style={{ fontSize:13,color:th.t3,marginTop:3 }}>Dostup hisob va raqam beruvchi botlar</p></div>
        <Tag v={ready?"ok":"warn"}>{ready?"Tayyor":"Sozlash kerak"}</Tag>
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:9 }}>
        <StatCard label="Botlar"   value={`${conn.length}/3`} color={conn.length?th.acc:th.t3}/>
        <StatCard label="Kapasite" value={`${conn.reduce((s,b)=>s+b.maxLogins,0)}`}/>
        <StatCard label="Status"   value={ready?"Faol":"Nofaol"} color={ready?th.ok:th.warn}/>
      </div>
      <div>
        <Sec icon={<Ic.Lock s={14} c={th.t2}/>} label="Dostup hisob" sub="Userbot shu hisob orqali @PremiumBot ga kiradi"/>
        <LoginFlow account={acc} onChange={sAcc}/>
        {!acc&&<div style={{ ...glass(th,0.05),borderRadius:9,padding:"9px 13px",display:"flex",alignItems:"center",gap:7,marginTop:9,border:"1px solid rgba(255,159,10,0.18)" }}><Ic.Warn s={13} c={th.warn}/><span style={{ fontSize:12,color:th.warn }}>Dostup hisob ulanmasa tizim ishlamaydi</span></div>}
      </div>
      <HR/>
      <div>
        <Sec icon={<Ic.Bot s={14} c={th.t2}/>} label="Raqam beruvchi botlar" sub="Maksimal 3 ta bot"/>
        <div style={{ display:"flex",flexDirection:"column",gap:7 }}>
          {bots.map((b,i)=><BotRow key={b.id} bot={b} idx={i} onChange={v=>upB(i,v)}/>)}
        </div>
      </div>
      <HR/>
      <div style={{ ...glass(th,0.04),borderRadius:13,padding:"15px 17px" }}>
        <p style={{ fontSize:10,fontWeight:700,color:th.t3,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:13 }}>Ishlash tartibi</p>
        <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
          {[["Dostup hisob",acc||"—","Telegram hisobiga kirish"],["Bot",conn.map(b=>b.username).join(", ")||"—","/GetNumber buyrug'i"],["Mijoz","Login","Hisobga kirish"],["@PremiumBot","Karta","Premium faollashtiriladi"]].map(([s,v,d],i)=>(
            <div key={i} style={{ display:"flex",alignItems:"flex-start",gap:11 }}>
              <div style={{ width:20,height:20,borderRadius:"50%",flexShrink:0,marginTop:1,background:th.accSub,border:`1px solid ${th.accBd}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:th.acc }}>{i+1}</div>
              <div><p style={{ fontSize:12,color:th.t2 }}>{s} — <span style={{ fontFamily:"monospace",fontWeight:700,color:th.t1 }}>{v}</span></p><p style={{ fontSize:11,color:th.t3 }}>{d}</p></div>
            </div>
          ))}
        </div>
      </div>
      <Btn onClick={()=>{sSav(true);hap.ok();toast({kind:'ok',title:'Sozlama saqlandi',note:`${conn.length} bot · ${acc}`});setTimeout(()=>sSav(false),2000);}} full sz="lg" disabled={!ready}>{saved?<><Ic.Check/>Saqlandi</>:"Saqlash"}</Btn>
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
  const [u,sU]   = useState(bC[bid] || null);
  const [go,sGo] = useState(!!bC[bid]);   // yuklandi
  const [tries,sTries] = useState(0);     // 0=domen 1=itunes 2=tugadi

  useEffect(()=>{
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
  },[bid]);

  const r = n*0.22;

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
  const shown = useCountUp(num ? Number(value) : 0);
  if (!num) return <span className="numIn" key={value} style={style}>{value}</span>;
  return <span style={{ ...style, fontVariantNumeric:"tabular-nums" }}>{shown}</span>;
};


// ═════════════════════════════════════════
// SOZLAMA ELEMENTLARI
// ═════════════════════════════════════════
const Switch = ({ on, onChange, tone }) => {
  const th = useTheme();
  const c  = tone || th.acc;
  return (
    <button onClick={()=>{ hap.tap(); onChange(!on); }}
      role="switch" aria-checked={on}
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

const Stepper = ({ value, min=1, max=99, step=1, unit, onChange, width=104 }) => {
  const th = useTheme();
  const bump = d => {
    const v = Math.max(min, Math.min(max, value + d*step));
    if (v !== value) { hap.select(); onChange(v); }
  };
  const Key = ({ d, children }) => (
    <button onClick={()=>bump(d)} disabled={d<0 ? value<=min : value>=max}
      style={{
        width:30, height:30, borderRadius:9, flexShrink:0, cursor:"pointer",
        background:"transparent", border:"none", color:th.t2,
        display:"flex", alignItems:"center", justifyContent:"center",
        opacity: (d<0 ? value<=min : value>=max) ? .25 : 1,
        transition:"opacity .18s", WebkitTapHighlightColor:"transparent",
      }}>{children}</button>
  );
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
    <span style={{ display:"inline-flex", gap:3, background:th.s1, border:`1px solid ${th.b1}`,
      borderRadius:11, padding:3, flexShrink:0 }}>
      {options.map(o=>{
        const on = o.v===value;
        return (
          <button key={o.v} onClick={()=>{ hap.select(); onChange(o.v); }}
            style={{
              padding:"5px 11px", borderRadius:8, cursor:"pointer", border:"none",
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
        textTransform:"uppercase", marginBottom:9, paddingLeft:3 }}>{label}</p>
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
const HoldBtn = ({ label, done, tone }) => {
  const th = useTheme();
  const c = tone || th.err;
  const [live,sLive] = useState(false);
  const t = useRef(null);

  const start = () => {
    sLive(true); hap.press();
    t.current = setTimeout(()=>{ hap.heavy(); sLive(false); done(); }, 1400);
  };
  const stop = () => { clearTimeout(t.current); sLive(false); };

  return (
    <button
      onTouchStart={start} onTouchEnd={stop} onTouchCancel={stop}
      onMouseDown={start} onMouseUp={stop} onMouseLeave={stop}
      className={live ? "danger" : undefined}
      style={{
        position:"relative", width:"100%", padding:"13px", borderRadius:13,
        overflow:"hidden", cursor:"pointer", fontFamily:"inherit",
        background:`${c}14`, border:`1px solid ${c}3a`, color:c,
        fontSize:13.5, fontWeight:700, letterSpacing:"-0.01em",
        WebkitTapHighlightColor:"transparent", touchAction:"manipulation",
      }}>
      {live && <span className="fill" style={{ position:"absolute", inset:0,
        background:`${c}2e`, pointerEvents:"none" }}/>}
      <span style={{ position:"relative" }}>{live ? "Ushlab turing…" : label}</span>
    </button>
  );
};


// ═════════════════════════════════════════
// SOZLAMALAR
// ═════════════════════════════════════════
const SettingsPage = ({ onBack, themeId, setThemeId }) => {
  const th    = useTheme();
  const toast = useToast();
  const { cfg, setCfg, people, bots, setPeople, setBots, setAccount, role, setRole, setPin } = useData();

  const [ask,sAsk] = useState(null);
  const set = (k,v) => setCfg(c=>({ ...c, [k]:v }));

  const cards = people.reduce((a,p)=>a+p.cards.length,0);
  const wired = bots.filter(b=>b.connected).length;

  const wipe = (what) => {
    if (what==="cards") { setPeople([]); toast({kind:"ok",title:"Kartalar tozalandi"}); }
    if (what==="bots")  { setBots(b=>b.map(x=>({id:x.id,username:"",connected:false,active:0,maxLogins:15,online:false}))); setAccount(""); toast({kind:"ok",title:"Botlar tozalandi"}); }
    if (what==="all")   { setPeople([]); setBots(b=>b.map(x=>({id:x.id,username:"",connected:false,active:0,maxLogins:15,online:false}))); setAccount(""); toast({kind:"err",title:"Hamma narsa tozalandi"}); }
    sAsk(null);
  };

  const backup = async () => {
    const data = JSON.stringify({ v:1, at:new Date().toISOString(), people, bots, cfg }, null, 2);
    const ok = await copyText(data);
    ok ? toast({kind:"ok",title:"Zaxira nusxalandi",note:`${cards} karta · ${wired} bot`,ms:3000})
       : toast({kind:"err",title:"Nusxalab bo'lmadi"});
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
            <HoldBtn label="Bosib turing — o'chirish" done={()=>wipe(ask.what)}/>
            <Btn v="ghost" full onClick={()=>sAsk(null)}>Bekor</Btn>
          </div>
        </Modal>
      )}

      {/* sarlavha */}
      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
        <button onClick={onBack} aria-label="Orqaga" style={{
          width:34, height:34, borderRadius:10, flexShrink:0, cursor:"pointer",
          background:th.s1, border:`1px solid ${th.b1}`, color:th.t2,
          display:"flex", alignItems:"center", justifyContent:"center",
        }}><Ic.Left/></button>
        <div>
          <h1 style={{ fontSize:23, fontWeight:800, letterSpacing:"-0.03em", lineHeight:1.1 }}>Sozlamalar</h1>
          <p style={{ fontSize:12, color:th.t3, marginTop:2 }}>Tizim xatti-harakati va xavfsizlik</p>
        </div>
      </div>

      {/* ── OQIM ── */}
      <SetGroup label="Oqim va limitlar" delay={0.02}>
        <SetRow icon={<Ic.Bot s={16} c={th.t2}/>} title="Bir vaqtda oqim"
          note="Parallel ishlaydigan maksimal buyurtma"
          right={<Stepper value={cfg.streams} min={1} max={20} onChange={v=>set("streams",v)} width={94}/>}/>
        <SetRow icon={<Ic.Sig s={16} c={th.t2}/>} title="Qayta urinish"
          note="Karta rad etilsa necha marta sinalsin"
          right={<Stepper value={cfg.retry} min={0} max={5} onChange={v=>set("retry",v)} width={94}/>}/>
        <SetRow icon={<Ic.Card s={16} c={th.t2}/>} title="Karta limiti"
          note="Bitta kartadan nechta premium olinadi"
          right={<Stepper value={cfg.cardCap} min={1} max={10} onChange={v=>set("cardCap",v)} width={94}/>} last/>
      </SetGroup>

      {/* ── XAVFSIZLIK ── */}
      <SetGroup label="Xavfsizlik" delay={0.07}>
        <SetRow icon={<Ic.Lock s={16} c={th.ok}/>} title="PIN qulfi"
          note="Ilova ochilganda kod so'raladi"
          right={<Tag v="ok">Yoqilgan</Tag>}/>
        <SetRow icon={<Ic.Sig s={16} c={th.t2}/>} title="Kodni o'zgartirish"
          note="Keyingi ochilishda yangi kod so'raladi"
          right={<Ic.Right s={14} c={th.t3}/>}
          onClick={()=>{ setPin(null); toast({kind:"warn",title:"Kod tozalandi",note:"Ilovani qayta oching"}); }}/>
        {cfg.pin && (
          <SetRow icon={<Ic.Clock s={16} c={th.t2}/>} title="Avtoqulf"
            note="Fon rejimida shuncha turgach qulflanadi"
            right={<Segments value={cfg.lockAfter} onChange={v=>set("lockAfter",v)}
              options={[{v:1,l:"1d"},{v:5,l:"5d"},{v:15,l:"15d"},{v:0,l:"Yo'q"}]}/>}/>
        )}
        <SetRow icon={<Ic.Card s={16} c={th.t2}/>} title="Raqamni yashirish"
          note="Ishchilar faqat oxirgi 4 raqamni ko'radi"
          right={<Switch on={cfg.maskPan} onChange={v=>set("maskPan",v)}/>}/>
        <SetRow icon={<Ic.User s={16} c={th.t2}/>} title="Kirgan qurilmalar"
          note="1 ta faol sessiya"
          right={<Ic.Right s={14} c={th.t3}/>}
          onClick={()=>toast({kind:"info",title:"Sessiyalar",note:"Server ulangach ishlaydi"})} last/>
      </SetGroup>

      {/* ── BILDIRISHNOMA ── */}
      <SetGroup label="Bildirishnomalar" delay={0.12}>
        <SetRow icon={<Ic.Star s={16} c={th.t2}/>} title="Premium olinganda"
          right={<Switch on={cfg.nOk} onChange={v=>set("nOk",v)} tone={th.ok}/>}/>
        <SetRow icon={<Ic.Warn s={16} c={th.t2}/>} title="Karta limitga tushganda"
          right={<Switch on={cfg.nLimit} onChange={v=>set("nLimit",v)} tone={th.warn}/>}/>
        <SetRow icon={<Ic.X s={16} c={th.t2}/>} title="Xato bo'lganda"
          right={<Switch on={cfg.nErr} onChange={v=>set("nErr",v)} tone={th.err}/>}/>
        <SetRow icon={<Ic.Clock s={16} c={th.t2}/>} title="Kunlik hisobot"
          note={cfg.daily ? `Har kuni ${String(cfg.dailyAt).padStart(2,"0")}:00 da` : "O'chirilgan"}
          right={<Switch on={cfg.daily} onChange={v=>set("daily",v)}/>} last={!cfg.daily}/>
        {cfg.daily && (
          <SetRow icon={<Ic.Sig s={16} c={th.t2}/>} title="Hisobot vaqti"
            right={<Stepper value={cfg.dailyAt} min={0} max={23} unit=":00" onChange={v=>set("dailyAt",v)} width={110}/>} last/>
        )}
      </SetGroup>

      {/* ── ROL (demo) ── */}
      <SetGroup label="Rol (demo)" delay={0.15}>
        <SetRow icon={<Ic.User s={16} c={th.warn}/>} title="Yangi foydalanuvchi" tone={th.warn}
          note="Kanal → PIN → taklif kodi jarayonini sinash"
          right={<Ic.Right s={14} c={th.t3}/>}
          onClick={()=>{ setRole(null); setPin(null); toast({kind:"info",title:"Kirish jarayoni",note:"Ilovani qayta oching"}); }}/>
        <SetRow icon={<Ic.Send s={16} c={th.t2}/>} title="Kirish oqimini sinash"
          note="Kanal → kod → rol ketma-ketligini ko'rish"
          right={<Ic.Right s={14} c={th.t3}/>}
          onClick={()=>{ setRole(null); toast({kind:"info",title:"Kirish oqimi",note:"Kod: PRT-K7M2-QX94-BD5N"}); }}/>
        <SetRow icon={<Ic.Team s={16} c={th.t2}/>} title="Panel ko'rinishi"
          note={role==="owner" ? "Egasi — hammasi ochiq"
              : role==="partner" ? "Hamkor — o'z ishchilari"
              : "Ishchi — bot va jamoa yo'q"}
          right={<Segments value={role} onChange={v=>{ setRole(v); toast({kind:"info",title:"Rol almashtirildi",note:{owner:"Egasi",partner:"Hamkor",worker:"Ishchi"}[v]}); }}
            options={[{v:"owner",l:"Egasi"},{v:"partner",l:"Hamkor"},{v:"worker",l:"Ishchi"}]}/>}/>
        <SetRow icon={<Ic.User s={16} c={th.t2}/>} title="Yangi a'zo sifatida kirish"
          note="Kanal → kod ekranini sinab ko'rish"
          right={<Ic.Right s={14} c={th.t3}/>}
          onClick={()=>{ setRole(null); toast({kind:"info",title:"Kirish oqimi ochildi"}); }} last/>
      </SetGroup>

      {/* ── KO'RINISH ── */}
      <SetGroup label="Ko'rinish" delay={0.17}>
        <SetRow icon={<Ic.Theme s={16} c={th.t2}/>} title="Mavzu"
          right={<Segments value={themeId} onChange={setThemeId}
            options={[{v:"amoled",l:"Qora"},{v:"stitch",l:"Ko'k"},{v:"light",l:"Yorug'"}]}/>}/>
        <SetRow icon={<Ic.Sig s={16} c={th.t2}/>} title="Haptik javob"
          note="Bosganda telefon tebranadi"
          right={<Switch on={cfg.haptic} onChange={v=>{ setHaptic(v); set("haptic",v); if(v) hap.ok(); }}/>}/>
        <SetRow icon={<Ic.Play s={16} c={th.t2}/>} title="Harakatni kamaytirish"
          note="Sekin telefonlar uchun animatsiyalar qisqaradi"
          right={<Switch on={cfg.calm} onChange={v=>set("calm",v)}/>} last/>
      </SetGroup>

      {/* ── MA'LUMOT ── */}
      <SetGroup label="Ma'lumot" delay={0.22}>
        <SetRow icon={<Ic.Copy s={15} c={th.t2}/>} title="Zaxira nusxa"
          note={`${people.length} shaxs · ${cards} karta · ${wired} bot`}
          right={<Ic.Right s={14} c={th.t3}/>} onClick={backup}/>
        <SetRow icon={<Ic.Trash s={15} c={th.warn}/>} title="Kartalarni tozalash" tone={th.warn}
          note="Barcha shaxs va kartalar o'chadi"
          right={<Ic.Right s={14} c={th.t3}/>}
          onClick={()=>sAsk({what:"cards",title:"Kartalarni tozalash",note:`${people.length} shaxs va ${cards} karta butunlay o'chiriladi.`})}/>
        <SetRow icon={<Ic.Trash s={15} c={th.warn}/>} title="Botlarni uzish" tone={th.warn}
          note="Dostup hisob va botlar uziladi"
          right={<Ic.Right s={14} c={th.t3}/>}
          onClick={()=>sAsk({what:"bots",title:"Botlarni uzish",note:"Dostup hisob va barcha ulangan botlar uziladi."})} last/>
      </SetGroup>

      {/* ── XAVFLI ── */}
      <div className="rowIn" style={{ animationDelay:"0.27s" }}>
        <p style={{ fontSize:10, fontWeight:700, color:th.err, letterSpacing:"0.14em",
          textTransform:"uppercase", marginBottom:9, paddingLeft:3 }}>Xavfli hudud</p>
        <div style={{ borderRadius:16, padding:16, background:`${th.err}0d`, border:`1px solid ${th.err}2e` }}>
          <p style={{ fontSize:14, fontWeight:700, color:th.err, letterSpacing:"-0.01em" }}>Hammasini o'chirish</p>
          <p style={{ fontSize:12, color:th.t3, marginTop:5, marginBottom:14, lineHeight:1.55 }}>
            Kartalar, botlar, dostup hisob — hammasi yo'q qilinadi. Bu amalni qaytarib bo'lmaydi.
          </p>
          <HoldBtn label="Bosib turing — hammasini o'chirish"
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
const CAP = 3;                       // bitta kartadan nechta premium

const seenLimit = new Set();         // muhr faqat bir marta urilsin

const cardHealth = (c) => {
  const cap  = c.limit || CAP;
  const used = Math.min(cap, c.used || 0);
  const left = cap - used;

  let expired = false, soon = false;
  const m = /^(\d{2})\/(\d{2})$/.exec(c.exp || "");
  if (m) {
    const mm = +m[1], yy = 2000 + +m[2];
    const end = new Date(yy, mm, 0, 23, 59, 59);      // oyning oxirgi kuni
    const now = new Date();
    expired = end < now;
    soon = !expired && (end - now) < 1000*60*60*24*75; // ~2.5 oy
  }

  const state = expired ? "expired"
              : left <= 0 ? "limit"
              : soon ? "soon"
              : used === 0 ? "fresh"
              : "active";

  return { cap, used, left, state, expired, soon };
};

const HEALTH_META = (th) => ({
  fresh:   { tone: th.ok,   label: "Yangi",           short: "yangi" },
  active:  { tone: th.ok,   label: "Faol",            short: "faol" },
  soon:    { tone: th.warn, label: "Muddati yaqin",   short: "muddat" },
  limit:   { tone: th.err,  label: "Limit tugadi",    short: "limit" },
  expired: { tone: th.t3,   label: "Muddati tugagan", short: "eskirgan" },
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

const CopyField = ({ label, value, mono=true, grow, tone, wide }) => {
  const th = useTheme();
  const [hit,sHit] = useState(false);
  return (
    <button
      onTouchStart={e=>e.stopPropagation()} onTouchEnd={e=>e.stopPropagation()} onTouchMove={e=>e.stopPropagation()} onMouseDown={e=>e.stopPropagation()} onMouseUp={e=>e.stopPropagation()}
      onClick={async e=>{
        e.stopPropagation();
        const ok = await copyText(value);
        if (ok) { hap.ok(); sHit(true); setTimeout(()=>sHit(false), 1200); }
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
          {hit ? "Nusxalandi" : label}
        </span>
        <span style={{ display:"block",
          fontFamily: mono ? "'SF Mono','Fira Code',monospace" : "inherit",
          fontSize: wide ? 15 : mono ? 13.5 : 12.5,
          fontWeight:700, letterSpacing: mono ? "0.6px" : "0",
          color: hit ? th.ok : (tone || th.t1),
          overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{value}</span>
      </span>
      {hit
        ? <Ic.Check s={13} c={th.ok}/>
        : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={th.t3} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0 }}>
            <rect x="9" y="9" width="12" height="12" rx="2.5"/><path d="M5 15H4a1 1 0 01-1-1V4a1 1 0 011-1h10a1 1 0 011 1v1"/>
          </svg>}
    </button>
  );
};

const CardFlip = ({ card, children }) => {
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
            <CopyField label="Karta raqami" value={card.num} grow wide/>
            {/* ortga qaytarish */}
            <button
              onTouchStart={e=>e.stopPropagation()} onTouchEnd={e=>e.stopPropagation()} onTouchMove={e=>e.stopPropagation()} onMouseDown={e=>e.stopPropagation()} onMouseUp={e=>e.stopPropagation()}
              onClick={e=>{ e.stopPropagation(); hap.tap(); sOn(false); }}
              aria-label="Yopish"
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
            <CopyField label="CVV"    value={card.cvv} tone={b.c}/>
            <CopyField label="Muddat" value={card.exp}/>
            <CopyField label="Egasi"  value={card.name} mono={false} grow/>
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
  const [n,sN]=useState("");const[e,sE]=useState("");
  const go=()=>{if(!n.trim()){sE("Bank nomini kiriting");return;}onAdd(n.trim());onClose();};
  return <Modal onClose={onClose}><MH title="Bank qo'shish" onClose={onClose}/><div style={{ padding:18,display:"flex",flexDirection:"column",gap:11 }}><div><Lbl>Bank nomi</Lbl><input value={n} onChange={e=>sN(e.target.value)} placeholder="Kapitalbank" autoFocus onKeyDown={e=>e.key==="Enter"&&go()} style={{ fontWeight:500,fontSize:16 }}/></div><Err msg={e}/><Btn onClick={go} full sz="lg">{n.trim()?`${n} — Davom →`:"Nomini kiriting"}</Btn></div></Modal>;
};

const CardM=({pN,bN,onAdd,onClose})=>{
  const th=useTheme();const b=gB(BL.find(x=>x.name===bN)?.id||"");
  const [f,sF]=useState({name:pN?.toUpperCase()||"",num:"",exp:"",cvv:""});const[er,sE]=useState("");
  const up=(k,v)=>sF(p=>({...p,[k]:v}));
  const fN=v=>v.replace(/\D/g,"").slice(0,16).replace(/(.{4})/g,"$1 ").trim();
  const fE=v=>{const c=v.replace(/\D/g,"").slice(0,4);return c.length>=2?c.slice(0,2)+"/"+c.slice(2):c;};
  const go=()=>{
    if(f.num.replace(/\s/g,"").length<16){sE("16 xonali karta raqami");return;}
    if(f.exp.length<5){sE("MM/YY format");return;}
    if(f.cvv.length<3){sE("CVV kiriting");return;}
    if(!f.name.trim()){sE("Ism familiya kiriting");return;}
    onAdd({...f,bankId:BL.find(x=>x.name===bN)?.id||bN,id:Date.now(),used:0,limit:3});onClose();
  };
  return <Modal onClose={onClose}><MH title="Karta qo'shish" sub={`${pN} · ${bN}`} onClose={onClose}/>
    <div style={{ padding:18,display:"flex",flexDirection:"column",gap:12,maxHeight:"65vh",overflowY:"auto" }}>
      <div style={{ height:72,borderRadius:11,padding:"10px 14px",background:`linear-gradient(130deg,${b.c||"#fff"}14,rgba(0,0,0,0.35))`,border:`1px solid ${b.c||"#888"}1a`,display:"flex",alignItems:"center",justifyContent:"space-between" }}>
        <div><p style={{ fontSize:8,color:b.c||th.t2,fontWeight:700,letterSpacing:"0.12em",marginBottom:3 }}>{bN?.toUpperCase()}</p><p style={{ fontFamily:"monospace",fontSize:12,fontWeight:700,letterSpacing:"1.5px" }}>{f.num||"•••• •••• •••• ••••"}</p></div>
        <div style={{ textAlign:"right" }}><p style={{ fontSize:10,fontWeight:600 }}>{f.name||"—"}</p><p style={{ fontFamily:"monospace",fontSize:10,color:th.t3,marginTop:1 }}>{f.exp||"MM/YY"}</p></div>
      </div>
      <div><Lbl>Ism familiya</Lbl><input value={f.name} onChange={e=>up("name",e.target.value.toUpperCase())} placeholder="ISLOMOV MANSUR" style={{ fontWeight:600 }}/></div>
      <div><Lbl>Karta raqami</Lbl><input value={f.num} onChange={e=>up("num",fN(e.target.value))} placeholder="0000 0000 0000 0000" maxLength={19} style={{ fontFamily:"monospace",fontSize:16,fontWeight:700,letterSpacing:"1.5px" }}/></div>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:9 }}>
        <div><Lbl>Muddati</Lbl><input value={f.exp} onChange={e=>up("exp",fE(e.target.value))} placeholder="MM/YY" maxLength={5} style={{ fontFamily:"monospace",fontSize:16,fontWeight:700,textAlign:"center" }}/></div>
        <div><Lbl>CVV</Lbl><input value={f.cvv} onChange={e=>up("cvv",e.target.value.replace(/\D/g,"").slice(0,3))} placeholder="•••" maxLength={3} type="password" style={{ fontFamily:"monospace",fontSize:18,fontWeight:800,textAlign:"center",letterSpacing:"4px" }}/></div>
      </div>
      <Err msg={er}/>
      <Btn onClick={go} full sz="lg"><Ic.Check/>Saqlash</Btn>
    </div>
  </Modal>;
};

const CardsPage=()=>{
  const th=useTheme();
  const toast = useToast();
  const { people:P, setPeople:sP } = useData();
  const [stk,sSt]=useState([{v:"p"}]);const[mod,sM]=useState(null);const[cnf,sCn]=useState(null);
  const [add,sA]=useState(false);const[nn,sNN]=useState("");const[ne,sNE]=useState("");
  const [fresh,sFresh]=useState(null);
  const [undo,sUndo]=useState(null);
  const c=stk[stk.length-1];const push=s=>sSt([...stk,s]);const pop=()=>sSt(stk.slice(0,-1));
  const gBN=card=>{const b=BL.find(x=>x.id===card.bankId);return b?b.name:card.bankId;};
  const gBs=p=>{const ns=[...new Set(p?.cards.map(gBN)||[])];return ns.map(n=>({n,bid:BL.find(b=>b.name===n)?.id||n,cards:p.cards.filter(x=>gBN(x)===n)}));};
  const bc=P.find(p=>p.id===c.pid)?.cards.filter(x=>gBN(x)===c.bn)||[];
  const pers=P.find(p=>p.id===c.pid);
  const addP=async()=>{
    if(!nn.trim()){sNE("Ism kiriting");return;}
    if(P.find(p=>p.name.toLowerCase()===nn.toLowerCase())){sNE("Bu nom bor");return;}
    try {
      const saved = await api.post("/people", { name: nn.trim() });
      sP(p=>[...p, saved]);
      hap.ok(); toast({kind:"ok",title:"Shaxs qo'shildi",note:nn.trim()});
      sNN(""); sA(false); sNE("");
    } catch (e) {
      hap.err(); sNE(e.message || "Serverga saqlanmadi");
    }
  };
  const addB=n=>{const pid=c.pid;sM(null);setTimeout(()=>push({v:"c",pid,bn:n}),80);};
  const addC=async(card)=>{
    // MUHIM: to'liq karta raqami/CVV hech qachon mahalliy holatda
    // saqlanmaydi — faqat backend'ga yuboriladi, backend esa faqat
    // NIQOBLANGAN raqamni qaytaradi, shuni saqlaymiz.
    try {
      const saved = await api.post(`/people/${c.pid}/cards`, card);
      sP(p=>p.map(x=>x.id===c.pid?{...x,cards:[...x.cards,saved]}:x));
      sFresh(saved.id); setTimeout(()=>sFresh(null),1500); hap.ok();
      toast({kind:'ok',title:'Karta qo\'shildi',note:`•••• ${card.num.replace(/\s/g,'').slice(-4)}`});
    } catch (e) {
      hap.err();
      toast({kind:'err',title:"Serverga saqlanmadi",note:e.message});
    }
  };
  const delC=id=>{sP(p=>p.map(x=>x.id===c.pid?{...x,cards:x.cards.filter(k=>k.id!==id)}:x));api.del(`/cards/${id}`).catch(()=>{});};
  const delP=id=>{sP(p=>p.filter(x=>x.id!==id));sSt([{v:"p"}]);api.del(`/people/${id}`).catch(()=>{});};
  const delPerson=id=>{sP(p=>p.filter(x=>x.id!==id));api.del(`/people/${id}`).catch(()=>{});};
  const delB=n=>{sP(p=>p.map(x=>x.id===c.pid?{...x,cards:x.cards.filter(k=>gBN(k)!==n)}:x));pop();};
  const tot=P.reduce((s,p)=>s+p.cards.length,0);const act=P.reduce((s,p)=>s+p.cards.filter(k=>cardHealth(k).left>0 && cardHealth(k).state!=="expired").length,0);
  const lim=P.reduce((s,p)=>s+p.cards.filter(k=>{const h=cardHealth(k);return h.left<=0||h.state==="expired";}).length,0);
  const { toss, tossAll } = useToss(th);
  return(
    <div style={{ display:"flex",flexDirection:"column",gap:18,maxWidth:680 }}>
      {undo&&<UndoBar item={undo} onUndo={()=>{undo.restore();sUndo(null);}} onClose={()=>sUndo(null)}/>}
      {cnf&&<Conf {...cnf} onClose={()=>sCn(null)}/>}
      {mod==="bank"&&<BankM onAdd={addB} onClose={()=>sM(null)}/>}
      {mod==="card"&&<CardM pN={pers?.name} bN={c.bn} onAdd={addC} onClose={()=>sM(null)}/>}
      <div style={{ display:"flex",alignItems:"center",gap:11 }}>
        {stk.length>1&&<button onClick={pop} style={{ width:34,height:34,borderRadius:9,...glass(th,0.04),color:th.t2,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",border:`1px solid ${th.b1}`,flexShrink:0 }}><Ic.Left/></button>}
        <div style={{ flex:1 }}>
          <h1 style={{ fontSize:22,fontWeight:800,letterSpacing:"-0.03em",lineHeight:1.15 }}>{c.v==="p"?"Kartalar":c.v==="b"?pers?.name:c.bn}</h1>
          <p style={{ fontSize:12,color:th.t3,marginTop:2 }}>{c.v==="p"?`${P.length} shaxs · ${tot} karta`:c.v==="b"?`${gBs(pers).length} ta bank`:`${bc.length} ta karta`}</p>
        </div>
        {c.v==="p"&&<Btn v={add?"ghost":"primary"} sz="sm" onClick={()=>{sA(!add);sNE("");}}>{add?"Bekor":<><Ic.Plus s={12}/>Shaxs</>}</Btn>}
        {c.v==="c"&&<Btn sz="sm" onClick={e=>{markOrigin(e);sM("card");}}><Ic.Plus s={12}/>Karta</Btn>}
      </div>
      {c.v==="p"&&<>
        <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:9 }}>
          <StatCard label="Kartalar" value={String(tot)} color={th.acc}/>
          <StatCard label="Tayyor"   value={String(act)} color={act?th.ok:th.t3}/>
          <StatCard label="Tugagan"  value={String(lim)} color={lim?th.err:th.t3}/>
        </div>
        {add&&<div style={{ ...glass(th,0.05),borderRadius:12,padding:14,display:"flex",flexDirection:"column",gap:9,border:"1px solid rgba(255,159,10,0.18)" }}>
          <div style={{ display:"flex",gap:9 }}><input value={nn} onChange={e=>sNN(e.target.value)} placeholder="Islomov Mansur" autoFocus onKeyDown={e=>e.key==="Enter"&&addP()} style={{ fontWeight:500 }}/><Btn onClick={addP} style={{ whiteSpace:"nowrap" }}>Yaratish</Btn></div>
          <Err msg={ne}/>
        </div>}
        <div style={{ display:"flex",flexDirection:"column",gap:7 }}>
          {P.map(p=>{const bks=gBs(p);return(
            <div key={p.id} data-item><SwipeRow label="Shaxs" onDelete={()=>{const el=document.querySelector(`[data-pid="${p.id}"]`);const snap=P.find(x=>x.id===p.id);const at=P.findIndex(x=>x.id===p.id);toss(el,()=>{delPerson(p.id);sUndo({id:Date.now(),title:"Shaxs o'chirildi",note:snap.name,restore:()=>sP(l=>{const n=[...l];n.splice(Math.min(at,n.length),0,snap);return n;})});});}}><div data-row data-pid={p.id} className="ho" onClick={()=>push({v:"b",pid:p.id})} style={{ ...glass(th,0.04),borderRadius:13,padding:"12px 14px",display:"flex",alignItems:"center",gap:11 }}>
              <div style={{ width:36,height:36,borderRadius:9,background:th.s1,border:`1px solid ${th.b1}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}><Ic.User s={15} c={th.t3}/></div>
              <div style={{ flex:1,minWidth:0 }}>
                <p style={{ fontWeight:600,fontSize:13,letterSpacing:"-0.01em" }}>{p.name}</p>
                <p style={{ fontSize:11,color:th.t3,marginTop:2 }}>{p.cards.length} karta · {bks.length} bank</p>
              </div>
              <div style={{ display:"flex",marginRight:3 }}>{bks.slice(0,3).map((bk,i)=><div key={bk.bid} style={{ marginLeft:i?-5:0,zIndex:3-i }}><Ava bid={bk.bid} n={22}/></div>)}{bks.length>3&&<div style={{ width:22,height:22,borderRadius:6,marginLeft:-5,...glass(th,0.05),display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:th.t3,fontWeight:600 }}>+{bks.length-3}</div>}</div>
              <Ic.Right s={13} c={th.t3}/>
            </div></SwipeRow></div>
          );})}
          {!P.length && (
            <Empty art="folder"
              title="Hali shaxs yo'q"
              note="Kartalar shaxslar ostiga yig'iladi. Birinchi shaxsni qo'shib boshlang."
              action="Shaxs qo'shish"
              onAction={()=>{ sA(true); sNE(""); }}/>
          )}
        </div>
      </>}
      {c.v==="b"&&pers&&<div style={{ display:"flex",flexDirection:"column",gap:7 }}>
        {gBs(pers).map(bk=>{const bd=gB(bk.bid);return(
          <div key={bk.bid} data-item><SwipeRow label="Bank" onDelete={()=>{const el=document.querySelector(`[data-bank="${bk.bid}"]`);const snap=[...bk.cards];const pid=c.pid;toss(el,()=>{delB(bk.n);sUndo({id:Date.now(),title:"Bank o'chirildi",note:`${bk.n} · ${snap.length} karta`,restore:()=>sP(l=>l.map(x=>x.id===pid?{...x,cards:[...x.cards,...snap]}:x))});});}}><div data-row data-bank={bk.bid} className="ho" onClick={()=>push({v:"c",pid:c.pid,bn:bk.n})} style={{ ...glass(th,0.04),borderRadius:13,padding:"12px 14px",display:"flex",alignItems:"center",gap:13 }}>
            <Ava bid={bk.bid} n={42}/>
            <div style={{ flex:1 }}>
              <p style={{ fontWeight:600,fontSize:13,letterSpacing:"-0.01em" }}>{bk.n}</p>
              <div style={{ height:2,background:th.b1,borderRadius:1,marginTop:6,width:80 }}><div style={{ height:"100%",borderRadius:1,background:bd.c,width:`${(bk.cards.filter(k=>cardHealth(k).left>0).length/bk.cards.length)*100}%`,transition:"width .4s" }}/></div>
            </div>
            <div style={{ textAlign:"right",flexShrink:0 }}>
              <p style={{ fontSize:11,color:th.ok,fontWeight:600 }}>{bk.cards.filter(k=>cardHealth(k).left>0).length} tayyor</p>
              <p style={{ fontSize:10,color:th.t3,marginTop:1 }}>{bk.cards.length} ta</p>
            </div>
            <Ic.Right s={13} c={th.t3}/>
          </div></SwipeRow></div>
        );})}
        {!gBs(pers).length && (
          <Empty art="bank"
            title="Bank yo'q"
            note={`${pers.name} uchun birinchi bankni qo'shing, keyin kartalarni kiritasiz.`}
            action="Bank qo'shish"
            onAction={e=>{markOrigin(e);sM("bank");}}/>
        )}
        {gBs(pers).length>0 && <button onClick={e=>{markOrigin(e);sM("bank");}} style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:7,padding:"12px",borderRadius:13,border:`1px dashed ${th.b2}`,background:"transparent",color:th.t2,cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:500,transition:"all .18s" }}
          onMouseEnter={e=>{e.currentTarget.style.background=th.s2;e.currentTarget.style.color=th.t1;}}
          onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color=th.t2;}}>
          <Ic.Plus s={13} c="currentColor"/>Bank qo'shish
        </button>}
      </div>}
      {c.v==="c"&&<div style={{ display:"flex",flexDirection:"column",gap:7 }}>
        {bc.map(card=>{
          const last4 = card.num?.replace(/\s/g,"").slice(-4)||"????";
          const H = cardHealth(card);
          const M = HEALTH_META(th)[H.state];
          const dead = H.state==="limit" || H.state==="expired";
          const fresh0 = !seenLimit.has(card.id);
          if (dead && fresh0) seenLimit.add(card.id);
          const slam = dead && fresh0;
          return (
          <div key={card.id} data-item><SwipeRow label="Karta" onDelete={()=>{const el=document.querySelector(`[data-card="${card.id}"]`);const snap={...card};const pid=c.pid;toss(el,()=>{delC(card.id);sUndo({id:Date.now(),title:"Karta o'chirildi",note:`•••• ${last4}`,restore:()=>sP(l=>l.map(x=>x.id===pid?{...x,cards:[...x.cards,snap]}:x))});});}}><CardFlip card={card}><div data-row data-card={card.id}
            className={`${fresh===card.id?"land ":""}${slam?"jolt ":""}`}
            style={{ ...glass(th,0.04),borderRadius:13,padding:"12px 14px",display:"flex",alignItems:"center",gap:11,position:"relative",overflow:"hidden",transformStyle:"preserve-3d" }}>

            {fresh===card.id && <span className="sheen" style={{ position:"absolute",top:0,bottom:0,left:0,width:"48%",background:"linear-gradient(90deg,transparent,rgba(255,255,255,.16),transparent)",pointerEvents:"none",zIndex:2 }}/>}

            {/* muhr */}
            {dead && <Stamp text={H.state==="limit"?"Limit":"Eskirgan"} tone={H.state==="limit"?th.err:th.t3} animate={slam}/>}

            {/* xira qatlam */}
            {dead && <span className={slam?"dim":undefined} style={{ position:"absolute",inset:0,zIndex:5,pointerEvents:"none",background: th.id==="light"?"rgba(244,245,247,0.55)":"rgba(8,8,10,0.5)" }}/>}

            <span style={{ opacity: dead?.5:1, filter: dead?"grayscale(.7)":"none", transition:"all .4s", display:"block", flexShrink:0 }}>
              <Ava bid={card.bankId} n={38}/>
            </span>

            <div style={{ flex:1,minWidth:0, opacity: dead?.55:1, transition:"opacity .4s" }}>
              <p style={{ fontFamily:"monospace",fontSize:13,fontWeight:700,letterSpacing:"0.5px" }}>•••• {last4}</p>
              <p style={{ fontSize:11,color:th.t3,marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{card.name}</p>
              <div style={{ display:"flex",alignItems:"center",gap:8,marginTop:6 }}>
                <Pips used={H.used} cap={H.cap} tone={M.tone} dead={dead}/>
                <span style={{ fontFamily:"'SF Mono',monospace",fontSize:10.5,color: dead?th.t4:M.tone, fontWeight:600 }}>
                  {H.state==="expired" ? "—" : `${H.left} qoldi`}
                </span>
              </div>
            </div>

            <div style={{ textAlign:"right",flexShrink:0, opacity: dead?.55:1 }}>
              <p style={{ fontFamily:"monospace",fontSize:12,fontWeight:700, color: H.state==="soon"?th.warn:H.state==="expired"?th.err:th.t1 }}>{card.exp}</p>
              <span style={{ display:"inline-flex",alignItems:"center",gap:4,marginTop:5 }}>
                <span style={{ width:6,height:6,borderRadius:"50%",background:M.tone, boxShadow: dead?"none":`0 0 6px ${M.tone}66` }}/>
                <span style={{ fontSize:9.5,color:M.tone,fontWeight:600,letterSpacing:"0.04em" }}>{M.short}</span>
              </span>
            </div>
          </div></CardFlip></SwipeRow></div>
        );})}
        {!bc.length && (
          <Empty art="card"
            title="Karta yo'q"
            note={`${c.bn} bankiga hali karta biriktirilmagan.`}
            action="Karta qo'shish"
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
      sErr("Login va parolni kiriting");
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
            <button onClick={()=>sSeen(v=>!v)} tabIndex={-1} aria-label="Parolni ko'rsatish"
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
  const TH = 74, MAX = 122;

  useEffect(()=>{
    const el = box.current;
    if (!el) return;
    const atTop = () => (window.scrollY || document.documentElement.scrollTop || 0) <= 0;

    const onStart = e => {
      if (!atTop() || state==="load" || state==="done") return;
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
      const wasReady = state==="ready";
      sPull(p);
      const nowReady = p >= TH;
      if (nowReady && !wasReady) { hap.press(); }
      sState(nowReady ? "ready" : "pull");
    };
    const onEnd = () => {
      if (!armed.current) return;
      armed.current = false;
      if (pull >= TH) {
        sPull(0); sState("load"); hap.soft();
        setTimeout(()=>{ onRefresh?.(); sState("done"); hap.ok(); }, 900);
        setTimeout(()=>sState("idle"), 1450);
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
    };
  }, [pull, state, onRefresh]);

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
              {done ? "Yangilandi" : load ? "Yangilanmoqda" : ready ? "Qo'yib yuboring" : "Torting"}
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
      else next===saved ? win(next) : fail("Kod noto'g'ri");
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

  const title = mode==="create" ? "Kod yarating"
              : mode==="repeat" ? "Kodni takrorlang" : "Kodni kiriting";
  const note  = mode==="create" ? "Panelni himoyalash uchun 4 xonali kod"
              : mode==="repeat" ? "Eslab qolish uchun yana bir marta"
              : "PremoLux panelini ochish uchun";

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


// ═════════════════════════════════════════
// KIRISH JARAYONI — kanal · PIN · kod
// ═════════════════════════════════════════
const Onboarding = ({ codes, onJoin }) => {
  const th = useTheme();
  const [step,sStep] = useState("channel");   // channel | pin | code | done
  const [chk,sChk]   = useState("idle");      // idle | wait | ok
  const [pin,sPin]   = useState("");
  const [first,sFirst]=useState("");
  const [rep,sRep]   = useState(false);
  const [code,sCode] = useState("");
  const [msg,sMsg]   = useState("");
  const [bad,sBad]   = useState(false);
  const [seal,sSeal] = useState(false);

  // ── 1. kanal ──
  const check = () => {
    sChk("wait"); hap.tap();
    setTimeout(()=>{ sChk("ok"); hap.ok(); setTimeout(()=>sStep("pin"), 900); }, 1300);
  };

  // ── 2. PIN ──
  const pushPin = d => {
    if (pin.length>=4) return;
    const nx = pin + d; sPin(nx); sMsg("");
    if (nx.length<4) return;
    setTimeout(()=>{
      if (!rep) { hap.select(); sFirst(nx); sPin(""); sRep(true); }
      else if (nx===first) { hap.ok(); sStep("code"); sPin(nx); }
      else { hap.err(); sMsg("Kodlar mos kelmadi"); sBad(true); sRep(false); sFirst("");
             setTimeout(()=>{ sBad(false); sPin(""); }, 540); }
    }, 170);
  };

  // ── 3. taklif kodi ──
  const submit = () => {
    const c = code.trim().toUpperCase();
    const inv = codes.find(x=>x.code===c);
    if (!inv) { hap.err(); sMsg("Bunday kod topilmadi"); sBad(true); setTimeout(()=>sBad(false),540); return; }
    hap.ok(); sSeal(true); sMsg("");
    setTimeout(()=>onJoin(inv, first || pin), 1500);
  };

  const fmt = v => {
    const raw = v.toUpperCase().replace(/[^A-Z0-9]/g,"").slice(0,15);
    const body = raw.startsWith("PLX") ? raw.slice(3) : raw;
    const parts = body.match(/.{1,4}/g) || [];
    return ["PLX", ...parts].join("-");
  };

  const Head = ({ n, title, note }) => (
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

        {/* ── KANAL ── */}
        {step==="channel" && (
          <div className="stepIn">
            <Head n={1} title="Kanalga obuna bo'ling"
              note="Yangilanishlar va e'lonlar shu kanalda chiqadi. Obuna majburiy."/>

            <div style={{ ...glass(th,0.05), borderRadius:18, padding:"18px 16px", marginBottom:14 }}>
              <div style={{ display:"flex", alignItems:"center", gap:13 }}>
                <span style={{ width:46, height:46, borderRadius:15, flexShrink:0,
                  background:th.accSub, border:`1px solid ${th.accBd}`,
                  display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke={th.acc}
                    strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 3L10.5 13.5M21 3l-6.5 18-4-8-8-4z"/>
                  </svg>
                </span>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontSize:15, fontWeight:700, letterSpacing:"-0.01em" }}>{CHANNEL}</p>
                  <p style={{ fontSize:12, color:th.t3, marginTop:2 }}>Rasmiy kanal</p>
                </div>
                {chk==="ok" && <span className="tick2"><Ic.Check s={20} c={th.ok}/></span>}
              </div>
            </div>

            <a href={`https://t.me/${CHANNEL.replace("@","")}`} target="_blank" rel="noreferrer"
              style={{ textDecoration:"none", display:"block", marginBottom:9 }}>
              <Btn v="secondary" full sz="lg">Kanalni ochish</Btn>
            </a>
            <Btn full sz="lg" onClick={check} disabled={chk!=="idle"}>
              {chk==="wait" ? <><Ic.Spin s={14} c={th.accTxt}/>Tekshirilmoqda</>
               : chk==="ok" ? <><Ic.Check s={14} c={th.accTxt}/>Tasdiqlandi</>
               : "Obuna bo'ldim"}
            </Btn>
          </div>
        )}

        {/* ── PIN ── */}
        {step==="pin" && (
          <div className="stepIn">
            <Head n={2} title={rep ? "Kodni takrorlang" : "Kod yarating"}
              note={rep ? "Eslab qolish uchun yana bir marta" : "Panelni himoyalash uchun 4 xonali kod"}/>
            <div className={bad?"shakeX":undefined} style={{ position:"relative", height:48,
              display:"flex", alignItems:"center", justifyContent:"center", marginBottom:24 }}>
              {[0,1,2,3].map(i=>{
                const on = pin.length>i;
                return (
                  <span key={i} style={{
                    width:15, height:15, borderRadius:"50%", margin:"0 13px",
                    background: on ? (bad?th.err:th.acc) : "transparent",
                    border:`1.6px solid ${on ? (bad?th.err:th.acc) : th.b2}`,
                    boxShadow: on && !bad ? `0 0 12px ${th.acc}55` : "none",
                    transition:"all .2s",
                  }}>
                    {on && <span className="dotIn" style={{ display:"block", width:"100%", height:"100%", borderRadius:"50%" }}/>}
                  </span>
                );
              })}
            </div>
            <Pad onKey={pushPin} onBack={()=>sPin(p=>p.slice(0,-1))}/>
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
                <h1 style={{ fontSize:22, fontWeight:800, letterSpacing:"-0.03em" }}>Xush kelibsiz!</h1>
                <p style={{ fontSize:13, color:th.t3, marginTop:7 }}>Panel ochilmoqda…</p>
              </div>
            ) : (
              <>
                <Head n={3} title="Taklif kodini kiriting"
                  note="Kodni sizni taklif qilgan odam beradi."/>
                <div className={bad?"shakeX":undefined} style={{ marginBottom:14 }}>
                  <input value={code} onChange={e=>sCode(fmt(e.target.value))}
                    placeholder="PLX-XXXX-XXXX-XXXX" autoCapitalize="characters" autoFocus
                    onKeyDown={e=>e.key==="Enter"&&submit()}
                    style={{ fontFamily:"'SF Mono','Fira Code',monospace", fontSize:17,
                      fontWeight:700, textAlign:"center", letterSpacing:"1.4px", padding:"15px 12px",
                      borderColor: bad ? th.err : undefined }}/>
                </div>
                <Btn full sz="lg" onClick={submit} disabled={code.replace(/[^A-Z0-9]/g,"").length<15}>
                  Tasdiqlash
                </Btn>
                <p style={{ textAlign:"center", fontSize:11.5, color:th.t4, marginTop:14, lineHeight:1.5 }}>
                  Kodingiz yo'q bo'lsa {CHANNEL} ga murojaat qiling
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
  const [page, setPage] = useState("premium");
  const [entered, setEntered] = useState(false);
  const [pin, setPin] = useState(null);
  const [ready, setReady] = useState(false);
  const [dir, setDir] = useState(0);              // sahifa yo'nalishi
  const [tick, setTick] = useState(0);

  // ── umumiy ma'lumot ──
  const [account, setAccount] = useState("");
  const [bots, setBots] = useState([
    { id:1, username:"", connected:false, active:0, maxLogins:15, online:false },
    { id:2, username:"", connected:false, active:0, maxLogins:15, online:false },
    { id:3, username:"", connected:false, active:0, maxLogins:15, online:false },
  ]);
  const [people, setPeople] = useState([]);
  const [role, setRole] = useState("owner");
  const [codes, setCodes] = useState([]);
  const [hist, setHist] = useState([]);   // null | owner | partner | worker

  const [partners, setPartners] = useState([]);
  const [workers, setWorkers] = useState([]);



  const [cfg, setCfg] = useState({
    streams:8, retry:1, cardCap:3,
    pin:false, lockAfter:5, maskPan:true,
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
  const pushToast = ({ kind="info", title, note, ms=2600 }) =>
    setToasts(l => [...l.slice(-2), { id: Date.now()+Math.random(), kind, title, note, ms }]);
  const killToast = id => setToasts(l => l.filter(t => t.id !== id));


  // Telegram oynasini to'liq ochish
  useEffect(()=>{ try { window.Telegram?.WebApp?.expand?.(); window.Telegram?.WebApp?.ready?.(); } catch {} },[]);

  const [bootErr, setBootErr] = useState(null);

  // ── saqlangan holatni yuklash + serverga "salom" ──
  // DIQQAT: window.storage FAQAT Claude'ning ichki muhitida ishlaydi —
  // mustaqil (Vercel) saytda mavjud emas. Shuning uchun oddiy, har
  // qanday brauzerda ishlaydigan localStorage ishlatiladi.
  useEffect(()=>{
    (async()=>{
      try {
        await api.post("/auth/verify", {}).catch(e=>{
          if (e.code === "NETWORK") setBootErr(e);
        });
        const raw = localStorage.getItem("premolux_v1");
        const d = raw ? JSON.parse(raw) : null;
        if (d) {
          if (d.account  !== undefined) setAccount(d.account);
          if (d.bots)      setBots(d.bots);
          if (d.people)    setPeople(d.people);
          if (d.cfg)     { setCfg(c=>({ ...c, ...d.cfg })); setHaptic(d.cfg.haptic !== false); }
          if (d.role)      setRole(d.role);
          if (d.partners)  setPartners(d.partners);
          if (d.workers)   setWorkers(d.workers);
          if (d.codes)     setCodes(d.codes);
          if (d.hist?.length) setHist(d.hist);
          if (d.themeId)   setThemeId(d.themeId);
          if (d.pin)       setPin(d.pin);
        }
      } catch {}
      // MUHIM: ilova DARHOL ochilishi kerak — backend so'rovini
      // (masalan Render "uyg'onish" vaqti tufayli sekin bo'lsa)
      // KUTIB TURMAYDI. Shuning uchun setReady(true) BIRINCHI
      // chaqiriladi, "/people" esa FONDA, alohida yuklanadi.
      setReady(true);

      // Mahalliy (localStorage) ma'lumot ESKIRGAN bo'lishi mumkin
      // (masalan boshqa qurilmada qo'shilgan karta) — shuning uchun
      // BACKEND'dan HAQIQIY ro'yxatni FONDA olib, ustidan yozamiz.
      // Bu endi ILOVA OCHILISHINI SEKINLASHTIRMAYDI.
      try {
        const realPeople = await api.get("/people");
        if (Array.isArray(realPeople)) setPeople(realPeople);
      } catch {}
    })();
  },[]);

  // ── o'zgarishlarni saqlash ──
  useEffect(()=>{
    if (!ready) return;
    const t = setTimeout(()=>{
      try {
        localStorage.setItem("premolux_v1", JSON.stringify({
          account, bots, people, cfg, role, partners, workers, themeId, pin, codes, hist,
        }));
      } catch {}
    }, 350);
    return ()=>clearTimeout(t);
  }, [ready, account, bots, people, cfg, role, partners, workers, themeId, pin, codes]);

  // sahifa yo'nalishi: o'ngdagi tabga o'tsa chapdan sirg'aladi
  const ORDER = ["premium","bots","cards","team","stats","profile"];
  useEffect(()=>{
    if (role==="worker" && (page==="bots" || page==="team")) setPage("premium");
  }, [role]);
  const go = next => {
    if (next === page) return;
    setDir(ORDER.indexOf(next) > ORDER.indexOf(page) ? 1 : -1);
    setPage(next);
  };
  const theme = themes[themeId];

  if (!ready) return (
    <ThemeCtx.Provider value={theme}>
      <Css theme={theme}/>
      <div style={{ position:"fixed", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
        <span className="lockPulse" style={{ width:54, height:54, borderRadius:18,
          background:theme.s2, border:`1px solid ${theme.b1}`,
          display:"flex", alignItems:"center", justifyContent:"center" }}>
          <Ic.Lock s={22} c={theme.acc}/>
        </span>
      </div>
    </ThemeCtx.Provider>
  );

  return (
    <ThemeCtx.Provider value={theme}>
    <DataCtx.Provider value={data}>
    <ToastCtx.Provider value={pushToast}>
      <Css theme={theme}/>
      <OfflineBanner/>
      {!role && (
        <Onboarding codes={codes}
          onJoin={(inv, code)=>{
            setPin(code);
            const me = window.Telegram?.WebApp?.initDataUnsafe?.user;
            const nm = me ? [me.first_name, me.last_name].filter(Boolean).join(" ") : "Yangi foydalanuvchi";
            setCodes(l=>l.map(x=>x.code===inv.code?{...x,used:true,usedBy:nm}:x));   // bir martalik
            const id = me?.id ? String(me.id) : String(700000000 + Math.floor(Math.random()*99999999));
            if (inv.kind === "partner") {
              setRole("partner");
              setPartners(l=>[...l, { id:"me", name:nm, tgId:id, share:10, balance:0, orders:0, goal:2000000, today:0, week:[0,0,0,0,0,0,0] }]);
            } else {
              setRole("worker");
              setWorkers(l=>[...l, { id:"me", name:nm, tag:"@"+(me?.username||"worker"), parent: inv.by,
                online:true, today:0, ok:100, last:"hozir", week:[0,0,0,0,0,0,0] }]);
            }
            setEntered(true);
          }}/>
      )}
      {role && !entered && (
        <PinGate saved={pin}
          onSet={code=>setPin(code)}
          onOpen={()=>setEntered(true)}/>
      )}
      <ToastHost list={toasts} onKill={killToast}/>
      <div className={cfg.calm ? "calm" : undefined} style={{ position:"relative", zIndex:1, minHeight:"100vh", paddingBottom:118 }}>
        <main className={entered ? "wake" : undefined} style={{ padding:"14px 18px 18px", maxWidth:720, margin:"0 auto" }}>
          <PullRefresh onRefresh={()=>setTick(t=>t+1)}>
            <div className={`${dir===0?"u":dir>0?"slideL":"slideR"} stg`} key={page+"-"+tick} style={{ paddingTop:12 }}>
              {page==="premium" && <PremiumPage goto={setPage}/>}
              {page==="bots"    && <BotsPage/>}
              {page==="cards"   && <CardsPage/>}
              {page==="team"    && <TeamPage/>}
              {page==="stats"   && <StatsPage/>}
              {page==="profile" && <ProfilePage themeId={themeId} setThemeId={setThemeId}/>}
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
