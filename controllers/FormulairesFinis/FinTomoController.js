// ============================================
// controllers/FormulairesFinis/FinTomoController.js
// ============================================
const prisma = require('../../config/prisma');
exports.create = async (req, res) => {
    try {
        const { id, quantite, date, heure, operateur } = req.body;

        await prisma.fintomo_finis.create({
            data: {
                id, quantite,
                date: new Date(date),
                heure: new Date(`1970-01-01T${heure}`),
                operateur
            }
        });

        res.status(201).json({ message: 'Fin de tomographie enregistrée et statut mis à jour' });
    } catch (err) {
        console.error('Erreur insertion fin_tomo :', err);
        res.status(500).json({ error: 'Erreur serveur lors de l\'insertion fin_tomo' });
    }
};

exports.getAll = async (req, res) => {
    try {
        const results = await prisma.fintomo_finis.findMany();
        res.json(results);
    } catch (err) {
        console.error('Erreur récupération :', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

exports.getLots = async (req, res) => {
    try {
        const results = await prisma.debuttomo_finis.findMany({
            select: { id: true }
        });
        res.json(results);
    } catch (err) {
        console.error('Erreur lors de la récupération des lots:', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};