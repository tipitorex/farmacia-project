# Sistema de Informacion - Monorepo

Base inicial para un sistema de informacion con:

- Backend: Django + Python
- Frontend web: React + JavaScript + Tailwind CSS
- Mobile: Flutter
- Base de datos: PostgreSQL
- Contenedores: Docker + Docker Compose

## Estructura

```text
.
|-- backend/
|   |-- Dockerfile
|   |-- requirements.txt
|   |-- entrypoint.sh
|   `-- src/
|-- frontend/
|   |-- Dockerfile
|   |-- package.json
|   |-- tailwind.config.js
|   `-- src/
|-- mobile/
|   `-- README.md
|-- docker-compose.yml
`-- .env.example
```

## 1) Preparar variables

1. Copia `.env.example` a `.env`.
2. Ajusta valores de credenciales y puertos.

## 2) Levantar backend + frontend + postgres

```bash
docker compose up --build
```

Servicios:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8000`
- Health backend: `http://localhost:8000/api/health/`
- Postgres: `localhost:5432`

## 3) Comandos utiles

Migraciones Django:

```bash
docker compose exec backend python manage.py makemigrations
docker compose exec backend python manage.py migrate
```

Crear superusuario:

```bash
docker compose exec backend python manage.py createsuperuser
```

## 4) Inicializar Flutter (mobile)

Dentro de `mobile/` ejecuta:

```bash
flutter create .
flutter run

```
superusuario:
username: admin
email: admin@gmail.com
password: admin123