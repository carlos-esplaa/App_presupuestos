# 🚀 Guía de despliegue GRATUITO

Esta guía despliega la app **sin coste y de forma permanente** usando tres servicios gratuitos:

| Pieza | Servicio | ¿Gratis permanente? | ¿Tarjeta? |
|---|---|---|---|
| Base de datos | **Neon** (PostgreSQL) | ✅ Sí | ❌ No |
| Backend (API) | **Render** | ✅ Sí (se duerme tras 15 min) | ❌ No |
| Frontend (web) | **Vercel** | ✅ Sí | ❌ No |

> **Nota sobre el "se duerme":** el backend gratuito de Render se duerme tras 15 min sin uso y tarda ~1 min en despertar. Para uso personal no es problema: al abrir la app, pulsa "Sincronizar ahora" y se despierta solo. La sincronización automática cada 12h no funcionará mientras esté dormido, pero el botón manual sí.

---

## Paso 0 — Generar tus credenciales (1 vez)

En tu ordenador, en la carpeta `backend`:

```bash
pip install passlib[bcrypt]
python generate_credentials.py
```

Apunta los dos valores que genera: `SECRET_KEY` y `APP_PASSWORD_HASH`. Los usarás en el Paso 2.

---

## Paso 1 — Base de datos (Neon)

1. Entra en [neon.tech](https://neon.tech) → **Sign up** con tu cuenta de GitHub (gratis, sin tarjeta)
2. **Create project** → ponle nombre "presupuesto" → región **Europe (Frankfurt)**
3. En el dashboard, copia la **Connection string** (empieza por `postgresql://...`)
   - Guárdala, es tu `DATABASE_URL`

---

## Paso 2 — Backend (Render)

1. Entra en [render.com](https://render.com) → **Sign up** con GitHub (gratis, sin tarjeta)
2. **New** → **Blueprint**
3. Conecta tu repo `App_presupuestos` → Render detecta el archivo `render.yaml` automáticamente
4. Te pedirá rellenar las variables marcadas como `sync: false`. Pon:

   | Variable | Valor |
   |---|---|
   | `DATABASE_URL` | la connection string de Neon (Paso 1) |
   | `APP_USERNAME` | `admin` (o el que quieras) |
   | `APP_PASSWORD_HASH` | el hash del Paso 0 |
   | `GOCARDLESS_SECRET_ID` | de tu cuenta GoCardless |
   | `GOCARDLESS_SECRET_KEY` | de tu cuenta GoCardless |
   | `TELEGRAM_BOT_TOKEN` | (opcional, déjalo vacío si no lo usas) |
   | `PUBLIC_URL` | lo rellenas DESPUÉS (ver abajo) |
   | `ALLOWED_ORIGINS` | lo rellenas DESPUÉS (ver abajo) |

   > `SECRET_KEY` se genera solo, no la toques.

5. **Apply** → Render construye y despliega. Te dará una URL tipo
   `https://presupuesto-backend.onrender.com`
6. Vuelve a las variables de entorno del servicio y pon:
   - `PUBLIC_URL` = esa URL de Render (sin `/` final)
   - `ALLOWED_ORIGINS` = la URL de tu frontend en Vercel (la tendrás tras el Paso 3 — vuelve a editarla luego)

---

## Paso 3 — Frontend (Vercel)

1. Entra en [vercel.com](https://vercel.com) → **Sign up** con GitHub (gratis)
2. **Add New** → **Project** → importa `App_presupuestos`
3. En **Root Directory** selecciona `frontend`
4. En **Environment Variables** añade:
   | Variable | Valor |
   |---|---|
   | `VITE_API_URL` | la URL de Render del Paso 2 (ej: `https://presupuesto-backend.onrender.com`) |
5. **Deploy** → te da una URL tipo `https://app-presupuestos.vercel.app`
6. **Vuelve a Render** (Paso 2.6) y pon esa URL de Vercel en `ALLOWED_ORIGINS`. Guarda → Render redespliega solo.

---

## Paso 4 — Conectar tu banco

1. Crea cuenta gratis en [bankaccountdata.gocardless.com](https://bankaccountdata.gocardless.com)
2. Genera `SECRET_ID` y `SECRET_KEY` → ya los pusiste en Render (Paso 2)
3. Abre tu app en Vercel, inicia sesión y sigue el onboarding para autorizar tu banco

---

## Paso 5 — Instalar en el iPhone

1. Abre **Safari** en el iPhone → ve a tu URL de Vercel
2. Botón **compartir** (cuadrado con flecha hacia arriba)
3. **Añadir a pantalla de inicio**
4. Ya tienes el icono como una app nativa, a pantalla completa

---

## Resumen del flujo de URLs

```
iPhone (Safari/PWA)
   └─> Vercel (frontend)  https://...vercel.app
          └─> Render (backend)  https://...onrender.com
                 ├─> Neon (base de datos PostgreSQL)
                 └─> GoCardless (tu banco)
```
