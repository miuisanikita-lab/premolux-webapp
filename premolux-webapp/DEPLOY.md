# PremoLux WebApp — Vercel orqali joylashtirish

## 1. GitHub'ga yuklash

Bu papkadagi barcha fayllarni yangi GitHub repo'ga yuklang
(xuddi Relay ilovasi bilan qilganingizdek):

```
package.json
vite.config.js
index.html
src/
  main.jsx
  App.jsx
.gitignore
```

**Muhim:** `node_modules` va `dist` papkalarini yuklamang — ular kerak
emas, Vercel o'zi yaratadi.

## 2. Vercel orqali deploy

1. [vercel.com](https://vercel.com) da hisob oching (GitHub orqali
   kirish eng oson — "Continue with GitHub")
2. **"Add New" → "Project"**
3. GitHub repo'yingizni tanlang, **"Import"**
4. Vercel avtomatik "Vite" ekanini aniqlaydi — hech narsa
   o'zgartirmasdan **"Deploy"** bosing
5. 1-2 daqiqada tayyor bo'ladi, sizga HTTPS havola beriladi:
   ```
   https://premolux-webapp.vercel.app
   ```

## 3. Botga ulash

@BotFather ga o'ting:

```
/mybots → botingizni tanlang →
Bot Settings → Menu Button →
Edit Menu Button URL

Yoki: /setmenubutton buyrug'i
orqali ham sozlash mumkin
```

Vercel bergan havolani shu yerga kiriting. Endi botingizda
"Menu" tugmasi bosilganda — to'liq, haqiqiy WebApp ochiladi,
Telegram ichida, barcha animatsiya va haptik javob bilan.

## Backend ulash (keyinroq)

Backend server tayyor bo'lganda, `src/App.jsx` faylida:

```js
const API_BASE = "https://sizning-backend-manzilingiz";
const MOCK = false;
```

qatorlarini o'zgartirib, qayta GitHub'ga yuklang — Vercel
avtomatik qayta deploy qiladi (har push'da o'zi yangilanadi).
