# wefund-dashboard

Dashboard de suivi des indicateurs de performance — Angular / Express / PostgreSQL

## Prérequis

- Node.js
- Docker (géré par le repo env parent)

## Installation

```bash
npm install
```

## Lancer le projet

**Backend API :**
```bash
node server/index.js
```

**Frontend Angular :**
```bash
npm start
```

## Base de données

La base PostgreSQL est gérée par le `docker-compose` du repo env parent.

Pour insérer les données manuellement :
```bash
cat sql/init.sql | docker exec -i we-fund-db psql -U postgres -d wefund_db
cat sql/seed.sql | docker exec -i we-fund-db psql -U postgres -d wefund_db
```
