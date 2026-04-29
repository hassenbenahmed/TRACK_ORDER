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
| **Frontend** | Angular 19, Angular Material, SCSS, Angular CDK (Drag & Drop), ngx-charts |
| **Base de données** | PostgreSQL 16 |
| **Paiements** | Stripe Checkout |
| **Documentation** | SpringDoc OpenAPI / Swagger UI |
| **Déploiement** | Docker, Docker Compose, Nginx |

---

## 🏗️ Architecture

```
trackorder/
├── backend/          → API REST Spring Boot
│   ├── config/       → Security, Swagger, Stripe, CORS
│   ├── controller/   → REST Controllers
│   ├── dto/          → Request/Response DTOs (Java records)
│   ├── entity/       → JPA Entities + Enums
│   ├── exception/    → Global Exception Handler
│   ├── repository/   → Spring Data JPA Repositories
│   ├── security/     → JWT Provider, Filters, UserDetails
│   └── service/      → Business Logic
├── frontend/         → SPA Angular
│   ├── core/         → Services, Guards, Interceptors, Animations
│   ├── shared/       → Layout (Sidebar, Topbar), Composants réutilisables
│   ├── features/     → Pages lazy-loaded (Dashboard, Commandes, Livraisons...)
│   └── models/       → Interfaces TypeScript
├── docker-compose.yml
└── README.md
```

---

## 🚀 Démarrage rapide

### Avec Docker (recommandé)

#### Prérequis

- Installer **Docker Desktop** (avec le support des conteneurs Linux) et vérifier que Docker est démarré.

#### Lancer (Windows PowerShell)

```powershell
Set-Location "C:\Users\MSI\Desktop\intelijspring project\trackorder"
docker-compose up --build
```

#### Arrêter

```powershell
Set-Location "C:\Users\MSI\Desktop\intelijspring project\trackorder"
docker-compose down
```

- **Frontend** : http://localhost
- **Backend API** : http://localhost:8080
- **Swagger UI** : http://localhost:8080/swagger-ui.html

### Dockerisation multi-environnements (dev / test / prod)

Le projet inclut maintenant des Dockerfiles et des compose dédiés par environnement.

#### Dockerfiles backend

- `backend/Dockerfile.dev` : debug JVM activé, logs détaillés, exécution `spring-boot:run`
- `backend/Dockerfile.test` : exécution des tests backend (`mvn clean test`)
- `backend/Dockerfile.prod` : image runtime allégée (multi-stage build)

#### Dockerfiles frontend

- `frontend/Dockerfile.dev` : `ng serve` avec auto-reload
- `frontend/Dockerfile.test` : exécution des tests frontend (`npm run test:ci`)
- `frontend/Dockerfile.prod` : build Angular prod + Nginx

#### Docker Compose par environnement

- `docker-compose.dev.yml`
- `docker-compose.test.yml`
- `docker-compose.prod.yml`

Exemples:

```bash
# DEV
docker compose -f docker-compose.dev.yml up --build

# TEST
docker compose -f docker-compose.test.yml up --build

# PROD (simulation locale)
docker compose -f docker-compose.prod.yml up --build
```

### Développement local

**Backend** :
```bash
cd backend
# PostgreSQL doit tourner localement
mvn spring-boot:run
```

**Frontend** :
```bash
cd frontend
npm install
ng serve
```

---

## ☸️ Kubernetes multi-environnements (Kustomize)

Structure ajoutée:

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

Le backend inclut un **pod multi-conteneurs**: conteneur API + sidecar **Fluent Bit** (logs).

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

## 🔑 Variables d'environnement

| Variable | Description | Défaut |
|----------|------------|--------|
| `DB_HOST` | Hôte PostgreSQL | `localhost` |
| `DB_PORT` | Port PostgreSQL | `5432` |
| `DB_NAME` | Nom de la base | `trackorder` |
| `DB_USER` | Utilisateur DB | `postgres` |
| `DB_PASSWORD` | Mot de passe DB | `postgres` |
| `JWT_SECRET` | Clé secrète JWT (min 64 chars) | - |
| `STRIPE_SECRET_KEY` | Clé secrète Stripe | - |
| `STRIPE_WEBHOOK_SECRET` | Secret webhook Stripe | - |

---

## 📡 API Endpoints principaux

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `POST` | `/api/auth/register` | Inscription |
| `POST` | `/api/auth/login` | Connexion |
| `GET/POST` | `/api/clients` | CRUD Clients |
| `GET/POST` | `/api/produits` | CRUD Produits |
| `GET/POST` | `/api/commandes` | CRUD Commandes |
| `PUT` | `/api/commandes/{id}/valider` | Valider une commande |
| `PUT` | `/api/commandes/{id}/annuler` | Annuler une commande |
| `GET/POST` | `/api/livraisons` | CRUD Livraisons |
| `PUT` | `/api/livraisons/{id}/statut` | Changer statut livraison |
| `GET/POST` | `/api/transporteurs` | CRUD Transporteurs |
| `POST` | `/api/paiements/checkout/{id}` | Créer session Stripe |
| `GET` | `/api/dashboard/stats` | Stats dashboard |

📖 Documentation complète : [Swagger UI](http://localhost:8080/swagger-ui.html)

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

## 👥 Auteur

Projet TrackOrder — Système de Gestion des Commandes & Livraisons

