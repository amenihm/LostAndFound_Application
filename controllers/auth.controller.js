const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Inscription
exports.signup = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        // Vérifier si l'utilisateur existe déjà
        const userExists = await User.findOne({ 
            $or: [{ email }, { username }] 
        });

        if (userExists) {
            return res.status(400).json({
                success: false,
                message: "L'email ou le nom d'utilisateur existe déjà"
            });
        }

        // Hasher le mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // Créer un nouvel utilisateur
        const user = new User({
            username,
            email,
            password: hashedPassword,
            role: role || 'user'
        });

        await user.save();

        res.status(201).json({
            success: true,
            message: "Utilisateur créé avec succès",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Erreur signup:', error);
        res.status(500).json({
            success: false,
            message: "Erreur lors de la création de l'utilisateur",
            error: error.message
        });
    }
};

// Connexion
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Vérifier si l'utilisateur existe
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Utilisateur non trouvé"
            });
        }

        // Vérifier le mot de passe
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({
                success: false,
                message: "Mot de passe incorrect"
            });
        }

        // Créer le token JWT
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET || 'votre_jwt_secret',
            { expiresIn: '24h' }
        );

        res.status(200).json({
            success: true,
            message: "Connexion réussie",
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Erreur login:', error);
        res.status(500).json({
            success: false,
            message: "Erreur lors de la connexion",
            error: error.message
        });
    }
};