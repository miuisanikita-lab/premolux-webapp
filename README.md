# premolux-webapp
## Testlar

```bash
npm test          # barcha testlarni bir marta ishga tushiradi
npm run test:watch # o'zgarish kuzatuvchisi
```

Testlar 3 faylda:
- `src/core.test.js` — karta holati, sana, zaxira nusxasi mantiqi
- `src/i18n.test.js` — tarjima lug'ati to'liqligi (3 tilda bir xil kalitlar)
- `src/ui.test.jsx` — ErrorBoundary, "qo'shish" oqimi, sozlamalar

Har bir `main` ga push qilinganda **GitHub Actions** avtomatik
test va build ishga tushiradi.

## Zaxira va tiklash

**Sozlamalar → Ma'lumot:**
- **Zaxira nusxa** — nusxa olish (clipboard'ga JSON)
- **Zaxiradan tiklash** — faylni tanlab tiklash

Tiklashdan keyin "eskiga qaytarish" oynasi chiqadi — xato bo'lsa
bir bosishda avvalgi holatga qaytadi.

## Ilova tili

O'zbekcha / Русский / English — barcha matnlar tarjima qilingan.
Tanlangan til `localStorage` da saqlanadi va qayta yuklanganda
saqlanib qoladi.
