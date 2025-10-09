const r6Info = require('r6-data.js');

// Test simple et rapide
async function quickTest() {
  const playerName = process.argv[2] || 'Ekin0ox.DSG';
  const platform = process.argv[3] || 'uplay';
  
  console.log(`🔍 Test rapide pour ${playerName} sur ${platform}`);
  console.log('=' .repeat(40));
  
  try {
    // Test 1: Account Info
    console.log('\n1️⃣ Test getAccountInfo...');
    const accountInfo = await r6Info.getAccountInfo({
      nameOnPlatform: playerName,
      platformType: platform
    });
    console.log('✅ Account Info reçu:', !!accountInfo);
    if (accountInfo) {
      console.log('   - Niveau:', accountInfo?.profile?.level || accountInfo?.level || 'N/A');
      console.log('   - Username:', accountInfo?.profile?.username || accountInfo?.username || 'N/A');
    }
    
    // Test 2: Player Stats
    console.log('\n2️⃣ Test getPlayerStats...');
    const playerStats = await r6Info.getPlayerStats({
      nameOnPlatform: playerName,
      platformType: platform,
      platform_families: 'pc'
    });
    console.log('✅ Player Stats reçu:', !!playerStats);
    
    // Test 3: Service Status
    console.log('\n3️⃣ Test getServiceStatus...');
    const serviceStatus = await r6Info.getServiceStatus();
    console.log('✅ Service Status reçu:', !!serviceStatus);
    
    console.log('\n🎉 Tous les tests sont passés !');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Lancement
quickTest();