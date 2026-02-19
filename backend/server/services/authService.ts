import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { users, type User, type InsertUser } from '../../../shared/schema';

export interface LoginCredentials {
  phone: string;
  password: string;
}

export interface RegisterData {
  fullName: string;
  phone: string;
  password: string;
  email?: string;
  role?: 'TENANT' | 'OWNER' | 'AGENCY';
}

export interface AuthResponse {
  user: Omit<User, 'password'>;
  token: string;
  refreshToken: string;
}

export interface JWTPayload {
  userId: string;
  phone: string;
  role: string;
}

class AuthService {
  private readonly JWT_SECRET: string;
  private readonly JWT_REFRESH_SECRET: string;
  private readonly JWT_EXPIRES_IN: string;
  private readonly JWT_REFRESH_EXPIRES_IN: string;

  constructor() {
    this.JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
    this.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret';
    this.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
    this.JWT_REFRESH_EXPIRES_IN = '30d';
  }

  // Hasher un mot de passe
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  // Vérifier un mot de passe
  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  // Générer un token JWT
  generateToken(payload: JWTPayload): string {
    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES_IN,
      issuer: 'louma-api',
      audience: 'louma-client',
    });
  }

  // Générer un refresh token
  generateRefreshToken(payload: JWTPayload): string {
    return jwt.sign(payload, this.JWT_REFRESH_SECRET, {
      expiresIn: this.JWT_REFRESH_EXPIRES_IN,
      issuer: 'louma-api',
      audience: 'louma-client',
    });
  }

  // Vérifier un token
  verifyToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, this.JWT_SECRET, {
        issuer: 'louma-api',
        audience: 'louma-client',
      }) as JWTPayload;
    } catch (error) {
      throw new Error('Token invalide ou expiré');
    }
  }

  // Vérifier un refresh token
  verifyRefreshToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, this.JWT_REFRESH_SECRET, {
        issuer: 'louma-api',
        audience: 'louma-client',
      }) as JWTPayload;
    } catch (error) {
      throw new Error('Refresh token invalide ou expiré');
    }
  }

  // Inscription
  async register(data: RegisterData): Promise<AuthResponse> {
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.phone, data.phone))
      .limit(1);

    if (existingUser.length > 0) {
      throw new Error('Un utilisateur avec ce numéro de téléphone existe déjà');
    }

    // Hasher le mot de passe
    const hashedPassword = await this.hashPassword(data.password);

    // Créer l'utilisateur
    const [newUser] = await db
      .insert(users)
      .values({
        fullName: data.fullName,
        phone: data.phone,
        password: hashedPassword,
        email: data.email || null,
        role: data.role || 'TENANT',
        isActive: true,
        isVerified: false,
        completionPercent: 25, // Profil de base créé
      })
      .returning();

    // Ne pas renvoyer le mot de passe
    const { password, ...userWithoutPassword } = newUser;

    // Générer les tokens
    const payload: JWTPayload = {
      userId: newUser.id,
      phone: newUser.phone,
      role: newUser.role,
    };

    const token = this.generateToken(payload);
    const refreshToken = this.generateRefreshToken(payload);

    return {
      user: userWithoutPassword,
      token,
      refreshToken,
    };
  }

  // Connexion
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Trouver l'utilisateur par téléphone
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.phone, credentials.phone))
      .limit(1);

    if (!user) {
      throw new Error('Numéro de téléphone ou mot de passe incorrect');
    }

    if (!user.isActive) {
      throw new Error('Ce compte a été désactivé');
    }

    // Vérifier le mot de passe
    const isPasswordValid = await this.verifyPassword(credentials.password, user.password);
    if (!isPasswordValid) {
      throw new Error('Numéro de téléphone ou mot de passe incorrect');
    }

    // Mettre à jour la dernière connexion
    await db
      .update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.id, user.id));

    // Ne pas renvoyer le mot de passe
    const { password, ...userWithoutPassword } = user;

    // Générer les tokens
    const payload: JWTPayload = {
      userId: user.id,
      phone: user.phone,
      role: user.role,
    };

    const token = this.generateToken(payload);
    const refreshToken = this.generateRefreshToken(payload);

    return {
      user: userWithoutPassword,
      token,
      refreshToken,
    };
  }

  // Rafraîchir les tokens
  async refreshToken(refreshToken: string): Promise<{ token: string; refreshToken: string }> {
    const payload = this.verifyRefreshToken(refreshToken);

    // Vérifier que l'utilisateur existe toujours
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, payload.userId))
      .limit(1);

    if (!user || !user.isActive) {
      throw new Error('Utilisateur non trouvé ou compte désactivé');
    }

    // Générer de nouveaux tokens
    const newPayload: JWTPayload = {
      userId: user.id,
      phone: user.phone,
      role: user.role,
    };

    const token = this.generateToken(newPayload);
    const newRefreshToken = this.generateRefreshToken(newPayload);

    return {
      token,
      refreshToken: newRefreshToken,
    };
  }

  // Changer le mot de passe
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    // Trouver l'utilisateur
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    // Vérifier le mot de passe actuel
    const isCurrentPasswordValid = await this.verifyPassword(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new Error('Mot de passe actuel incorrect');
    }

    // Hasher le nouveau mot de passe
    const hashedNewPassword = await this.hashPassword(newPassword);

    // Mettre à jour le mot de passe
    await db
      .update(users)
      .set({ 
        password: hashedNewPassword,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  // Demander une réinitialisation de mot de passe
  async requestPasswordReset(phone: string): Promise<string> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.phone, phone))
      .limit(1);

    if (!user) {
      throw new Error('Aucun utilisateur trouvé avec ce numéro de téléphone');
    }

    // Générer un token de réinitialisation (valide 1 heure)
    const resetToken = jwt.sign(
      { userId: user.id, type: 'password-reset' },
      this.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // TODO: Envoyer le token par SMS
    console.log(`Token de réinitialisation pour ${phone}: ${resetToken}`);

    return resetToken;
  }

  // Réinitialiser le mot de passe
  async resetPassword(resetToken: string, newPassword: string): Promise<void> {
    try {
      const decoded = jwt.verify(resetToken, this.JWT_SECRET) as any;
      
      if (decoded.type !== 'password-reset') {
        throw new Error('Token de réinitialisation invalide');
      }

      // Hasher le nouveau mot de passe
      const hashedPassword = await this.hashPassword(newPassword);

      // Mettre à jour le mot de passe
      await db
        .update(users)
        .set({ 
          password: hashedPassword,
          updatedAt: new Date(),
        })
        .where(eq(users.id, decoded.userId));

    } catch (error) {
      throw new Error('Token de réinitialisation invalide ou expiré');
    }
  }

  // Vérifier le token d'authentification (pour middleware)
  async verifyAuth(token: string): Promise<Omit<User, 'password'>> {
    const payload = this.verifyToken(token);

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, payload.userId))
      .limit(1);

    if (!user || !user.isActive) {
      throw new Error('Utilisateur non trouvé ou compte désactivé');
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

export const authService = new AuthService();
