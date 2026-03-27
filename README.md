# wefund-dashboard
Dashboard de suivi SI — TypeScript / React / Recharts


npm install

lancer le serveur : node src/server.js

lancer le dashboard : npm run start



lancer le docker : sudo docker compose up postgres


insérer les données : 
cat init.sql | sudo docker exec -i we-fund-db psql -U postgres -d wefund_db
cat seed.sql | sudo docker exec -i we-fund-db psql -U postgres -d wefund_db