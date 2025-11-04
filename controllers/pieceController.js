// ============================================
// controllers/pieceController.js
// ============================================
const prisma = require('../config/prisma');
exports.ajouterPiece = async (req, res) => {
    try {
        const { nom_piece, nb_cotes, cotes } = req.body;

        if (!nom_piece || !nb_cotes || !Array.isArray(cotes)) {
            return res.status(400).json({ message: 'Champs invalides' });
        }

        const result = await prisma.piece.create({
            data: { nom: nom_piece, nb_cotes }
        });

        const pieceId = result.id;

        await prisma.cote_piece.createMany({
            data: cotes.map(cote => ({
                piece_id: pieceId,
                nom_cote: cote.nom_cote,
                tolerance_min: cote.tolerance_min,
                tolerance_max: cote.tolerance_max
            }))
        });

        res.status(201).json({ message: 'Pièce et côtés enregistrés avec succès.' });
    } catch (err) {
        console.error('Erreur lors de l\'insertion de la pièce :', err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

exports.getAllPieces = async (req, res) => {
    try {
        const pieces = await prisma.piece.findMany({
            include: {
                cote_piece: true
            }
        });

        const formattedPieces = pieces.map(piece => ({
            id: piece.id,
            nom: piece.nom,
            nb_cotes: piece.nb_cotes,
            cotes: piece.cote_piece || []
        }));

        res.status(200).json(formattedPieces);
    } catch (err) {
        console.error('Erreur lors de la récupération des pièces :', err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

exports.getAllPiecesName = async (req, res) => {
    try {
        const pieces = await prisma.piece.findMany({
            select: { nom: true },
            orderBy: { id: 'asc' }
        });

        const names = pieces.map(row => row.nom);
        res.json(names);
    } catch (err) {
        console.error("Erreur lors de la récupération des noms des pièces :", err);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

exports.getPieceById = async (req, res) => {
    try {
        const pieceId = parseInt(req.params.id);

        const piece = await prisma.piece.findUnique({
            where: { id: pieceId },
            include: { cote_piece: true }
        });

        if (!piece) {
            return res.status(404).json({ message: 'Pièce non trouvée' });
        }

        const formatted = {
            id: piece.id,
            nom: piece.nom,
            nb_cotes: piece.nb_cotes,
            cotes: piece.cote_piece || []
        };

        res.status(200).json(formatted);
    } catch (err) {
        console.error('Erreur lors de la récupération de la pièce :', err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

exports.deletePiece = async (req, res) => {
    try {
        const pieceId = parseInt(req.params.id);

        await prisma.$transaction(async (tx) => {
            await tx.cote_piece.deleteMany({ where: { piece_id: pieceId } });
            await tx.piece.delete({ where: { id: pieceId } });
        });

        res.status(200).json({ message: 'Pièce et ses cotes supprimées avec succès' });
    } catch (err) {
        console.error('Erreur suppression pièce:', err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

exports.getTypePieces = async (req, res) => {
    try {
        const results = await prisma.piece.findMany({
            select: { nom: true },
            distinct: ['nom']
        });
        res.json(results);
    } catch (err) {
        console.error("erreur lors de la récupération des types:", err);
        res.status(500).json({ error: "erreur lors de la récupération des types" });
    }
};
// modifier une pièce
exports.updatePiece = (req, res) => {
  const pieceId = req.params.nom;
  const { nom_piece, nb_cotes, cotes } = req.body;

  if (!nom_piece || !nb_cotes || !Array.isArray(cotes) || cotes.length === 0) {
    return res.status(400).json({ message: 'Champs invalides' });
  }

  const updatePieceQuery = 'UPDATE piece SET nom = ?, nb_cotes = ? ,  WHERE nom = ?';

  db.query(updatePieceQuery, [nom_piece, nb_cotes, pieceId], (err) => {
    if (err) {
      console.error('Erreur update piece:', err);
      return res.status(500).json({ message: 'Erreur serveur' });
    }

    const deleteCotesQuery = 'DELETE FROM cote_piece WHERE piece_id = ?';
    db.query(deleteCotesQuery, [pieceId], (err) => {
      if (err) {
        console.error('Erreur suppression anciens côtés:', err);
        return res.status(500).json({ message: 'Erreur serveur' });
      }

      const insertCoteQuery = `
        INSERT INTO cote_piece (piece_id, nom_cote, tolerance_min, tolerance_max) VALUES ?
      `;

      const values = cotes.map(cote => [
        pieceId,
        cote.nom_cote,
        cote.tolerance_min,
        cote.tolerance_max,
      ]);

      db.query(insertCoteQuery, [values], (err) => {
        if (err) {
          console.error('Erreur insertion nouveaux côtés:', err);
          return res.status(500).json({ message: 'Erreur serveur' });
        }

        return res.status(200).json({ message: 'Pièce mise à jour avec succès' });
      });
    });
  });
};
