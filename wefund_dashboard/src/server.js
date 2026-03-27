const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());

// Configuration de connexion basée sur docker-compose.yaml
// On utilise le port 5433 car c'est le port exposé sur l'hôte dans le docker-compose
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'wefund_db',
  password: 'password',
  port: 5433,
});

// Fonction pour récupérer et afficher les utilisateurs dans la console
const logUsersFromDB = async () => {
  try {
    const result = await pool.query('SELECT * FROM "role"');
    console.log('\n--- Liste des utilisateurs récupérée depuis la BDD dfsdsdsf (init.sql) ---');
    console.table(result.rows);
    console.log('------------------------------------------------------------------\n');
  } catch (err) {
    console.error('Erreur lors de la récupération des utilisateurs :', err.message);
  }
};

// Route API pour les utilisateurs
app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM "user"');
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur API :', err);
    res.status(500).send('Erreur serveur');
  }
});

const PORT = 3000;
app.listen(PORT, async () => {
  console.log(`Serveur de test lancé sur http://localhost:${PORT}`);
  await logUsersFromDB();
});