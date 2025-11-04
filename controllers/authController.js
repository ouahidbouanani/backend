const authModel = require('../models/authModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require ('dotenv').config();

const SECRET_KEY = process.env.SECRET_KEY
const register = (req, res) => {
  const { nom, email, mot_de_passe } = req.body;

  authModel.createUser(nom, email, mot_de_passe, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: 'Utilisateur créé avec succès', userId: result.insertId });
  });
};

const login = async (req, res) => {
  const { email, mot_de_passe } = req.body;

  if (!email || !mot_de_passe) {
    return res.status(400).json({ error: 'Email et mot de passe requis' });
  }

  try {
    // Recherche de l'utilisateur dans la base de données
    const result = await authModel.findUserByEmail(email);

    if (!result || result.length === 0) {
      return res.status(400).json({ error: 'Email ou mot de passe incorrect' });
    }

    const user = result[0];

    // Vérification du mot de passe avec bcrypt
    const isMatch = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
    
    if (!isMatch) {
      return res.status(400).json({ error: 'Mot de passe incorrect' });
    }
    else {
    const maxAge = 3 * 24 * 60 * 60 * 1000;
    // Génération du token JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      SECRET_KEY,
      { expiresIn: maxAge } 
    );
    res.cookie("jwt", token, { httpOnly: true, maxAge });
    // Authentification réussie avec token
    res.status(200).json({ message: 'Connexion réussie', token,  user: JSON.stringify(user)});
  }

  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};

module.exports = {
  register,
  login
};