const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');

// Configuration dotenv
dotenv.config();

const app = express();

// Middleware pour parser le JSON
app.use(express.json());

// Configuration des routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Connexion MongoDB
mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/auth_db")
    .then(() => console.log('Connecté à MongoDB'))
    .catch(err => console.error('Erreur MongoDB:', err));

// Route de test
app.get('/', (req, res) => {
    res.json({ message: "API fonctionne" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});