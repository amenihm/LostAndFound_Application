const User = require('../models/user.model');

// Récupérer tous les utilisateurs sans authentification
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find()
            .select('-password') // Exclure le mot de passe
            .sort({ createdAt: -1 }); // Trier par date de création (plus récent d'abord)

        res.status(200).json({
            success: true,
            count: users.length,
            users: users.map(user => ({
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt
            }))
        });
    } catch (error) {
        console.error('Erreur getAllUsers:', error);
        res.status(500).json({
            success: false,
            message: "Erreur lors de la récupération des utilisateurs",
            error: error.message
        });
    }
};

// Récupérer un utilisateur par ID
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Utilisateur non trouvé"
            });
        }
        res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Erreur lors de la récupération de l'utilisateur",
            error: error.message
        });
    }
};

// Mettre à jour un utilisateur
exports.updateUser = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;
        const updateData = {};

        // Vérifier et ajouter les champs à mettre à jour
        if (username) updateData.username = username;
        if (email) updateData.email = email;
        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }
        if (role) updateData.role = role;

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Utilisateur non trouvé"
            });
        }

        res.status(200).json({
            success: true,
            message: "Utilisateur mis à jour avec succès",
            user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Erreur lors de la mise à jour de l'utilisateur",
            error: error.message
        });
    }
};

// Supprimer un utilisateur
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Utilisateur non trouvé"
            });
        }

        res.status(200).json({
            success: true,
            message: "Utilisateur supprimé avec succès"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Erreur lors de la suppression de l'utilisateur",
            error: error.message
        });
    }
};