// Script pour vérifier un utilisateur dans la base de données
// Usage: node scripts/check-user.mjs email@example.com

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Charger les variables d'environnement
dotenv.config({ path: join(__dirname, '..', '.env.local') });

// Schéma utilisateur
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  uplayProfile: String,
  avatar: String,
  createdAt: Date,
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function checkUser(email) {
  try {
    console.log('🔌 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté\n');

    // Chercher l'utilisateur
    console.log(`🔍 Recherche: ${email}`);
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.error('❌ Utilisateur NON TROUVÉ\n');
      
      // Lister tous les emails
      const allUsers = await User.find({}).select('email username');
      console.log('📋 Utilisateurs dans la base:');
      allUsers.forEach(u => {
        console.log(`  - ${u.email} (${u.username})`);
      });
      
      return;
    }

    console.log('✅ Utilisateur TROUVÉ!\n');
    console.log('📋 Informations:');
    console.log(`  ID: ${user._id}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Username: ${user.username}`);
    console.log(`  Uplay: ${user.uplayProfile || 'Non défini'}`);
    console.log(`  Créé le: ${user.createdAt || 'N/A'}`);
    console.log(`  Hash password: ${user.password?.substring(0, 20)}...`);
    console.log(`  Longueur hash: ${user.password?.length || 0} caractères\n`);

    // Test de mot de passe si fourni
    const testPassword = process.argv[3];
    if (testPassword) {
      console.log('🔑 Test du mot de passe...');
      try {
        const isValid = await bcrypt.compare(testPassword, user.password);
        if (isValid) {
          console.log('✅ Mot de passe VALIDE!\n');
        } else {
          console.log('❌ Mot de passe INVALIDE\n');
          console.log('💡 Si vous avez oublié votre mot de passe:');
          console.log('   1. Supprimez le compte');
          console.log('   2. Réinscrivez-vous\n');
        }
      } catch (err) {
        console.error('❌ Erreur lors du test:', err.message);
        console.log('⚠️  Le hash semble corrompu\n');
      }
    } else {
      console.log('💡 Pour tester un mot de passe:');
      console.log(`   node scripts/check-user.mjs ${email} "votre_mot_de_passe"\n`);
    }

  } catch (error) {
    console.error('💥 Erreur:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté');
  }
}

const email = process.argv[2];
if (!email) {
  console.log('Usage: node scripts/check-user.mjs email@example.com [mot_de_passe]');
  console.log('');
  console.log('Exemples:');
  console.log('  node scripts/check-user.mjs kyllian.diochon.kd@gmail.com');
  console.log('  node scripts/check-user.mjs kyllian.diochon.kd@gmail.com "MonMotDePasse123"');
  process.exit(1);
}

checkUser(email);
