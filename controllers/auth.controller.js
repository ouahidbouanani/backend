const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const transporter = require('../config/mailer');

exports.register = async (req, res) => {
    try {
        const { nom, prenom, email, password } = req.body;

        if (!email.endsWith('@treefrog.fr')) {
            return res.status(400).json({ error: 'Email non autorisé.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.users.create({
            data: { nom, prenom, email, password: hashedPassword }
        });

        const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });

        const mailOptions = {
            from: '"FrogBox" <noreply@frogbox.com>',
            to: email,
            subject: 'Validez votre compte FrogBox',
            html: `
                <p>Bonjour ${prenom},</p>
                <p>Merci de vous être inscrit. Cliquez sur le lien ci-dessous pour valider votre compte :</p>
                <p>
                    <a href="http://localhost:3000/api/auth/verify-email?token=${token}">
                        Valider mon compte
                    </a>
                </p>
            `
        };

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) return res.status(500).json({ message: 'Erreur envoi email.' });
            res.status(200).json({ message: 'Inscription réussie. Vérifiez votre boîte mail.' });
        });
    } catch (err) {
        if (err.code === 'P2002') {
            return res.status(400).json({ message: 'Email déjà utilisé.' });
        }
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};

exports.verifyEmail = async (req, res) => {
    try {
        const { token } = req.query;

        if (!token) {
            return res.status(400).json({ message: 'Token manquant.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const email = decoded.email;

        const result = await prisma.users.updateMany({
            where: { email },
            data: { is_verified: true }
        });

        if (result.count === 0) {
            return res.status(404).json({ message: 'Utilisateur non trouvé.' });
        }

        res.status(200).json({ message: 'Email vérifié avec succès.' });
    } catch (err) {
        if (err.name === 'JsonWebTokenError') {
            return res.status(400).json({ message: 'Lien invalide ou expiré.' });
        }
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.users.findUnique({
            where: { email }
        });

        if (!user) return res.status(401).json({ error: 'Email invalide' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: 'Mot de passe invalide' });

        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            message: 'Connexion réussie',
            token,
            user: {
                nom: user.nom,
                prenom: user.prenom,
                email: user.email
            }
        });
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

exports.protectedRoute = (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Non autorisé' });

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ error: 'Token invalide' });
        res.json({ message: 'Contenu protégé', user: decoded });
    });
};