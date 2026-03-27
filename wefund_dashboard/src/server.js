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

const PORT = 3000;
app.listen(PORT, async () => {
  console.log(`Serveur de backend lancé sur http://localhost:${PORT}`);
  await logRolesFromDB();
});