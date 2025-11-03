// Script pour tester l'authentification et vérifier les utilisateurs
// Usage: node scripts/test-auth.js

const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Modèle User simple
const UserSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  uplayProfile: String,
  avatar: String,
  createdAt: Date,
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function testAuth() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');

    // Chercher l'utilisateur
    const email = 'kyllian.diochon.kd@gmail.com';
    console.log(`🔍 Recherche de l'utilisateur: ${email}`);
    
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.error('❌ Utilisateur non trouvé !');
      console.log('\n📋 Voici tous les utilisateurs dans la base :');
      const allUsers = await User.find({}).select('email username createdAt');
      console.table(allUsers.map(u => ({
        email: u.email,
        username: u.username,
        createdAt: u.createdAt
      })));
    } else {
      console.log('✅ Utilisateur trouvé !');
      console.log('\n📋 Informations utilisateur :');
      console.log({
        id: user._id.toString(),
        email: user.email,
        username: user.username,
        uplayProfile: user.uplayProfile || 'Non défini',
        hasPassword: !!user.password,
        passwordLength: user.password ? user.password.length : 0,
        passwordStartsWith: user.password ? user.password.substring(0, 7) : 'N/A',
        createdAt: user.createdAt
      });

      // Test du mot de passe
      console.log('\n🔑 Test de validation du mot de passe...');
      const testPassword = 'votre_mot_de_passe_ici'; // REMPLACEZ PAR VOTRE MOT DE PASSE
      
      try {
        const isValid = await bcrypt.compare(testPassword, user.password);
        if (isValid) {
          console.log('✅ Mot de passe VALIDE !');
        } else {
          console.log('❌ Mot de passe INVALIDE');
          console.log('\n💡 Si vous avez oublié votre mot de passe, vous pouvez le réinitialiser');
          console.log('   en créant un nouveau hash avec le script reset-password.js');
        }
      } catch (error) {
        console.error('❌ Erreur lors de la comparaison du mot de passe:', error.message);
        console.log('\n⚠️  Le hash du mot de passe semble corrompu ou invalide');
      }
    }

    // Vérifier la structure de tous les utilisateurs
    console.log('\n📊 Statistiques de la base de données :');
    const totalUsers = await User.countDocuments();
    const usersWithPassword = await User.countDocuments({ password: { $exists: true, $ne: '' } });
    const usersWithUplay = await User.countDocuments({ uplayProfile: { $exists: true, $ne: '' } });
    
    console.log({
      totalUsers,
      usersWithPassword,
      usersWithUplay,
      usersWithoutPassword: totalUsers - usersWithPassword
    });

  } catch (error) {
    console.error('💥 Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnecté de MongoDB');
  }
}

testAuth();
