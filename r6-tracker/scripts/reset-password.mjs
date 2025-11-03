// Script pour réinitialiser le mot de passe d'un utilisateur
// Usage: node scripts/reset-password.mjs email@example.com "nouveau_mot_de_passe"

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env.local') });

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  uplayProfile: String,
  avatar: String,
  createdAt: Date,
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function resetPassword(email, newPassword) {
  try {
    console.log('🔌 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté\n');

    console.log(`🔍 Recherche: ${email}`);
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.error('❌ Utilisateur non trouvé');
      return;
    }

    console.log('✅ Utilisateur trouvé:', user.username);
    console.log(`\n🔐 Hachage du nouveau mot de passe...`);
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log('✅ Mot de passe haché\n');

    console.log('💾 Mise à jour dans la base de données...');
    user.password = hashedPassword;
    await user.save();

    console.log('✅ Mot de passe mis à jour avec succès!\n');
    console.log('🎉 Vous pouvez maintenant vous connecter avec:');
    console.log(`   Email: ${email}`);
    console.log(`   Mot de passe: ${newPassword}\n`);

  } catch (error) {
    console.error('💥 Erreur:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté');
  }
}

const email = process.argv[2];
const newPassword = process.argv[3];

if (!email || !newPassword) {
  console.log('Usage: node scripts/reset-password.mjs email@example.com "nouveau_mot_de_passe"');
  console.log('');
  console.log('Exemple:');
  console.log('  node scripts/reset-password.mjs kyllian.diochon.kd@gmail.com "MonNouveauMotDePasse123"');
  process.exit(1);
}

if (newPassword.length < 6) {
  console.error('❌ Erreur: Le mot de passe doit contenir au moins 6 caractères');
  process.exit(1);
}

resetPassword(email, newPassword);
