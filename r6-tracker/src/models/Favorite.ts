import mongoose, { Document, Model, Schema } from 'mongoose';

// Types de favoris possibles
export enum FavoriteType {
  OPERATOR = 'operator',
  WEAPON = 'weapon',
  MAP = 'map',
}

// Interface pour le document Favorite
export interface IFavorite extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId; // Référence à l'utilisateur
  itemType: FavoriteType; // Type d'élément (operator, weapon, map)
  itemId: string; // ID ou safename de l'élément favorisé
  itemName: string; // Nom de l'élément pour affichage rapide
  metadata?: {
    // Métadonnées optionnelles pour enrichir l'affichage
    image?: string;
    type?: string;
    side?: string; // Pour les opérateurs (attacker/defender)
    category?: string; // Pour les armes
  };
  createdAt: Date;
  updatedAt: Date;
}

// Interface pour le modèle Favorite (méthodes statiques)
interface IFavoriteModel extends Model<IFavorite> {
  findByUser(userId: string | mongoose.Types.ObjectId): Promise<IFavorite[]>;
  findByUserAndType(userId: string | mongoose.Types.ObjectId, type: FavoriteType): Promise<IFavorite[]>;
  isFavorite(userId: string | mongoose.Types.ObjectId, itemType: FavoriteType, itemId: string): Promise<boolean>;
  toggleFavorite(
    userId: string | mongoose.Types.ObjectId, 
    itemType: FavoriteType, 
    itemId: string,
    itemName: string,
    metadata?: IFavorite['metadata']
  ): Promise<{ action: 'added' | 'removed'; favorite?: IFavorite }>;
}

// Schéma MongoDB pour Favorite
const favoriteSchema = new Schema<IFavorite, IFavoriteModel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'L\'ID utilisateur est requis'],
      index: true,
    },
    itemType: {
      type: String,
      enum: Object.values(FavoriteType),
      required: [true, 'Le type d\'élément est requis'],
      index: true,
    },
    itemId: {
      type: String,
      required: [true, 'L\'ID de l\'élément est requis'],
      trim: true,
      index: true,
    },
    itemName: {
      type: String,
      required: [true, 'Le nom de l\'élément est requis'],
      trim: true,
    },
    metadata: {
      image: String,
      type: String,
      side: String,
      category: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index composé pour éviter les doublons et optimiser les requêtes
favoriteSchema.index({ userId: 1, itemType: 1, itemId: 1 }, { unique: true });
favoriteSchema.index({ userId: 1, createdAt: -1 }); // Pour trier par date

// Méthode statique : récupérer tous les favoris d'un utilisateur
favoriteSchema.statics.findByUser = function (userId: string | mongoose.Types.ObjectId) {
  return this.find({ userId }).sort({ createdAt: -1 });
};

// Méthode statique : récupérer les favoris d'un utilisateur par type
favoriteSchema.statics.findByUserAndType = function (
  userId: string | mongoose.Types.ObjectId,
  type: FavoriteType
) {
  return this.find({ userId, itemType: type }).sort({ createdAt: -1 });
};

// Méthode statique : vérifier si un élément est en favori
favoriteSchema.statics.isFavorite = async function (
  userId: string | mongoose.Types.ObjectId,
  itemType: FavoriteType,
  itemId: string
): Promise<boolean> {
  const count = await this.countDocuments({ userId, itemType, itemId });
  return count > 0;
};

// Méthode statique : toggle (ajouter/retirer) un favori
favoriteSchema.statics.toggleFavorite = async function (
  userId: string | mongoose.Types.ObjectId,
  itemType: FavoriteType,
  itemId: string,
  itemName: string,
  metadata?: IFavorite['metadata']
) {
  // Vérifier si le favori existe déjà
  const existingFavorite = await this.findOne({ userId, itemType, itemId });

  if (existingFavorite) {
    // Retirer le favori
    await existingFavorite.deleteOne();
    return { action: 'removed' as const };
  } else {
    // Ajouter le favori
    const newFavorite = await this.create({
      userId,
      itemType,
      itemId,
      itemName,
      metadata: metadata || {},
    });
    return { action: 'added' as const, favorite: newFavorite };
  }
};

// Créer ou récupérer le modèle
const Favorite: IFavoriteModel = 
  (mongoose.models.Favorite as IFavoriteModel) || 
  mongoose.model<IFavorite, IFavoriteModel>('Favorite', favoriteSchema);

export default Favorite;
