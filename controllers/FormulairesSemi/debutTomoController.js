// ============================================
// controllers/FormulairesSemi/debutTomoController.js
// ============================================
const prisma = require('../../config/prisma');

exports.create = async (req, res) => {
    try {
        const {
            id_lot, nb_pieces, etage, date, heure_debut, operateur,
            num_machine, version, separation, commentaire
        } = req.body;

        await prisma.$transaction(async (tx) => {
            await tx.debut_tomo.create({
                data: {
                    id_lot: id_lot.toString(),
                    nb_pieces, etage,
                    date: new Date(date),
                    heure_debut: new Date(`1970-01-01T${heure_debut}`),
                    operateur, num_machine, version, separation, commentaire
                }
            });

            await tx.lot_status.upsert({
                where: { id_lot: id_lot.toString() },
                update: { current_step: 'prise_de_cotes' },
                create: { id_lot: id_lot.toString(), current_step: 'prise_de_cotes', type_piece: '', revision: '' }
            });
        });

        res.status(201).json({ message: 'Début de tomographie enregistré et statut mis à jour' });
    } catch (err) {
        console.error('Erreur d\'insertion :', err);
        res.status(500).json({ error: 'Erreur serveur lors de l\'enregistrement' });
    }
};

exports.getAll = async (req, res) => {
    try {
        const rows = await prisma.debut_tomo.findMany();
        res.json(rows);
    } catch (err) {
        console.error('Erreur de récupération :', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

exports.getLots = async (req, res) => {
    try {
        const results = await prisma.fin_etching.findMany({
            select: { id_lot: true }
        });
        res.json(results);
    } catch (err) {
        console.error('Erreur lors de la récupération des lots:', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};