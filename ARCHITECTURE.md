# Tuzilma

## Modullar

```
src/
├── main.jsx        Ilova ildizi — StrictMode + ErrorBoundary
├── App.jsx         Sahifalar va ilova qobig'i
│
├── theme.jsx       Ranglar, global CSS, oyna animatsiyalari
├── api.js          Server bilan muloqot, ApiError, haptika
├── core.js         Sof mantiq (karta holati, sana, zaxira) — testlanadi
├── logger.js       Xatolarni yig'ish (Telegram'da konsol yo'q)
├── i18n.js         Tarjima lug'ati — 3 til, ~490 kalit
│
├── core.test.js    Karta holati, sana, zaxira mantiqi
├── i18n.test.js    Lug'at to'liqligi
├── ui.test.jsx     ErrorBoundary, qo'shish oqimi, sozlamalar
└── sync.test.jsx   Server bilan sinxronlash
```

## Qoidalar

**1. Tarjima — har bir foydalanuvchi matni `t("kalit")` orqali.**
Kalit qo'shish tartibi:
```js
// src/i18n.js — uchala til obyektiga ham qo'shiladi
"uz": { "my.text": "Matn" },
"ru": { "my.text": "Текст" },
"en": { "my.text": "Text" },
```
Testlar buni nazorat qiladi: `npm test` — lug'atda yetishmay qolgan
kalit bo'lsa, **test qizaradi**.

**2. Xatoni jimgina yo'qotmang.**
```js
} catch (e) { logErr("joylashuv/vaqti", e); }
```
`catch {}` yozmang. Xatolar `logger.js` da yig'iladi va xato
ekranida "Xatolar tarixi" ostida ko'rinadi.

**3. `theme.jsx` va `api.js` ni o'zgartirishdan oldin `npm test`.**
Bu ikki modul ilovaning eng barqaror qismi.

**4. Backend bilan bog'liq narsalar faqat `api.js` da.**
Server manzili, endpoint ro'yxati, haptika — hammasi shu yerda.

---

## Testlar

```bash
npm test           # barcha testlar
npm run test:watch # o'zgarish kuzatuvchisi
```

Har bir `main` ga push qilinganda **GitHub Actions** avtomatik
ishga tushiradi (`.github/workflows/ci.yml`).

### Testlar nima uchun kerak

Bu loyihada **ikki xil xato bo'lgan**:

1. `HoldBtn` ichida `const t = useRef()` — import qilingan `t()`
   tarjima funksiyasini yopib qo'ygan edi. Tugmani bosish zahoti
   ilova **"t is not a function"** bilan butunlay yiqilardi.
2. `CrashScreen` ichida `const t = themes.amoled` — xato ekranni
   ko'rsatish zahoti **o'zi** yiqilardi.

Ikkalasi ham ko'z bilan topilmagan, **test topdi**. Shu uchun
yangi komponent yozgach `npm test` ni ishga tushiring.

---

## Bundle haqida

Hozir uchta alohida chunk:

| Chunk | Hajm | Nima |
|---|---|---|
| `react` | 137 KB (gzip 44) | React + ReactDOM |
| `vendor` | 4 KB | boshqa kutubxonalar |
| `index` | 283 KB (gzip 78) | ilova kodi |

React chunk'i **o'zgarmaydi** — ilova kodi yangilanganda brauzer
keshdan oladi, faqat `index` qayta yuklanadi.

Kelinganda sahifalarni `React.lazy` bilan alohida yuklash mumkin
(bunda `index` yana ham kichrayadi), lekin buning uchun sahifalar
`pages/` papkasiga ajratilishi kerak.
