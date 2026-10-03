# Backend o'zgarishlarini qo'llash (premolux)

Frontend to'liq tayyor va `main` branch'ida:
- sozlamalar `/settings` bilan sinxronlanadi
- to'liq karta raqami va CVV `/cards/{id}/secret` orqali nusxalanadi
- buyurtma holati WebSocket orqali real vaqtda keladi

**Backend'ga ham shu o'zgarishlar kerak**, aks holda frontend ishlamaydi.
Men `premolux` reposiga push qila olmadim (token uchun yozish huquqi yo'q —
`403 Permission denied`), shuning uchun tayyor patch qoldirdim.

---

## 1. Reponi yuklab oling

```bash
git clone https://github.com/miuisanikita-lab/premolux.git
cd premolux
```

## 2. Patch'ni qo'llang

Bu papkada `backend-fix.patch` bor:

```bash
git apply --check backend-fix.patch   # avval tekshirish
git apply backend-fix.patch
```

Yoki to'g'ridan-to'g'ri (patch faylsiz, agar yo'q bo'lsa):

```bash
git apply < /path/to/backend-fix.patch
```

## 3. Tekshirish

```bash
python3 -m py_compile $(find app -name "*.py")
```

## 4. Yuborish

```bash
git checkout -b fix/frontend-contract
git add -A
git commit -m "Frontend integratsiyasi: secret endpoint, maxRetries, xavfsizlik"
git push origin fix/frontend-contract
```

---

## Patch nima o'zgartiradi

| # | O'zgarish | Nima uchun |
|---|---|---|
| 1 | **`GET /cards/{id}/secret`** (yangi) | Ro'yxatda raqam har doim niqoblangan. Frontend endi shu endpoint orqali to'liq 16 ta raqam va CVV ni **alohida** nusxa oladi. Faqat egasi + `mask_pan` o'chirilgan bo'lsa |
| 2 | **`maxRetries`** `StartOrderIn` ga | Frontend yuborardi, lekin maydon yo'q edi — Pydantic jimgina tashlab ketardi. Endi "Qayta urish" sozlama haqiqiy ishlaydi (`0` = bir urinish … `5` = to'liq) |
| 3 | **`/ws/orders/{id}` ga autentifikatsiya** | Endpoint **ochiq** edi — `order_id` ni bilgan har kishi boshqaning buyurtmasini kuzatishi mumkin edi. Endi `?token=<initData>` + foydalanuvchi + buyurtma egasi tekshiriladi |
| 4 | **`/debug/last-screenshot` yopildi** | Bank sahifasi surati (OTP kodi bilan) autentifikatsiyasiz berilardi. Endi faqat `ENABLE_DEBUG=true` + faqat egasi |
| 5 | **CORS cheklandi** | `allow_origins=["*"]` → `WEBAPP_ORIGINS` ro'yxati |

---

## ⚠️ `.env` ga qo'shish SHART

```bash
# Telegram WebApp qaysi manzildan ochiladi (vergul bilan)
WEBAPP_ORIGINS=https://your-sayt.vercel.app

# /debug/last-screenshot — production da YOPIQ qolishi kerak
ENABLE_DEBUG=false

# Egasi bo'lishi mumkin bo'lgan YAGONA Telegram ID
OWNER_TG_ID=8986990988

# MAJBURIY: Fernet kaliti (barcha kartalar shu kalit bilan shifrlangan)
# python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
PREMOLUX_ENC_KEY=<kalitni_here_qo_yang>
```

> **`PREMOLUX_ENC_KEY` ni o'zgartirmang!** Agar u o'zgarsa, barcha
> shifrlangan kartalar o'qilmay qoladi va `maxRetries` ishlagan taqdirda
> ham `Karta ma'lumotlari ochilmadi` xatosi chiqadi.

---

## Frontend tomonda allaqachon tayyor

| Nima | Holat |
|---|---|
| `GET/PUT /settings` | ✅ `main` da |
| `GET /cards/{id}/secret` chaqiriladi | ✅ `main` da (403 bo'lsa to'liq raqam chiqmaydi — xatosiz) |
| WebSocket `?token=` bilan | ✅ `main` da (rad etilsa polling'ga qaytadi) |
| `maxRetries` yuboriladi | ✅ `main` da |

**Muhim:** frontend yangi versiya **eskisini ko'taradi**:
- `secret` endpoint yo'q bo'lsa → ko'rsatilgan niqoblangan qiymat nusxalanadi (xato yo'q)
- WebSocket rad etilsa → avvalgi polling ishlayveradi

Ya'ni patch backendga birinchi qo'yilsa ham, keyin ham ilova buzilmaydi.
