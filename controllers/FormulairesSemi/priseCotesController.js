// ============================================
// controllers/FormulairesSemi/priseCotesController.js
// ============================================
const prisma = require('../../config/prisma');

exports.getLots = async (req, res) => {
    try {
        const query = `
            SELECT 
                d.id_lot,
                GROUP_CONCAT(d.nb_passage ORDER BY d.nb_passage) AS nb_passages,
                f.nb_imprimees
            FROM 
                debut_etching d
            LEFT JOIN 
                prise_de_cotes p 
                ON d.id_lot = p.id_lot AND d.nb_passage = p.nb_passage
            JOIN 
                fin_impression f 
                ON d.id_lot = f.id_lot
            WHERE 
                p.id_lot IS NULL AND p.nb_passage IS NULL
            GROUP BY 
                d.id_lot, f.nb_imprimees
        `;

        const rows = await prisma.$queryRawUnsafe(query);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.submitPieces = async (req, res) => {
    try {
        const { id_lot, passage, date, nombre_pieces, pieces } = req.body;

        await prisma.$transaction(async (tx) => {
            // 1. Insérer dans prise_de_cotes
            await tx.prise_de_cotes.create({
                data: {
                    id_lot,
                    nb_passage: passage,
                    date: new Date(date),
                    nombre_pieces
                }
            });

            // 2. Insérer les mesures
            if (pieces && pieces.length > 0) {
                await tx.mesure_cote_piece.createMany({
                    data: pieces.map(p => ({
                        id_lot,
                        nb_passage: passage,
                        id_piece_locale: p.id_piece,
                        id_cote_piece: p.id_cote || 0,
                        valeur: p.coteA || 0
                    }))
                });
            }

            // 3. Mettre à jour le statut
            await tx.lot_status.update({
                where: { id_lot: id_lot.toString() },
                data: { current_step: 'prise_de_cotes' }
            });
        });

        res.status(200).json({ success: true, message: 'Données et statut enregistrés avec succès' });
    } catch (err) {
        console.error('Erreur:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.GetTypePiece = async (req, res) => {
    try {
        const id_lot = parseInt(req.params.id_lot);

        // 1. Récupérer le type de pièce depuis nouvelle_impression
        const lot = await prisma.nouvelle_impression.findUnique({
            where: { id: id_lot },
            select: { type_pieces: true }
        });

        if (!lot) {
            return res.status(404).json({ message: "Lot introuvable." });
        }

        const nom_piece = lot.type_pieces;

        // 2. Trouver l'id de cette pièce
        const piece = await prisma.piece.findUnique({
            where: { nom: nom_piece },
            select: { id: true }
        });

        if (!piece) {
            return res.status(404).json({ message: "Pièce introuvable." });
        }

        // 3. Récupérer les cotes
        const cotes = await prisma.cote_piece.findMany({
            where: { piece_id: piece.id },
            select: {
                id: true,
                nom_cote: true,
                tolerance_min: true,
                tolerance_max: true
            }
        });

        res.json({ nom_piece, cotes });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.ajouterPriseCotes = async (req, res) => {
    try {
        const { id_lot, nb_passage, date, type_piece, nombre_pieces, pieces } = req.body;

        await prisma.$transaction(async (tx) => {
            // Insérer prise de cotes
            await tx.prise_de_cotes.create({
                data: {
                    id_lot,
                    nb_passage,
                    type_piece,
                    date: new Date(date),
                    nombre_pieces
                }
            });

            // Récupérer l'id de la pièce
            const piece = await tx.piece.findUnique({
                where: { nom: type_piece },
                select: { id: true }
            });

            if (!piece) {
                throw new Error('Type pièce non trouvé');
            }

            // Récupérer les cotes de la pièce
            const cotes = await tx.cote_piece.findMany({
                where: { piece_id: piece.id },
                select: { id: true, nom_cote: true }
            });

            // Insérer les mesures
            const mesures = [];
            for (const p of pieces) {
                for (const cote of cotes) {
                    const valeur = p[cote.nom_cote];
                    if (valeur !== undefined) {
                        mesures.push({
                            id_lot,
                            nb_passage,
                            id_piece_locale: p.id_piece,
                            id_cote_piece: cote.id,
                            valeur: parseInt(valeur)
                        });
                    }
                }
            }

            if (mesures.length > 0) {
                await tx.mesure_cote_piece.createMany({
                    data: mesures
                });
            }
        });

        res.status(201).json({ message: 'Mesures enregistrées avec succès' });
    } catch (err) {
        console.error('Erreur:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.getMesuresByLotAndPassage = async (req, res) => {
    try {
        const { id_lot, nb_passage } = req.params;

        const query = `
            SELECT 
                m.id_piece_locale, 
                c.nom_cote, 
                c.tolerance_min, 
                c.tolerance_max, 
                m.valeur 
            FROM mesure_cote_piece m 
            JOIN cote_piece c ON m.id_cote_piece = c.id 
            WHERE m.id_lot = ? AND m.nb_passage = ? 
            ORDER BY m.id_piece_locale, c.nom_cote
        `;

        const results = await prisma.$queryRawUnsafe(query, parseInt(id_lot), parseInt(nb_passage));
        res.status(200).json(results);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur lors de la récupération des mesures" });
    }
};