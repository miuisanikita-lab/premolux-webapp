// ═════════════════════════════════════════════════════════════
// TEMA TIZIMI — ranglar, global CSS va stil yordamchilari
// ═════════════════════════════════════════════════════════════
// Avval bularning hammasi App.jsx da edi (850+ qator) — bitta
// o'zgartirish qilish uchun 6900 qator ichidan izlash kerak edi.
// Endi alohida modulda.
//
// Ogohlantirish: bu ilovaning eng barqaror qismi. Uni
// o'zgartirmasdan oldin ALMASHTA testlarni ishga tushiring:
//     npm test
//
// Import: import { themes, Css, useTheme, glass } from "./theme";

import { createContext, useContext } from "react";

// ── RANGLAR ──
export const themes = {
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

// rasmiy kanal — Onboarding va yordam sahifalarida ishlatiladi
export const CHANNEL = "@PremoLux";

export const ThemeCtx = createContext(themes.amoled);
export const useTheme = () => useContext(ThemeCtx);

// ── GLOBAL CSS ──
export const Css = ({ theme }) => {
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

    /* <a> elementi tugma ko'rinishida — <button> ichida <button> bo'lmasligi uchun */
    .linkBtn{ align-items:center; justify-content:center; gap:7px; cursor:pointer;
      font-family:inherit; font-weight:700; letter-spacing:-0.01em; }
    .linkBtn:active{ transform:scale(.985); }

    /* ── ochilish ekrani ── */
    @keyframes splashGlow{
      0%,100%{ transform:scale(1);   opacity:.75 }
      50%    { transform:scale(1.14); opacity:1   }
    }
    @keyframes splashPop{
      0%  { transform:scale(.72) rotate(-8deg); opacity:0 }
      55% { transform:scale(1.08) rotate(2deg);  opacity:1 }
      100%{ transform:scale(1) rotate(0);       opacity:1 }
    }
    @keyframes splashRise{
      0%  { transform:translateY(10px); opacity:0 }
      100%{ transform:translateY(0);    opacity:1 }
    }
    @keyframes splashTag{
      0%,100%{ opacity:.45 } 50%{ opacity:.9 }
    }
    .splashMark{ animation:splashPop .62s cubic-bezier(.2,1.3,.35,1) both }
    .splashTag { animation:splashRise .5s .1s cubic-bezier(.2,.9,.3,1) both,
                         splashTag 2.2s .6s ease-in-out infinite }

    /* ── klaviatura fokusi ──
       Oldin butun ilovada :focus-visible yo'q edi: klaviatura bilan
       yurganingizda qayerda turganingiz ko'rinmasdi. Faqat sichqoncha
       uchun :focus ko'rsatiladi (bosilganda chiziq chiqmasin). */
    :focus{outline:none}
    :focus-visible{
      outline:2px solid ${theme.acc};
      outline-offset:2px;
      border-radius:10px;
    }
    /* klaviatura bilan bosilganda "bosilgan" effekti kerak emas */
    button:focus:not(:focus-visible){outline:none}

    /* ── harakat kamaytirish ──
       .calm klassi faqat CSS animatsiyalarini sekinlashtiradi;
       JS bilan boshqariladigan animatsiyalar (Count, toss) ham
       "Harakatni kamaytirish" sozlamasiga bo'ysunishi uchun
       useCountUp o'z vaqtini oladi. */
    @media (prefers-reduced-motion: reduce){
      .calm *, .calm *::before, .calm *::after{
        animation-duration:.01ms !important;
        animation-iteration-count:1 !important;
        transition-duration:.01ms !important;
      }
    }

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
    /* — modal tugmadan o'sishi (_grow .bar uchun band qilingan) — */
    @keyframes _growFrom {
      from { opacity:0; transform:translate(var(--gx), var(--gy)) scale(var(--gs)); }
      to   { opacity:1; transform:translate(0,0) scale(1); }
    }
    .grow { animation:_growFrom .42s cubic-bezier(.22,1.02,.3,1) both; transform-origin:center center; }

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
    @keyframes _codeIn  { from{opacity:0;transform:translateY(10px) scale(.96)} to{opacity:1;transform:none} }
    @keyframes _charIn  { from{opacity:0;transform:translateY(-9px) scale(.7)} to{opacity:1;transform:none} }
    @keyframes _scanLine{ from{transform:translateY(-120%)} to{transform:translateY(320%)} }
    @keyframes _stepIn  { from{opacity:0;transform:translateX(26px)} to{opacity:1;transform:none} }
    @keyframes _tick2   { from{transform:scale(.4);opacity:0} 60%{transform:scale(1.14)} to{transform:scale(1);opacity:1} }
    .codeIn  { animation:_codeIn .4s cubic-bezier(.2,1.05,.3,1) both }
    .charIn  { animation:_charIn .24s cubic-bezier(.2,1.4,.4,1) both }
    .scanLine{ animation:_scanLine 2.2s cubic-bezier(.4,0,.6,1) infinite }
    .stepIn  { animation:_stepIn .36s cubic-bezier(.2,.9,.3,1) both }
    .tick2   { animation:_tick2 .38s cubic-bezier(.2,1.35,.4,1) both }

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

// ── OYNALAR UCHUN OCHILISH ANIMATSIYASI ──
export const glass = (th, op=0.06, bl=32) => th.id==="light" ? ({
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
