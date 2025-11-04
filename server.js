const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const prisma = require('./config/prisma');

// Importation des routes
const authRoutes = require('./routes/auth.Routes');
const suiviRoutes = require('./routes/FormsSemiRoutes/suiviRoutes');
const impressionRoutes = require('./routes/FormsSemiRoutes/impressionRoutes');
const finImpressionRoutes = require('./routes/FormsSemiRoutes/finImpressionRoutes');
const debutEtchingRoutes = require('./routes/FormsSemiRoutes/debutEtchingRoutes');
const priseCotesRoute = require('./routes/FormsSemiRoutes/priseCotesRoute');
const debutTomoRoutes = require('./routes/FormsSemiRoutes/debutTomoRoutes');
const debutTomoFinisRoute = require('./routes/FromsFinisRoutes/DebutTomoRoutes');
const finTomoRoutes = require('./routes/FormsSemiRoutes/finTomoRoutes');
const finTomoFinisRoutes = require('./routes/FromsFinisRoutes/FinTomoRoutes');
const assemblage = require('./routes/FromsFinisRoutes/AssemeblageRoute');
const cotesRoutes = require('./routes/FormsSemiRoutes/cotesRoutes');
const finEtchingRoutes = require('./routes/FormsSemiRoutes/finEtchingRoutes');
const denominationRoutes = require('./routes/FormsSemiRoutes/denominationRoutes');
const pieceRoutes = require('./routes/pieceRoutes');
const systemConfigRoutes = require('./routes/systemConfigRoutes');
const versionPieceRoutes = require('./routes/versionPieceRoutes');
const ncRoutes = require('./routes/FormsSemiRoutes/gestionNcRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:2718'
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(bodyParser.json());
app.use(cookieParser());

// Routes
app.use('/api/impression', impressionRoutes);
app.use('/api/fin-impression', finImpressionRoutes);
app.use('/api/debut-etching', debutEtchingRoutes);
app.use('/api/debut-tomo', debutTomoRoutes);
app.use('/api/fin-tomo', finTomoRoutes);
app.use('/api/fin-tomo-finis', finTomoFinisRoutes);
app.use('/api', priseCotesRoute);
app.use('/api/cotes', cotesRoutes);
app.use('/api/fin-etching', finEtchingRoutes);
app.use('/api/suivi', suiviRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', pieceRoutes);
app.use('/api/assemblage', assemblage);
app.use('/api', ncRoutes);
app.use('/api/debut-tomo-finis', debutTomoFinisRoute);
app.use('/api/denominations', denominationRoutes);
app.use('/api/config', systemConfigRoutes);
app.use('/api/versions', versionPieceRoutes);

// Test de connexion Prisma
app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'OK', database: 'Connected' });
  } catch (error) {
    res.status(500).json({ status: 'ERROR', database: 'Disconnected', error: error.message });
  }
});

// Démarrage du serveur
const server = app.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur le port ${PORT}`);
  console.log(`🔗 http://localhost:${PORT}`);
});

// Gestion de l'arrêt gracieux
const gracefulShutdown = async (signal) => {
  console.log(`\n🛑 ${signal} reçu, arrêt du serveur...`);
  
  server.close(async () => {
    console.log('📡 Serveur HTTP fermé');
    
    try {
      await prisma.$disconnect();
      console.log('🔌 Prisma déconnecté');
      process.exit(0);
    } catch (error) {
      console.error('❌ Erreur lors de la déconnexion de Prisma:', error);
      process.exit(1);
    }
  });

  // Force l'arrêt après 10 secondes
  setTimeout(() => {
    console.error('⚠️  Arrêt forcé après timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));