import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Charger les variables d'environnement depuis le dossier parent
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI non défini dans .env.local');
  process.exit(1);
}

async function cleanupInvalidUsers() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));

    // Trouver tous les utilisateurs sans mot de passe ou avec mot de passe null/undefined
    console.log('\n🔍 Recherche des utilisateurs invalides...');
    const invalidUsers = await User.find({
      $or: [
        { password: { $exists: false } },
        { password: null },
        { password: '' }
      ]
    });

    if (invalidUsers.length === 0) {
      console.log('✅ Aucun utilisateur invalide trouvé');
      await mongoose.connection.close();
      return;
    }

    console.log(`⚠️  ${invalidUsers.length} utilisateur(s) invalide(s) trouvé(s):`);
    invalidUsers.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.username || 'Sans nom'}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   ID: ${user._id}`);
      console.log(`   Créé le: ${user.createdAt}`);
    });

    console.log('\n🗑️  Suppression des utilisateurs invalides...');
    const result = await User.deleteMany({
      $or: [
        { password: { $exists: false } },
        { password: null },
        { password: '' }
      ]
    });

    console.log(`✅ ${result.deletedCount} utilisateur(s) supprimé(s)`);

    await mongoose.connection.close();
    console.log('\n✅ Nettoyage terminé');
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

cleanupInvalidUsers();
