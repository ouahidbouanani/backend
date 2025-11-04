// ============================================
// controllers/FormulairesSemi/finTomoController.js
// ============================================
const prisma = require('../../config/prisma');

exports.create = async (req, res) => {
    try {
        const { id_lot, quantite, date, heure, operateur } = req.body;

        await prisma.$transaction(async (tx) => {
            await tx.fin_tomo.create({
                data: {
                    id_lot,
                    quantite,
                    date: new Date(date),
                    heure: new Date(`1970-01-01T${heure}`),
                    operateur
                }
            });

            await tx.lot_status.upsert({
                where: { id_lot: id_lot.toString() },
                update: { current_step: 'fin_tomo' },
                create: { id_lot: id_lot.toString(), current_step: 'fin_tomo', type_piece: '', revision: '' }
            });
        });

        res.status(201).json({ message: 'Fin de tomographie enregistrée et statut mis à jour' });
    } catch (err) {
        console.error('Erreur insertion fin_tomo :', err);
        res.status(500).json({ error: 'Erreur serveur lors de l\'insertion fin_tomo' });
    }
};

exports.getAll = async (req, res) => {
    try {
        const results = await prisma.fin_tomo.findMany();
        res.json(results);
    } catch (err) {
        console.error('Erreur récupération :', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

exports.getLots = async (req, res) => {
    try {
        const results = await prisma.debut_tomo.findMany({
            select: { id_lot: true }
        });
        res.json(results);
    } catch (err) {
        console.error('Erreur lors de la récupération des lots:', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};