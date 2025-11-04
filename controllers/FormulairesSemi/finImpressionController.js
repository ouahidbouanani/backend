// ============================================
// controllers/FormulairesSemi/finImpressionController.js
// ============================================
const prisma = require('../../config/prisma');

const dbInsertFinImpression = async (req, res) => {
    try {
        const {
            id_lot, num_lot_wafer, nb_lancees, nb_imprimees,
            operateur, date_fin, commentaires, non_conformes = []
        } = req.body;

        await prisma.$transaction(async (tx) => {
            await tx.fin_impression.create({
                data: {
                    id_lot, num_lot_wafer, nb_lancees, nb_imprimees,
                    operateur, date_fin: new Date(date_fin), commentaires
                }
            });

            await tx.lot_status.upsert({
                where: { id_lot: id_lot.toString() },
                update: { current_step: 'fin_impression' },
                create: { id_lot: id_lot.toString(), current_step: 'fin_impression', type_piece: '', revision: '' }
            });

            if (non_conformes.length > 0) {
                await tx.nc_pieces.createMany({
                    data: non_conformes.map(piece => ({
                        id_piece: piece.id_piece,
                        denomination: piece.denomination,
                        produit: piece.produit,
                        description: piece.description,
                        type_de_production: piece.proud,
                        type: piece.type,
                        date: new Date(date_fin),
                        statut: 'non traité',
                        id_lot: id_lot.toString()
                    }))
                });
            }
        });

        res.status(200).json({ success: true, message: 'Toutes les données enregistrées avec succès' });
    } catch (err) {
        console.error('Erreur:', err);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

const getAllLots = async (req, res) => {
    try {
        const results = await prisma.nouvelle_impression.findMany({
            select: { id: true }
        });
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

const getLotDetails = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const result = await prisma.nouvelle_impression.findUnique({
            where: { id },
            select: { nb_pieces: true, num_lot_wafer: true, type_pieces: true }
        });
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

module.exports = { dbInsertFinImpression, getAllLots, getLotDetails };