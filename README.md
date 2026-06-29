# Presupuesto Personal

App de gestión de presupuesto personal con sincronización bancaria automática (GoCardless/PSD2), clasificación de transacciones, alertas Telegram y PWA instalable en iPhone.

## Stack

- **Backend**: FastAPI + SQLAlchemy + SQLite + APScheduler
- **Frontend**: React 18 + Vite + Tailwind CSS (diseño iOS)
- **Banco**: GoCardless Bank Account Data API (PSD2, gratuito para uso personal)
- **Notificaciones**: Telegram Bot

---

## Inicio rápido (local)

### 1. Clonar el repositorio

```bash
git clone https://github.com/carlos-esplaa/App_presupuestos.git
cd App_presupuestos
```

### 2. Configurar el backend

```bash
cd backend

# Generar credenciales de acceso
pip install passlib[bcrypt]
python generate_credentials.py

# Crear el .env a partir del ejemplo
cp .env.example .env
# Edita .env con los valores generados y tus credenciales de GoCardless
```

### 3. Arrancar el backend

```bash
pip install -r requirements.txt
python run.py
# API disponible en http://localhost:8000
# Docs interactivos en http://localhost:8000/docs
```

### 4. Arrancar el frontend

```bash
cd ../frontend
npm install
npm run dev
# App disponible en http://localhost:5173
```

---

## Despliegue en producción (iPhone como PWA)

### Requisitos
- VPS con Docker (Hetzner, DigitalOcean, etc. — desde 4€/mes)
- Dominio propio con certificado HTTPS (obligatorio para PWA y GoCardless)

### Pasos

**1. Preparar el servidor**
```bash
apt install docker.io docker-compose nginx certbot python3-certbot-nginx

# Obtener certificado SSL gratuito
certbot --nginx -d tu-dominio.com
```

**2. Configurar variables de entorno**
```bash
# En el servidor, crea backend/.env con:
PUBLIC_URL=https://tu-dominio.com
ALLOWED_ORIGINS=https://tu-dominio.com
SECRET_KEY=<generado con generate_credentials.py>
APP_USERNAME=admin
APP_PASSWORD_HASH=<generado con generate_credentials.py>
GOCARDLESS_SECRET_ID=<de tu cuenta GoCardless>
GOCARDLESS_SECRET_KEY=<de tu cuenta GoCardless>
TELEGRAM_BOT_TOKEN=<opcional>
```

**3. Arrancar con Docker Compose**
```bash
PUBLIC_URL=https://tu-dominio.com docker-compose up -d
```

**4. Instalar en iPhone**
1. Abre Safari en tu iPhone → `https://tu-dominio.com`
2. Toca el botón compartir (cuadrado con flecha)
3. "Añadir a pantalla de inicio"
4. La app se instala como nativa (pantalla completa, sin barra de Safari)

---

## Conectar tu banco (GoCardless)

1. Crea una cuenta gratuita en [bankaccountdata.gocardless.com](https://bankaccountdata.gocardless.com)
2. Genera tus credenciales `SECRET_ID` y `SECRET_KEY`
3. En la app: ve a Ajustes → Sincronización → sigue el flujo de onboarding
4. Autoriza el acceso a tu banco (proceso guiado por GoCardless)
5. La sincronización automática se ejecuta cada 12h

**Bancos españoles soportados**: CaixaBank, BBVA, Santander, ING, Openbank, N26, Revolut, y más de 2.500 entidades europeas.

---

## Funcionalidades

- **Dashboard**: resumen del ciclo de presupuesto actual, progreso por categorías
- **Transacciones**: listado completo con filtros, reclasificación manual tocando la categoría
- **Ciclos automáticos**: nuevo ciclo cada vez que se detecta una nómina
- **Categorías**: gestión completa (crear, editar, eliminar), límites mensuales personalizables
- **Alertas Telegram**: al 50%, 80% y 100% del presupuesto, y gastos grandes
- **PWA**: instalable en iPhone/Android, funciona sin conexión para datos cacheados

---

## Variables de entorno

| Variable | Descripción | Requerida |
|---|---|---|
| `SECRET_KEY` | Clave para firmar tokens JWT | ✅ |
| `APP_USERNAME` | Usuario de acceso | ✅ |
| `APP_PASSWORD_HASH` | Hash bcrypt de la contraseña | ✅ |
| `PUBLIC_URL` | URL pública del backend (para GoCardless) | ✅ en producción |
| `GOCARDLESS_SECRET_ID` | ID de API de GoCardless | Para conectar banco |
| `GOCARDLESS_SECRET_KEY` | Clave de API de GoCardless | Para conectar banco |
| `TELEGRAM_BOT_TOKEN` | Token del bot de Telegram | Opcional |
| `SALARY_MIN_AMOUNT` | Importe mínimo para detectar nómina (€) | Opcional (1500) |
| `EXPENSE_ALERT_THRESHOLD` | Umbral de gasto grande para alertar (€) | Opcional (100) |
| `SYNC_INTERVAL_HOURS` | Cada cuántas horas sincronizar con el banco | Opcional (12) |
