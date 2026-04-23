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

