// ============================================
// controllers/FormulairesSemi/debutEtchingController.js
// ============================================
const prisma = require('../../config/prisma');

exports.getLots = async (req, res) => {
    try {
        const results = await prisma.fin_impression.findMany({
            select: {
                id_lot: true,
                num_lot_wafer: true,
                nb_imprimees: true
            }
        });
        res.status(200).json(results);
    } catch (err) {
        console.error('Erreur lors de la récupération des lots:', err);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

exports.addDebutEtching = async (req, res) => {
    try {
        const {
            numeroLot, num_lot_wafer, nb_pieces, operateur, nb_passage,
            date_debut, heure_debut, temps_reel, koh, bain, position, commentaire
        } = req.body;

        await prisma.$transaction(async (tx) => {
            await tx.debut_etching.create({
                data: {
                    id_lot: numeroLot,
                    num_lot_wafer, nb_pieces, operateur, nb_passage,
                    date_debut: new Date(date_debut),
                    heure_debut: new Date(`1970-01-01T${heure_debut}`),
                    temps_reel, koh, bain, position, commentaire
                }
            });

            await tx.lot_status.upsert({
                where: { id_lot: numeroLot.toString() },
                update: { current_step: 'debut_etching' },
                create: { id_lot: numeroLot.toString(), current_step: 'debut_etching', type_piece: '', revision: '' }
            });
        });

        res.status(200).json({ success: true, message: 'Données et statut enregistrés avec succès' });
    } catch (err) {
        console.error("Erreur lors de l'insertion dans debut_etching:", err);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

exports.getAllDebutEtching = async (req, res) => {
    try {
        const results = await prisma.debut_etching.findMany();
        
        const formattedResults = results.map(row => ({
            ...row,
            date_debut: row.date_debut ? new Date(row.date_debut).toISOString().split('T')[0].replace(/-/g, '/') : null,
            heure_debut: row.heure_debut ? new Date(row.heure_debut).toTimeString().slice(0, 5) : null
        }));

        res.json(formattedResults);
    } catch (err) {
        console.error('Erreur lors de la récupération des données :', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

exports.getNbPassages = async (req, res) => {
    try {
        const lotId = parseInt(req.params.lotId);
        
        const count = await prisma.debut_etching.count({
            where: { id_lot: lotId }
        });

        res.json({ count });
    } catch (err) {
        console.error('Erreur lors du comptage des passages :', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};