const prisma = require('../config/prisma');

exports.getAllActivities = async (req, res) => {
    try {
        const results = await prisma.activites.findMany();
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createActivity = async (req, res) => {
    try {
        const { nom } = req.body;
        if (!nom) return res.status(400).json({ error: 'Nom requis' });

        const result = await prisma.activites.create({
            data: { nom }
        });

        res.status(201).json({ id: result.id, nom });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAllPrinters = async (req, res) => {
    try {
        const results = await prisma.imprimantes.findMany();
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createPrinter = async (req, res) => {
    try {
        const { nom } = req.body;
        if (!nom) return res.status(400).json({ error: 'Nom requis' });

        const result = await prisma.imprimantes.create({
            data: { nom }
        });

        res.status(201).json({ id: result.id, nom });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};