import { type Request, type Response } from 'express';
import { z } from 'zod';
import { authService } from '../services/authService';
import { asyncHandler } from '../utils/asyncHandler';
import { BadRequestError, UnauthorizedError } from '../utils/errors';

// Import side-effect: ensures Express.Request augmentation with `user` is loaded
import '../middleware/auth';

// Schemas de validation
const registerSchema = z.object({
  body: z.object({
    fullName: z.string().min(2, "Le nom complet doit contenir au moins 2 caractères"),
    phone: z.string().transform(val => val.replace(/\s|-/g, '')).pipe(z.string().regex(/^(\+224|00224)?[6-7][0-9]{8}$/, "Format du numéro de téléphone invalide")),
    password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
    email: z.string().email("Format d'email invalide").optional().or(z.literal("")),
    role: z.enum(["TENANT", "OWNER", "AGENCY"]).default("TENANT"),
  }),
});

const loginSchema = z.object({
  body: z.object({
    phone: z.string().transform(val => val.replace(/\s|-/g, '')).pipe(z.string().regex(/^(\+224|00224)?[6-7][0-9]{8}$/, "Format du numéro de téléphone invalide")),
    password: z.string().min(1, "Le mot de passe est requis"),
  }),
});

const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, "Le refresh token est requis"),
  }),
});

const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, "Le mot de passe actuel est requis"),
    newPassword: z.string().min(8, "Le nouveau mot de passe doit contenir au moins 8 caractères"),
  }),
});

const updateProfileSchema = z.object({
  body: z.object({
    fullName: z.string().min(2, "Le nom complet doit contenir au moins 2 caractères").optional(),
    email: z.string().email("Format d'email invalide").optional().or(z.literal("")),
    avatar: z.string().optional(),
    commune: z.enum(["Ratoma", "Matam", "Kaloum", "Matoto", "Dixinn"]).optional(),
    budget: z.number().optional(),
    budgetCurrency: z.enum(["GNF", "USD"]).optional(),
    profession: z.string().optional(),
    householdSize: z.number().int().positive().optional(),
  }),
});

// POST /api/auth/register - Inscription
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { fullName, phone, password, email, role } = req.body;

  const result = await authService.register({
    fullName,
    phone: phone,
    password,
    email: email || undefined,
    role: role || 'TENANT',
  });

  res.status(201).json({
    success: true,
    data: result,
    message: 'Inscription réussie',
  });
});

// POST /api/auth/login - Connexion
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { phone, password } = req.body;

  const result = await authService.login({
    phone: phone,
    password,
  });

  res.json({
    success: true,
    data: result,
    message: 'Connexion réussie',
  });
});

// POST /api/auth/refresh - Rafraîchir le token
export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  const result = await authService.refreshToken(refreshToken);

  res.json({
    success: true,
    data: result,
    message: 'Token rafraîchi',
  });
});

// GET /api/auth/me - Récupérer le profil
export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new UnauthorizedError();

  const user = await authService.getUserProfile(userId);

  res.json({
    success: true,
    data: user,
  });
});

// PATCH /api/auth/profile - Mettre à jour le profil
export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new UnauthorizedError();

  const user = await authService.updateProfile(userId, req.body);

  res.json({
    success: true,
    data: user,
    message: 'Profil mis à jour avec succès',
  });
});

// POST /api/auth/change-password - Changer le mot de passe
export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new UnauthorizedError();

  const { currentPassword, newPassword } = req.body;

  await authService.changePassword(userId, currentPassword, newPassword);

  res.json({
    success: true,
    message: 'Mot de passe modifié avec succès',
  });
});

// POST /api/auth/forgot-password - Mot de passe oublié
export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { phone } = req.body;
  if (!phone) throw new BadRequestError('Le numéro de téléphone est requis');

  const resetToken = await authService.requestPasswordReset(phone.replace(/\s/g, ''));

  // En production, on enverrait un SMS. Ici on le renvoie dans la réponse pour le dév.
  res.json({
    success: true,
    message: 'Si un compte existe pour ce numéro, un code de réinitialisation vous a été envoyé.',
    ...(process.env.NODE_ENV !== 'production' && { debug: { resetToken } }),
  });
});

// POST /api/auth/reset-password - Réinitialiser le mot de passe
export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    throw new BadRequestError('Token et nouveau mot de passe requis');
  }

  await authService.resetPassword(token, newPassword);

  res.json({
    success: true,
    message: 'Votre mot de passe a été réinitialisé avec succès.',
  });
});

// Exportation des schémas pour utilisation dans les routes
export const authSchemas = {
  register: registerSchema,
  login: loginSchema,
  refresh: refreshSchema,
  changePassword: changePasswordSchema,
  updateProfile: updateProfileSchema,
};
