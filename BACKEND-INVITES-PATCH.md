# Backend o'zgarishini qo'llash: taklif kodini serverda yaratish

## Nima uchun kerak

Sizning talab bo'yicha oqim shunday bo'lishi kerak:

```
loading -> majburiy obuna -> KOD (owner beradi) -> ilova
```

**Muammo:** `/auth/join` kodni bazadagi `invite_codes` jadvalidan
izlaydi, lekin backendda kod **yaratish** yo'li umuman yo'q edi.
Frontend esa kodni faqat `localStorage` da yaratardi.

Natijada: owner brauzerida kod ko'rinardi, lekin boshqa odam shu kodni
kiritganda `/auth/join` **"Kod noto'g'ri"** deb rad etardi — ya'ni
berilgan kod hech qachon ishlamagan.

**Yechim:** `POST /auth/invites` — faqat owner ishlatadi, serverda
haqiqiy kod yaratadi. Keyin boshqa odam kiritganda topiladi va
`used=True` bo'lib **bir martalik** sarflanadi.

## ⚠️ Oldin bilib oling

Bu backendga **yozish huquqi yo'q** bo'lgani uchun men tayyor patch
qoldirdim. Sizning akkauntingiz bilan qo'llashingiz kerak.

---

## 1. Reponi yuklab oling

```bash
git clone https://github.com/miuisanikita-lab/premolux.git
cd premolux
```

## 2. Patch'ni qo'llang

Bu papkada `backend-invites.patch` bor:

```bash
git apply --check backend-invites.patch   # avval tekshirish
git apply backend-invites.patch
```

## 3. Tekshirish

```bash
python3 -m py_compile $(find app -name "*.py")
rg "auth/invites" app/main.py            # /auth/invites ko'rinishi kerak
```

## 4. Yuborish

```bash
git checkout -b feat/invite-codes
git add -A
git commit -m "Taklif kodlarini serverda yaratish: POST /auth/invites"
git push origin feat/invite-codes
```

Keyin **Pull Request** oching va `main` ga merge qiling — Render
avtomatik qayta deploy qiladi (`autoDeploy: yes, trigger: commit`).

## 5. Deploy'dan keyin tekshirish

```bash
curl -X POST https://premolux-beckend.onrender.com/auth/invites \
  -H "Content-Type: application/json" -d '{"kind":"worker"}'
```

Kutilayotgan javob **401** — "Telegram orqali ochilishi kerak".
Bu **to'g'ri** belgi: endpoint ishlayapti, faqat Telegram imzosi
kerak. `404` chiqsa — patch qo'llanmagan.

---

## Patch nima qo'shadi

| # | O'zgarish | Nima uchun |
|---|---|---|
| 1 | **`app/api/routes/invites_router.py`** (yangi) | `POST /auth/invites` — owner uchun haqiqiy kod yaratish |
| 2 | **`app/main.py`** — router ulanadi | `/auth` prefiksi bilan ulanadi |

Endpoint `kind` bo'yicha kod yaratadi:
- `partner` → `PLXAB12CD34EF56`
- `worker`  → `PLWAB12CD34EF56`

### Nima uchun kod chiziqchasiz saqlanadi

Backend `InviteCode.code == payload.code` bilan **oddiy `==`** orqali
solishtiradi. Frontend esa kiritilgan kodni tozalab (`normCode`)
chiziqchalarsiz yuboradi. Agar bazada chiziqchali saqlansa, **hech
qanday kod hech qachon topilmasdi**.

Chiziqchalar faqat **ko'rsatish** uchun — frontend ularni qo'yadi.
Shuning uchun `PLW` prefiksi ham saqlanadi (ishchi kodi `PLX` emas).

## Xavfsizlik

- Faqat **owner** (`OWNER_TG_ID`) kod yaratadi — boshqalar 403 oladi
- `get_current_user` Telegram imzosini tekshiradi
- `kind` faqat `worker` yoki `partner` bo'lishi mumkin
- Bir so'rovda ko'pi bilan 20 ta kod

## Eski kodlar haqida

Ilova **buzilmaydi**. Endpoint yo'q bo'lsa yoki server o'chgan
bo'lsa, frontend mahalliy rejimga qaytadi va owner ga ogohlantirish
ko'rsatadi: *"bu kod faqat SHU qurilmada ishlaydi"*.
