// ============================================
// controllers/FormulairesFinis/AssemblageController.js
// ============================================
const prisma = require('../../config/prisma');

exports.addAssemblage = async (req, res) => {
    try {
        const { activity, quantite, id_nozzle, id_body, date, operateur, commentaire } = req.body;
        
        const result = await prisma.assemblage.create({
            data: {
                activity,
                quantite,
                id_nozzle,
                id_body,
                date: new Date(date),
                operateur,
                commentaire
            }
        });
        
        res.status(200).json(result);
    } catch (err) {
        console.error('❌ Erreur lors de l\'insertion:', err);
        res.status(500).json({ success: false, message: 'Erreur dans la base de données' });
    }
};