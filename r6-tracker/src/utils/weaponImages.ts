// Utilitaire pour gérer les images des armes
// Encodage: UTF-8

/**
 * Construit le chemin de l'image d'une arme à partir de son nom
 * @param weaponName - Nom de l'arme (ex: "AK-12", "MP5", "5.7 USG")
 * @returns Chemin de l'image locale ou null si non trouvée
 */
export function getWeaponImagePath(weaponName: string): string {
  if (!weaponName) return '/images/logo/r6x-logo-ww.avif';
  
  // Normaliser le nom de l'arme pour correspondre aux fichiers
  // Remplacer les espaces par des underscores et garder les caractères spéciaux
  const imageName = weaponName
    .trim()
    .replace(/\s+/g, '_') // Espaces → underscores
    .replace(/\//g, '')   // Supprimer les slashes
    .replace(/\\/g, '');  // Supprimer les backslashes
  
  // Construire le chemin
  const imagePath = `/images/weapons/${imageName}.png`;
  
  return imagePath;
}

/**
 * Vérifie si une arme possède une image locale
 * @param weaponName - Nom de l'arme
 * @returns true si l'image existe probablement
 */
export function hasLocalWeaponImage(weaponName: string): boolean {
  // Liste des armes connues avec images (basée sur les fichiers du dossier)
  const knownWeapons = [
    '1911 Tacops',
    '416-C Carbine',
    '417',
    '44 Mag Semi-Auto',
    '44 Vendetta',
    '5.7 USG',
    '552 Commando',
    '556XI',
    '6P41',
    '9mm C1',
    '9x19VSN',
    'ACS12',
    'AK-12',
    'AK-74M',
    'AR-15.50',
    'AR33',
    'ARX200',
    'AUG A2',
    'AUG A3',
    'Alda 5.56',
    'BOSG.12.2',
    'Bailiff 410',
    'Bearing 9',
    'C75 Auto',
    'C7E',
    'C8-SFW',
    'CAMRS',
    'CSRX 300',
    'Commando 9',
    'D-50',
    'DP27',
    'F2',
    'F90',
    'FMG-9',
    'FO-12',
    'G36C',
    'G8A1',
    'GSH-18',
    'Glaive-12',
    'Gonne-6',
    'ITA12L',
    'ITA12S',
    'K1A',
    'Keratos .357',
    'L85A2',
    'LFP586',
    'LMG-E',
    'Lusion',
    'M1014',
    'M12',
    'M249',
    'M249 SAW',
    'M4',
    'M45 Meusoc',
    'M590A1',
    'M762',
    'M870',
    'MK17 CQB',
    'MK1 9mm',
    'MP5',
    'MP5K',
    'MP5SD',
    'MP7',
    'MPX',
    'Mk 14 EBR',
    'Mx4 Storm',
    'OTs-03',
    'P-10C',
    'P10 Roni',
    'P12',
    'P226 MK 25',
    'P229',
    'P9',
    'P90',
    'PCX-33',
    'PDW9',
    'PMM',
    'POF-9',
    'PRB92',
    'Para-308',
    'Q-929',
    'R4-C',
    'RG15',
    'Reaper MK2',
    'SC3000K',
    'SDP 9mm',
    'SG-CQB',
    'SIX12 SD',
    'SMG-11',
    'SMG-12',
    'SPSMG9',
    'SR-25',
    'Sasg-12',
    'Scorpion Evo 3 A1',
    'Six12',
    'Spas-12',
    'Spear .308',
    'Super 90',
    'Super Shorty',
    'Supernova',
    'T-5 SMG',
    'T-95 LSW',
    'TCSG12',
    'Type-89',
    'UMP45',
    'USP40',
    'UZK50GI',
    'V308',
    'Vector .45 ACP',
    'spas-15'
  ];
  
  return knownWeapons.includes(weaponName);
}

/**
 * Obtient l'URL de l'image d'une arme (locale ou API)
 * @param weaponName - Nom de l'arme
 * @param apiImageUrl - URL de l'image depuis l'API (optionnel)
 * @returns URL de l'image à utiliser
 */
export function getWeaponImageUrl(weaponName: string, apiImageUrl?: string): string {
  // Priorité 1: Image locale si elle existe
  if (hasLocalWeaponImage(weaponName)) {
    return getWeaponImagePath(weaponName);
  }
  
  // Priorité 2: Image de l'API si fournie
  if (apiImageUrl) {
    return apiImageUrl;
  }
  
  // Fallback: Logo par défaut
  return '/images/logo/r6x-logo-ww.avif';
}
