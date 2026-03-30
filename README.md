# wefund-dashboard

Dashboard de suivi des indicateurs de performance de la plateforme WeFund.
Visualise en temps réel les métriques de collecte et de contribution via un filtre de période partagé.

**Stack :** Angular 21 (SSR) · Express.js · PostgreSQL

---

## Architecture

```
Navigateur
    │
    ▼
:4000  Serveur Angular SSR        (src/server.ts)
    │   ├── /* → rendu Angular    (src/app/)
    │   └── /api/* → proxy
    │               │
    ▼               ▼
:3000  API Express                (server/index.js)
                    │
                    ▼
             PostgreSQL           (géré par le repo env parent)
```

Le frontend appelle uniquement `/api/stats/...` (chemin relatif).
Le serveur SSR proxifie ces requêtes vers l'API Express en interne — aucun CORS, un seul port exposé.

---

## Ports

| Service      | Port | Exposé |
|---|---|---|
| Angular SSR  | 4000 | Oui    |
| API Express  | 3000 | Non (interne au container) |

---

## Prérequis

- Node.js 20+
- PostgreSQL accessible (via Docker ou local)

---

## Installation

```bash
npm install
```

---

## Développement local

**1. Lancer la base de données**

La base PostgreSQL est gérée par le repo env parent (`docker compose up postgres`).

Pour insérer les données :
```bash
cat sql/init.sql | docker exec -i we-fund-db psql -U postgres -d wefund_db
cat sql/seed.sql | docker exec -i we-fund-db psql -U postgres -d wefund_db
```

**2. Lancer l'API Express**
```bash
node server/index.js
```

**3. Lancer le frontend Angular**
```bash
npm start
```

Le proxy (`proxy.conf.json`) redirige automatiquement `/api/*` → `localhost:3000` en développement.

---

## Variables d'environnement

### API Express (`server/index.js`)

| Variable          | Défaut      | Description                    |
|---|---|---|
| `DATABASE_HOST`   | `localhost` | Hôte PostgreSQL                |
| `DATABASE_PORT`   | `5433`      | Port PostgreSQL                |
| `DATABASE_USER`   | `postgres`  | Utilisateur PostgreSQL         |
| `DATABASE_PASSWORD` | `password` | Mot de passe PostgreSQL       |
| `DATABASE_NAME`   | `wefund_db` | Nom de la base de données      |

### Serveur SSR Angular (`src/server.ts`)

| Variable  | Défaut                  | Description                              |
|---|---|---|
| `PORT`    | `4000`                  | Port d'écoute du serveur SSR             |
| `API_URL` | `http://localhost:3000` | URL de l'API Express (proxy destination) |

---

## Tests

```bash
npm test
```

29 tests unitaires couvrant :
- `IndicatorService` — mapping des réponses API, gestion d'erreurs HTTP
- `DashboardComponent` — formatage des KPIs, structure des cartes, signaux

---

## Routes API

Toutes les routes acceptent les paramètres optionnels `?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`.
Sans paramètres, la période couvre toutes les données disponibles.

| Méthode | Route | Description | Réponse |
|---|---|---|---|
| GET | `/api/stats/total-collected` | Montant total collecté sur la période | `{ total, startDate, endDate }` |
| GET | `/api/stats/collected-per-day` | Montant collecté par jour (jours à 0 inclus) | `[{ day, total }]` |
| GET | `/api/stats/success-rate` | Taux de succès des campagnes | `{ rate, total, reussies }` |
| GET | `/api/stats/contributions-per-day` | Nombre de contributions par jour (jours à 0 inclus) | `[{ day, count }]` |
| GET | `/api/stats/avg-contributions-per-campaign` | Moyenne de contributions par campagne | `{ avg }` |
| GET | `/api/stats/avg-amount-per-contribution` | Montant moyen par contribution | `{ avg }` |

---

## Structure du projet

```
wefund-dashboard/
├── src/
│   ├── app/
│   │   ├── components/dashboard/   # Composant principal du dashboard
│   │   ├── services/               # IndicatorService (appels API)
│   │   ├── environments/           # Config dev / production
│   │   └── app.ts, app.html, ...   # Composant racine
│   ├── server.ts                   # Serveur SSR Angular + proxy /api
│   └── main.ts
├── server/
│   └── index.js                    # API Express (stats PostgreSQL)
├── sql/
│   ├── init.sql                    # Schéma de la base de données
│   └── seed.sql                    # Données de test
├── Dockerfile
└── proxy.conf.json                 # Proxy dev (ng serve → Express)
```
