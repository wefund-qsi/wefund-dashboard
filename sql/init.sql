BEGIN;

-- ============================================================
-- EXTENSIONS
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- pour gen_random_uuid()

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE campagnes_statut_enum AS ENUM (
  'ACTIVE',
  'REUSSIE',
  'ECHOUEE',
  'EN_ATTENTE'
);

CREATE TYPE transactions_statut_enum AS ENUM (
  'pending',
  'captured',
  'failed'
);

-- ============================================================
-- TABLE USER
-- ============================================================

CREATE TABLE "user" (
  id UUID PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  username VARCHAR(150) UNIQUE NOT NULL
);

-- ============================================================
-- TABLE AUTH
-- ============================================================

CREATE TABLE "auth" (
  id SERIAL PRIMARY KEY,
  password TEXT NOT NULL,
  "userId" UUID UNIQUE NOT NULL,
  CONSTRAINT fk_auth_user
    FOREIGN KEY ("userId")
    REFERENCES "user"(id)
    ON DELETE CASCADE
);

-- ============================================================
-- TABLE ROLE
-- ============================================================

CREATE TABLE "role" (
  id SERIAL PRIMARY KEY,
  role VARCHAR(50) NOT NULL,
  "userId" UUID UNIQUE NOT NULL,
  CONSTRAINT fk_role_user
    FOREIGN KEY ("userId")
    REFERENCES "user"(id)
    ON DELETE CASCADE
);

-- ============================================================
-- TABLE PROJECTS
-- ============================================================

CREATE TABLE projects (
  id UUID PRIMARY KEY,
  titre VARCHAR(255) NOT NULL,
  description TEXT,
  photo VARCHAR(255),
  "porteurId" VARCHAR(100) NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLE CAMPAGNES
-- ============================================================

CREATE TABLE campagnes (
  id UUID PRIMARY KEY,
  titre VARCHAR(255) NOT NULL,
  description TEXT,
  objectif NUMERIC(12,2) NOT NULL,
  "montantCollecte" NUMERIC(12,2) NOT NULL DEFAULT 0,
  "dateFin" TIMESTAMP NOT NULL,
  statut campagnes_statut_enum NOT NULL,
  "porteurId" VARCHAR(100) NOT NULL,
  "projetId" UUID NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_campagne_projet
    FOREIGN KEY ("projetId")
    REFERENCES projects(id)
    ON DELETE CASCADE
);

-- ============================================================
-- TABLE NEWS
-- ============================================================

CREATE TABLE news (
  id UUID PRIMARY KEY,
  titre VARCHAR(255) NOT NULL,
  contenu TEXT NOT NULL,
  "campagneId" UUID NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_news_campagne
    FOREIGN KEY ("campagneId")
    REFERENCES campagnes(id)
    ON DELETE CASCADE
);

-- ============================================================
-- TABLE CONTRIBUTIONS
-- ============================================================

CREATE TABLE contributions (
  id UUID PRIMARY KEY,
  montant NUMERIC(10,2) NOT NULL,
  "campagneId" UUID NOT NULL,
  "contributeurId" UUID NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_contrib_campagne
    FOREIGN KEY ("campagneId")
    REFERENCES campagnes(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_contrib_user
    FOREIGN KEY ("contributeurId")
    REFERENCES "user"(id)
    ON DELETE CASCADE
);

-- ============================================================
-- TABLE TRANSACTIONS
-- ============================================================

CREATE TABLE transactions (
  id UUID PRIMARY KEY,
  "paymentIntentId" VARCHAR(255) NOT NULL,
  montant NUMERIC(10,2) NOT NULL,
  statut transactions_statut_enum NOT NULL,
  "contributionId" UUID UNIQUE NOT NULL,
  "contributeurId" UUID NOT NULL,
  "createdAt" TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP NOT NULL,

  CONSTRAINT fk_transaction_contribution
    FOREIGN KEY ("contributionId")
    REFERENCES contributions(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_transaction_user
    FOREIGN KEY ("contributeurId")
    REFERENCES "user"(id)
    ON DELETE CASCADE
);

-- ============================================================
-- INDEX (optionnel mais recommandé)
-- ============================================================

CREATE INDEX idx_campagnes_statut ON campagnes(statut);
CREATE INDEX idx_contributions_campagne ON contributions("campagneId");
CREATE INDEX idx_transactions_contribution ON transactions("contributionId");

COMMIT;