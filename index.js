require('dotenv').config({
  path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env'
});

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Verificar variables de entorno críticas
const requiredEnvVars = ['MONGODB_URI', 'OPENAI_API_KEY'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.warn(`⚠️ Advertencia: Las siguientes variables no están configuradas: ${missingVars.join(', ')}`);
  // No terminamos el proceso en producción, solo advertimos
  if (process.env.NODE_ENV !== 'production') {
    process.exit(1);
  }
}

const app = express();

// Configuración de CORS más segura
const allowedOrigins = process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL]
    : ['http://localhost:3000'];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST'],
    credentials: true
}));
app.use(express.json());

// Ruta de health check mejorada
app.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// Conexión a MongoDB con mejor manejo de errores
const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI || !process.env.MONGODB_URI.startsWith('mongodb')) {
      throw new Error('MongoDB URI inválida o no configurada');
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB conectado exitosamente');
  } catch (err) {
    console.error('❌ Error conectando MongoDB:', err.message);
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  }
};

connectDB();

const userRouter = require('./routes/user');
const chatRouter = require('./routes/chat');

app.use('/api/users', userRouter);
app.use('/api/chat', chatRouter);

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Manejo global de errores
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        error: process.env.NODE_ENV === 'production' 
            ? 'Error interno del servidor'
            : err.message
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en puerto ${PORT}`);
    console.log('📝 Configuración cargada:');
    console.log('- MongoDB URI:', process.env.MONGODB_URI.substring(0, 20) + '...');
    console.log('- OpenAI API Key:', 'configurada');
});
