import mongoose, { Document, Model, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

// Interface pour le document User
export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  username: string;
  email: string;
  password: string;
  avatar?: string;
  uplayProfile?: string; // Profil Uplay pour récupérer les stats
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Interface pour le modèle User (méthodes statiques)
interface IUserModel extends Model<IUser> {
  findByEmail(email: string): Promise<IUser | null>;
  findByUsername(username: string): Promise<IUser | null>;
}

// Schéma MongoDB pour User
const userSchema = new Schema<IUser, IUserModel>(
  {
    username: {
      type: String,
      required: [true, 'Le nom d\'utilisateur est requis'],
      unique: true,
      trim: true,
      minlength: [3, 'Le nom d\'utilisateur doit contenir au moins 3 caractères'],
      maxlength: [30, 'Le nom d\'utilisateur ne peut pas dépasser 30 caractères'],
      match: [/^[a-zA-Z0-9_-]+$/, 'Le nom d\'utilisateur ne peut contenir que des lettres, chiffres, tirets et underscores'],
    },
    email: {
      type: String,
      required: [true, 'L\'email est requis'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Veuillez fournir une adresse email valide'],
    },
    password: {
      type: String,
      required: [true, 'Le mot de passe est requis'],
      minlength: [6, 'Le mot de passe doit contenir au moins 6 caractères'],
      select: false, // Ne pas retourner le mot de passe par défaut dans les requêtes
    },
    avatar: {
      type: String,
      default: null,
    },
    uplayProfile: {
      type: String,
      default: null,
      trim: true,
    },
  },
  {
    timestamps: true, // Ajoute automatiquement createdAt et updatedAt
  }
);

// Middleware pre-save : hasher le mot de passe avant de sauvegarder
userSchema.pre('save', async function (next) {
  const user = this as IUser;

  // Ne hasher que si le mot de passe a été modifié (ou est nouveau)
  if (!user.isModified('password')) {
    return next();
  }

  try {
    // Générer un salt et hasher le mot de passe
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Méthode d'instance : comparer le mot de passe
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  const user = this as IUser;
  try {
    return await bcrypt.compare(candidatePassword, user.password);
  } catch (error) {
    console.error('Erreur lors de la comparaison des mots de passe:', error);
    return false;
  }
};

// Méthode statique : trouver un utilisateur par email
userSchema.statics.findByEmail = function (email: string) {
  return this.findOne({ email: email.toLowerCase() });
};

// Méthode statique : trouver un utilisateur par nom d'utilisateur
userSchema.statics.findByUsername = function (username: string) {
  return this.findOne({ username });
};

// Créer ou récupérer le modèle (évite les erreurs en développement avec hot-reload)
const User: IUserModel = (mongoose.models.User as IUserModel) || mongoose.model<IUser, IUserModel>('User', userSchema);

export default User;
