// ============================================
// controllers/FormulairesSemi/finEtchingController.js
// ============================================
const prisma = require('../../config/prisma');

exports.getLots = async (req, res) => {
    try {
        const results = await prisma.$queryRaw`
            SELECT DISTINCT d.id_lot 
            FROM debut_etching d 
            INNER JOIN prise_de_cotes p ON d.id_lot = p.id_lot
        `;
        res.json(results);
    } catch (err) {
        console.error('Erreur lors de la récupération des lots:', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

exports.getLotInfo = async (req, res) => {
    try {
        const lotId = parseInt(req.params.lotId);

        const result = await prisma.debut_etching.findFirst({
            where: { id_lot: lotId },
            select: { num_lot_wafer: true, nb_passage: true },
            orderBy: { nb_passage: 'desc' }
        });

        if (!result) {
            return res.status(404).json({ error: 'Lot introuvable' });
        }

        res.json(result);
    } catch (err) {
        console.error('Erreur récupération lot:', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

exports.addFinEtching = async (req, res) => {
    try {
        const {
            id_lot, num_lot_wafer, nb_passage, date_fin,
            heure_fin, nb_piece_conforme, operateur, commentaire
        } = req.body;

        await prisma.$transaction(async (tx) => {
            await tx.fin_etching.create({
                data: {
                    id_lot, num_lot_wafer, nb_passage,
                    date_fin: new Date(date_fin),
                    heure_fin: new Date(`1970-01-01T${heure_fin}`),
                    nb_piece_conforme, operateur, commentaire
                }
            });

            await tx.lot_status.upsert({
                where: { id_lot: id_lot.toString() },
                update: { current_step: 'fin_etching' },
                create: { id_lot: id_lot.toString(), current_step: 'fin_etching', type_piece: '', revision: '' }
            });
        });

        res.status(200).json({ message: 'Fin Etching enregistrée et statut mis à jour' });
    } catch (err) {
        console.error('Erreur ajout fin etching:', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};