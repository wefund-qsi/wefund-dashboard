const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());

// Configuration de connexion basée sur docker-compose.yaml
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'wefund_db',
  password: 'password',
  port: 5433,
});

// Fonction pour récupérer et afficher les rôles (par exemple) dans la console
const logRolesFromDB = async () => {
  try {
    const result = await pool.query('SELECT * FROM "user"');
    console.log('\n--- Liste des rôles récupérée depuis la BDD (init.sql) ---');
    console.table(result.rows);
    console.log('----------------------------------------------------------\n');
  } catch (err) {
    console.error('Erreur lors du log des rôles :', err.message);
  }
};

// Route API pour les utilisateurs
app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM "user"');
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur API Users :', err);
    res.status(500).send('Erreur serveur');
  }
});

// Route API pour le montant total collecté sur une période
app.get('/api/stats/total-collected', async (req, res) => {
  const { startDate, endDate } = req.query;

  // Valeurs par défaut si non fournies
  const start = startDate || '2000-01-01';
  const end = endDate || new Date().toISOString().split('T')[0];

  try {
    const query = `
      SELECT SUM(montant::numeric) as total 
      FROM contributions 
      WHERE "createdAt" >= $1 AND "createdAt" <= $2
    `;
    const result = await pool.query(query, [start, end]);
    const total = parseFloat(result.rows[0].total || 0).toFixed(2);
    res.json({ total: parseFloat(total), startDate: start, endDate: end });
  } catch (err) {
    console.error('Erreur API Stats :', err);
    res.status(500).send('Erreur lors du calcul des statistiques');
  }
});

// Story 2 — Montant collecté jour par jour
app.get('/api/stats/collected-per-day', async (req, res) => {
  const { startDate, endDate } = req.query;
  const start = startDate || '2000-01-01';
  const end = endDate || new Date().toISOString().split('T')[0];
  try {
    const result = await pool.query(
      `SELECT DATE("createdAt")::text AS day, SUM(montant::numeric) AS total
       FROM contributions
       WHERE "createdAt" >= $1 AND "createdAt" <= $2
       GROUP BY DATE("createdAt")
       ORDER BY day`,
      [start, end]
    );
    res.json(result.rows.map(r => ({ day: r.day, total: parseFloat(r.total || 0) })));
  } catch (err) {
    console.error('Erreur API collected-per-day :', err);
    res.status(500).send('Erreur serveur');
  }
});

// Story 3 — Taux de succès global
app.get('/api/stats/success-rate', async (req, res) => {
  const { startDate, endDate } = req.query;
  const start = startDate || '2000-01-01';
  const end = endDate || new Date().toISOString().split('T')[0];
  try {
    const result = await pool.query(
      `SELECT COUNT(*) AS total,
              COUNT(CASE WHEN statut = 'REUSSIE' THEN 1 END) AS reussies
       FROM campagnes
       WHERE "createdAt" >= $1 AND "createdAt" <= $2`,
      [start, end]
    );
    const { total, reussies } = result.rows[0];
    const rate = parseInt(total) > 0 ? Math.round((parseInt(reussies) / parseInt(total)) * 100) : 0;
    res.json({ rate, total: parseInt(total), reussies: parseInt(reussies) });
  } catch (err) {
    console.error('Erreur API success-rate :', err);
    res.status(500).send('Erreur serveur');
  }
});

// Story 4 — Nombre de contributions jour par jour
app.get('/api/stats/contributions-per-day', async (req, res) => {
  const { startDate, endDate } = req.query;
  const start = startDate || '2000-01-01';
  const end = endDate || new Date().toISOString().split('T')[0];
  try {
    const result = await pool.query(
      `SELECT DATE("createdAt")::text AS day, COUNT(*) AS count
       FROM contributions
       WHERE "createdAt" >= $1 AND "createdAt" <= $2
       GROUP BY DATE("createdAt")
       ORDER BY day`,
      [start, end]
    );
    res.json(result.rows.map(r => ({ day: r.day, count: parseInt(r.count) })));
  } catch (err) {
    console.error('Erreur API contributions-per-day :', err);
    res.status(500).send('Erreur serveur');
  }
});

// Story 5 — Nombre moyen de contributions par campagne
app.get('/api/stats/avg-contributions-per-campaign', async (req, res) => {
  const { startDate, endDate } = req.query;
  const start = startDate || '2000-01-01';
  const end = endDate || new Date().toISOString().split('T')[0];
  try {
    const result = await pool.query(
      `SELECT AVG(contrib_count) AS avg
       FROM (
         SELECT "campagneId", COUNT(*) AS contrib_count
         FROM contributions
         WHERE "createdAt" >= $1 AND "createdAt" <= $2
         GROUP BY "campagneId"
       ) sub`,
      [start, end]
    );
    res.json({ avg: parseFloat(parseFloat(result.rows[0].avg || 0).toFixed(1)) });
  } catch (err) {
    console.error('Erreur API avg-contributions-per-campaign :', err);
    res.status(500).send('Erreur serveur');
  }
});

// Story 6 — Montant moyen par contribution
app.get('/api/stats/avg-amount-per-contribution', async (req, res) => {
  const { startDate, endDate } = req.query;
  const start = startDate || '2000-01-01';
  const end = endDate || new Date().toISOString().split('T')[0];
  try {
    const result = await pool.query(
      `SELECT AVG(montant::numeric) AS avg
       FROM contributions
       WHERE "createdAt" >= $1 AND "createdAt" <= $2`,
      [start, end]
    );
    res.json({ avg: parseFloat(parseFloat(result.rows[0].avg || 0).toFixed(2)) });
  } catch (err) {
    console.error('Erreur API avg-amount-per-contribution :', err);
    res.status(500).send('Erreur serveur');
  }
});

const PORT = 3000;
app.listen(PORT, async () => {
  console.log(`Serveur de backend lancé sur http://localhost:${PORT}`);
  await logRolesFromDB();
});