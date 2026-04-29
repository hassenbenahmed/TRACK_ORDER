# TrackOrder

> **Recommandé (le plus simple)** : démarrer avec **Docker Compose** (backend + frontend + PostgreSQL) sans installer Maven localement.

![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4-brightgreen)
![Angular](https://img.shields.io/badge/Angular-19-red)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)
![Docker](https://img.shields.io/badge/Docker-Compose-blue)

---

## 📋 Technologies

| Couche | Technologie |
|--------|------------|
| **Backend** | Spring Boot 3.4, Java 21, Spring Security (JWT), Spring Data JPA, Spring Validation |
| **Frontend** | Angular 19, Angular Material, SCSS, Angular CDK (Drag & Drop) |
| **Base de données** | PostgreSQL 16 |
| **Paiements** | Stripe Checkout |
| **Documentation** | SpringDoc OpenAPI / Swagger UI |
| **Déploiement** | Docker, Docker Compose, Nginx, Kubernetes (Kustomize) |

---

## 🏗️ Architecture

### Vue d'ensemble

TrackOrder est une application **full-stack découplée** composée de trois couches indépendantes :

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                         │
│            Angular 19 SPA  (port 4200 dev / 80 prod)           │
│   ┌─────────────┐  ┌──────────────┐  ┌────────────────────┐   │
│   │  Features   │  │ Core         │  │ Shared             │   │
│   │ (lazy pages)│  │ Services     │  │ Layout / Components│   │
│   │             │  │ Guards       │  │                    │   │
│   │             │  │ Interceptors │  │                    │   │
│   └──────┬──────┘  └──────┬───────┘  └────────────────────┘   │
│          │  HTTP+JWT       │                                    │
└──────────┼─────────────────┼───────────────────────────────────┘
           │                 │
    Nginx reverse-proxy /api/*
           │
┌──────────▼─────────────────▼───────────────────────────────────┐
│                    BACKEND  (port 8080)                         │
│              Spring Boot 3.4  —  Java 21                       │
│  ┌──────────────┐  ┌────────────┐  ┌──────────────────────┐   │
│  │  Controllers │→ │  Services  │→ │  Repositories (JPA)  │   │
│  │  (REST API)  │  │  (Business │  │  Spring Data         │   │
│  │              │  │   Logic)   │  │                      │   │
│  └──────────────┘  └────────────┘  └──────────┬───────────┘   │
│  ┌──────────────┐  ┌────────────┐             │               │
│  │  Security    │  │  DTOs      │             │               │
│  │  JWT Filter  │  │  (records) │             │               │
│  └──────────────┘  └────────────┘             │               │
└──────────────────────────────────────────────┼────────────────┘
                                               │ JDBC
┌──────────────────────────────────────────────▼────────────────┐
│                   PostgreSQL 16  (port 5432)                   │
└────────────────────────────────────────────────────────────────┘
```

### Flux de données

1. L'utilisateur se connecte via Angular → `POST /api/auth/login` → le backend retourne un **JWT**
2. Le JWT est stocké dans `localStorage` et attaché automatiquement à chaque requête via le `JwtInterceptor`
3. Le backend valide le token dans `JwtAuthenticationFilter` avant de traiter la requête
4. Nginx (en mode Docker) sert l'Angular compilé et proxifie `/api/*` vers le backend Spring Boot

### Structure des dossiers

```
trackorder/
├── backend/                      → API REST Spring Boot (Java 21)
│   ├── src/main/java/com/trackorder/
│   │   ├── config/               → SecurityConfig, OpenApiConfig, StripeConfig
│   │   ├── controller/           → REST Controllers (Auth, Client, Commande, etc.)
│   │   ├── dto/                  → Request/Response DTOs (Java records)
│   │   ├── entity/               → JPA Entities + Enums (CommandeStatut, LivraisonStatut…)
│   │   ├── exception/            → GlobalExceptionHandler, exceptions métier
│   │   ├── repository/           → Spring Data JPA Repositories
│   │   ├── security/             → JwtTokenProvider, JwtAuthenticationFilter, UserDetails
│   │   └── service/              → Business Logic (AuthService, CommandeService, etc.)
│   ├── src/main/resources/
│   │   ├── application.yml       → Config de base (datasource, JWT, Stripe, Swagger)
│   │   ├── application-dev.yml   → Surcharge dev (DEBUG logs, ddl-auto: update)
│   │   ├── application-test.yml  → Surcharge test (ddl-auto: create-drop)
│   │   └── application-prod.yml  → Surcharge prod (WARN logs, ddl-auto: validate, Swagger désactivé)
│   ├── Dockerfile                → Build de production par défaut
│   ├── Dockerfile.dev            → Build de développement (JVM debug activé port 5005)
│   ├── Dockerfile.prod           → Multi-stage build optimisé
│   ├── Dockerfile.test           → Exécution des tests Maven
│   └── pom.xml                   → Dépendances Maven (Spring Boot, JWT, Stripe, Swagger)
│
├── frontend/                     → SPA Angular 19 (TypeScript)
│   ├── src/app/
│   │   ├── app.routes.ts         → Routes lazy-loaded protégées par authGuard
│   │   ├── core/
│   │   │   ├── services/         → AuthService, ClientService, CommandeService, etc.
│   │   │   ├── guards/           → authGuard (protège toutes les routes privées)
│   │   │   ├── interceptors/     → JwtInterceptor (injecte Bearer token), ErrorInterceptor
│   │   │   └── animations/       → Animations réutilisables (fade, stagger)
│   │   ├── features/             → Pages standalone lazy-loaded
│   │   │   ├── auth/             → Login, Register
│   │   │   ├── clients/          → List, Detail, Form
│   │   │   ├── commandes/        → List, Detail, Create (stepper)
│   │   │   ├── livraisons/       → List (Kanban), Form
│   │   │   ├── produits/         → List, Form
│   │   │   ├── transporteurs/    → List, Form
│   │   │   ├── paiements/        → List, Success, Cancel (Stripe redirect)
│   │   │   └── dashboard/        → KPIs animés + graphiques
│   │   ├── shared/
│   │   │   ├── layout/           → MainLayout, Sidebar, Topbar
│   │   │   └── components/       → ConfirmDialog, EmptyState, KpiCard, StatusBadge, Timeline…
│   │   └── models/               → Interfaces TypeScript (Client, Commande, Livraison, etc.)
│   ├── src/environments/         → environment.ts / environment.prod.ts / environment.test.ts
│   ├── nginx.conf                → Nginx : SPA routing + reverse-proxy /api/* → backend
│   ├── Dockerfile / Dockerfile.dev / Dockerfile.prod / Dockerfile.test
│   ├── package.json              → npm scripts (start, build, test, test:ci)
│   ├── angular.json              → Configurations build (dev, test, production)
│   └── tsconfig.json             → Configuration TypeScript
│
├── kubernetes/                   → Manifestes Kubernetes (Kustomize)
│   ├── namespaces.yaml           → Namespaces trackorder-dev/test/prod
│   ├── base/                     → Ressources communes (Deployments, Services, ConfigMap, Secret, Volumes)
│   └── overlays/
│       ├── dev/                  → Surcharges dev (Recreate strategy)
│       ├── test/                 → Surcharges test (Recreate strategy)
│       └── prod/                 → Surcharges prod (RollingUpdate strategy)
│
├── docker-compose.yml            → Stack complète (db + backend + frontend)
├── docker-compose.dev.yml        → Stack dev (debug JVM activé, ng serve avec hot-reload)
├── docker-compose.test.yml       → Stack test (exécute les suites de tests)
├── docker-compose.prod.yml       → Stack prod simulée localement
├── .env.example                  → Template des variables d'environnement
└── .gitignore                    → Ignore target/, node_modules/, dist/, .env
```

---

## 🔧 Outils de build et d'exécution

| Partie | Outil | Commande principale |
|--------|-------|-------------------|
| **Backend** | Maven 3.9 + Spring Boot Plugin | `mvn spring-boot:run` |
| **Backend (package)** | Maven | `mvn clean package -DskipTests` |
| **Backend (tests)** | Maven + JUnit 5 | `mvn test` |
| **Frontend** | Angular CLI 19 | `ng serve` / `ng build` |
| **Frontend (tests)** | Karma + Jasmine | `npm test` / `npm run test:ci` |
| **Conteneurs** | Docker Compose | `docker compose up --build` |
| **Kubernetes** | kubectl + Kustomize | `kubectl apply -k kubernetes/overlays/<env>` |

---

## 🚀 Démarrage rapide

### Prérequis

- **Docker Desktop** ≥ 24 (Linux containers activés)
- **Git**

### Avec Docker (recommandé)

```bash
# 1. Cloner le projet
git clone https://github.com/hassenbenahmed/TRACK_ORDER.git
cd TRACK_ORDER

# 2. Configurer les variables d'environnement
cp .env.example .env
# Éditer .env et renseigner JWT_SECRET, DB_PASSWORD, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET

# 3. Démarrer la stack complète
docker compose up --build

# 4. Arrêter
docker compose down
```

#### URLs d'accès (docker-compose.yml par défaut)

| Service | URL |
|---------|-----|
| **Frontend** | http://localhost:4200 |
| **Backend API** | http://localhost:8081 |
| **Swagger UI** | http://localhost:8081/swagger-ui.html |
| **PostgreSQL** | localhost:5432 |

> ⚠️ Le port externe du backend est **8081** (mappé vers le port interne 8080 du conteneur).
> En mode `docker-compose.dev.yml`, le frontend tourne sur le port **4200** via `ng serve`.

### Dockerisation multi-environnements (dev / test / prod)

#### Dockerfiles backend

| Fichier | Usage |
|---------|-------|
| `backend/Dockerfile` | Build prod par défaut (multi-stage) |
| `backend/Dockerfile.dev` | Debug JVM port 5005, logs DEBUG, `spring-boot:run` |
| `backend/Dockerfile.test` | Exécute `mvn clean test` |
| `backend/Dockerfile.prod` | Image runtime allégée (JRE Alpine) |

#### Dockerfiles frontend

| Fichier | Usage |
|---------|-------|
| `frontend/Dockerfile` | Build prod + Nginx par défaut |
| `frontend/Dockerfile.dev` | `ng serve` avec hot-reload |
| `frontend/Dockerfile.test` | Exécute `npm run test:ci` (ChromeHeadless) |
| `frontend/Dockerfile.prod` | Build Angular prod + Nginx |

#### Docker Compose par environnement

```bash
# DEV  (hot-reload frontend, debug JVM backend, port debug 5005)
docker compose -f docker-compose.dev.yml up --build

# TEST (exécution automatique de tous les tests)
docker compose -f docker-compose.test.yml up --build

# PROD (simulation locale de la prod)
docker compose -f docker-compose.prod.yml up --build
```

### Développement local (sans Docker)

#### Prérequis locaux

- **Java 21** (JDK, ex : Eclipse Temurin)
- **Maven 3.9+**
- **Node.js 22+** + **npm**
- **Angular CLI 19** : `npm install -g @angular/cli`
- **PostgreSQL 16** démarré localement

#### Backend

```bash
# 1. Aller dans le dossier backend
cd backend

# 2. Copier et adapter les variables d'environnement
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=trackorder
export DB_USER=postgres
export DB_PASSWORD=your_password
export JWT_SECRET=your_very_long_secret_key_at_least_64_characters
export STRIPE_SECRET_KEY=sk_test_...
export STRIPE_WEBHOOK_SECRET=whsec_...

# 3. Lancer
mvn spring-boot:run
# → API disponible sur http://localhost:8080
# → Swagger UI : http://localhost:8080/swagger-ui.html
```

#### Frontend

```bash
# 1. Aller dans le dossier frontend
cd frontend

# 2. Installer les dépendances
npm install

# 3. Lancer le serveur de développement
ng serve
# → http://localhost:4200
```

> **Note sur les ports** : `src/environments/environment.ts` pointe par défaut sur `http://localhost:8081/api`
> (le port externe Docker du backend). En développement local **sans Docker**, Spring Boot écoute sur le
> port **8080**. Mettez alors à jour `apiUrl` dans `src/environments/environment.ts` :
>
> ```typescript
> export const environment = {
>   production: false,
>   apiUrl: 'http://localhost:8080/api'   // ← local sans Docker
> };
> ```
>
> Avec Docker (`docker compose up`), le backend est accessible sur le port **8081** (mapping Docker `8081→8080`), et `environment.ts` n'a pas besoin d'être modifié.

---

## 🔑 Variables d'environnement

| Variable | Description | Défaut (à changer en prod !) |
|----------|------------|------------------------------|
| `DB_HOST` | Hôte PostgreSQL | `localhost` |
| `DB_PORT` | Port PostgreSQL | `5432` |
| `DB_NAME` | Nom de la base | `trackorder` |
| `DB_USER` | Utilisateur DB | `postgres` |
| `DB_PASSWORD` | Mot de passe DB | `postgres` ⚠️ |
| `JWT_SECRET` | Clé secrète JWT (min 64 chars) | valeur insécurisée ⚠️ |
| `JWT_EXPIRATION` | Durée de vie du token (ms) | `86400000` (24 h) |
| `STRIPE_SECRET_KEY` | Clé secrète Stripe | `sk_test_placeholder` |
| `STRIPE_WEBHOOK_SECRET` | Secret webhook Stripe | `whsec_placeholder` |
| `SERVER_PORT` | Port du serveur Spring Boot | `8080` |
| `SPRING_PROFILES_ACTIVE` | Profil Spring actif | _(non défini = base)_ |

> Copier `.env.example` → `.env` et **ne jamais committer `.env`** (déjà dans `.gitignore`).

---

## ☸️ Kubernetes multi-environnements (Kustomize)

### Structure

```text
kubernetes/
├── namespaces.yaml
├── base/
│   ├── kustomization.yaml
│   ├── deployment-backend.yaml
│   ├── service-backend.yaml
│   ├── deployment-frontend.yaml
│   ├── service-frontend.yaml
│   ├── deployment-postgres.yaml
│   ├── service-postgres.yaml
│   ├── volume.yaml
│   ├── configmap.yaml
│   ├── secret.yaml
│   └── fluent-bit-configmap.yaml
└── overlays/
    ├── dev/
    ├── test/
    └── prod/
```

### Déploiement par namespace

```bash
kubectl apply -f kubernetes/namespaces.yaml

# Dev
kubectl apply -k kubernetes/overlays/dev

# Test
kubectl apply -k kubernetes/overlays/test

# Prod
kubectl apply -k kubernetes/overlays/prod
```

### Stratégies appliquées

- **dev/test** : `Recreate`
- **prod** : `RollingUpdate`

Le backend inclut un **pod multi-conteneurs** : conteneur API + sidecar **Fluent Bit** (logs).

---

## ☁️ Déploiement GCP (GKE + GCR)

```bash
gcloud auth login
gcloud config set project [PROJECT-ID]

docker build -f backend/Dockerfile.prod -t gcr.io/[PROJECT-ID]/trackorder-backend:prod ./backend
docker push gcr.io/[PROJECT-ID]/trackorder-backend:prod

docker build -f frontend/Dockerfile.prod -t gcr.io/[PROJECT-ID]/trackorder-frontend:prod ./frontend
docker push gcr.io/[PROJECT-ID]/trackorder-frontend:prod

gcloud container clusters create [CLUSTER_NAME] --num-nodes=3
gcloud container clusters get-credentials [CLUSTER_NAME]

kubectl apply -f kubernetes/namespaces.yaml
kubectl apply -k kubernetes/overlays/prod

kubectl get pods -n trackorder-prod
kubectl get services -n trackorder-prod
```

---

## 📡 API Endpoints principaux

| Méthode | Endpoint | Description | Auth requise |
|---------|----------|-------------|-------------|
| `POST` | `/api/auth/register` | Inscription | Non |
| `POST` | `/api/auth/login` | Connexion | Non |
| `GET/POST` | `/api/clients` | CRUD Clients | JWT |
| `GET/POST` | `/api/produits` | CRUD Produits | JWT |
| `GET/POST` | `/api/commandes` | CRUD Commandes | JWT |
| `PUT` | `/api/commandes/{id}/valider` | Valider une commande | JWT |
| `PUT` | `/api/commandes/{id}/annuler` | Annuler une commande | JWT |
| `GET/POST` | `/api/livraisons` | CRUD Livraisons | JWT |
| `PUT` | `/api/livraisons/{id}/statut` | Changer statut livraison | JWT |
| `GET/POST` | `/api/transporteurs` | CRUD Transporteurs | JWT |
| `POST` | `/api/paiements/checkout/{id}` | Créer session Stripe | JWT |
| `GET` | `/api/dashboard/stats` | Stats dashboard | JWT |

📖 Documentation complète : [Swagger UI](http://localhost:8081/swagger-ui.html)

---

## 🎨 Design

- **Palette** : Bleu nuit `#1B2A4A` + Orange `#FF6B35`
- **Typographie** : Inter (Google Fonts)
- **Composants** : Angular Material avec thème custom
- **Animations** : Fade-in, stagger, skeleton shimmer, drag & drop Kanban
- **Responsive** : Desktop, Tablet, Mobile

---

## 📦 Fonctionnalités

- ✅ Authentification JWT (register/login)
- ✅ Gestion des clients (CRUD, historique commandes)
- ✅ Catalogue produits (grille/liste, gestion stock, alertes stock bas)
- ✅ Commandes (stepper de création, validation, annulation, réincrément stock)
- ✅ Livraisons (vue Kanban drag & drop, timeline, calcul note transporteur)
- ✅ Paiements Stripe (checkout redirect, webhooks, remboursements)
- ✅ Dashboard interactif (KPIs animés, graphiques, commandes récentes)
- ✅ Rôles ADMIN / USER
- ✅ API documentée Swagger
- ✅ Déploiement Docker Compose

---

## ⚠️ Points d'architecture et améliorations suggérées

### 🔴 Problèmes critiques

| # | Problème | Localisation | Recommandation |
|---|---------|--------------|----------------|
| 1 | **Aucun test unitaire ou d'intégration** | `backend/src/test/` vide, pas de `*.spec.ts` frontend | Ajouter des tests JUnit 5 (backend) et Jasmine/Karma (frontend) |
| 2 | **`ddl-auto: update` en production** | `application.yml` (base) | Utiliser `validate` en prod et adopter **Flyway** ou **Liquibase** pour les migrations versionnées |
| 3 | **Secrets par défaut exposés** | `application.yml`, `docker-compose.yml` | Ne jamais mettre de secrets en dur ; forcer les variables d'environnement obligatoires |

### 🟠 Améliorations importantes

| # | Problème | Localisation | Recommandation |
|---|---------|--------------|----------------|
| 4 | **Aucun pipeline CI/CD** | Pas de `.github/workflows/` | Ajouter GitHub Actions : lint → test → build Docker → push image |
| 5 | **Aucun linter frontend** | `package.json` (pas d'ESLint) | Ajouter `@angular-eslint` : `ng add @angular-eslint/schematics` |
| 6 | **Aucun linter backend** | `pom.xml` (pas de Checkstyle/SpotBugs) | Ajouter le plugin Maven Checkstyle ou SpotBugs |
| 7 | **Incohérence de ports dans la doc** | Ancien README mentionnait `:8080` comme port externe | Le port externe Docker est **8081** (backend) et **4200** (frontend) |

### 🟡 Améliorations secondaires

| # | Problème | Localisation | Recommandation |
|---|---------|--------------|----------------|
| 8 | **Pas de rate limiting sur `/api/auth`** | `SecurityConfig` | Ajouter un bucket4j ou Spring Cloud Gateway rate limiter sur les endpoints d'auth |
| 9 | **`show-sql: true` en base** | `application.yml` | Désactiver en prod (déjà géré dans `application-prod.yml`, mais le défaut devrait être `false`) |
| 10 | **Pas de health endpoint Actuator** | `pom.xml` | Ajouter `spring-boot-starter-actuator` pour les probes Kubernetes `/actuator/health` |
| 11 | **Refresh token absent** | `AuthService` (frontend), `JwtTokenProvider` | Implémenter un mécanisme de refresh token pour éviter les déconnexions fréquentes |
| 12 | **`localStorage` pour le JWT** | `AuthService.storeAuth()` | Préférer `httpOnly` cookies pour réduire l'exposition aux attaques XSS |

### 💡 Pipeline CI/CD suggéré (GitHub Actions)

```yaml
# Exemple de structure .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  backend-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with: { java-version: '21', distribution: 'temurin' }
      - run: cd backend && mvn verify

  frontend-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '22' }
      - run: cd frontend && npm ci && npm run test:ci

  docker-build:
    needs: [backend-test, frontend-test]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: docker compose -f docker-compose.prod.yml build
```

---

## 👥 Auteur

Projet TrackOrder — Système de Gestion des Commandes & Livraisons

