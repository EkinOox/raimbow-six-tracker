import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'r6tracker';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

// Cache de connexion pour éviter les reconnexions en développement
const cached: MongooseCache = global.mongoose || {
  conn: null,
  promise: null,
};

if (!global.mongoose) {
  global.mongoose = cached;
}

/**
 * Connexion à MongoDB Atlas
 * Utilise un cache pour éviter les reconnexions multiples en développement
 */
export async function connectDB(): Promise<typeof mongoose> {
  // Si déjà connecté, retourner la connexion existante
  if (cached.conn) {
    console.log('🔗 Utilisation de la connexion MongoDB existante');
    return cached.conn;
  }

  // Si une promesse de connexion est en cours, l'attendre
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      dbName: MONGODB_DB_NAME,
    };

    console.log('🔄 Connexion à MongoDB Atlas...');
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('✅ Connecté à MongoDB Atlas');
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('❌ Erreur de connexion MongoDB:', e);
    throw e;
  }

  return cached.conn;
}

/**
 * Déconnexion de MongoDB
 * Utile pour les tests ou la fermeture propre
 */
export async function disconnectDB(): Promise<void> {
  if (cached.conn) {
    await cached.conn.disconnect();
    cached.conn = null;
    cached.promise = null;
    console.log('🔌 Déconnecté de MongoDB');
  }
}

/**
 * Vérifier l'état de la connexion
 */
export function isConnected(): boolean {
  return cached.conn?.connection.readyState === 1;
}
