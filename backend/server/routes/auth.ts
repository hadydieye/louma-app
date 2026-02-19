import { type Request, type Response } from 'express';
import { authService } from '../services/authService';

// POST /api/auth/register - Inscription
export async function register(req: Request, res: Response) {
  try {
    const { fullName, phone, password, email, role } = req.body;

    // Validation basique
    if (!fullName || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Le nom complet, le téléphone et le mot de passe sont requis',
      });
    }

    // Validation du format du téléphone (format guinéen)
    const phoneRegex = /^(\+224|00224)?[6-7][0-9]{8}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      return res.status(400).json({
        success: false,
        message: 'Format du numéro de téléphone invalide',
      });
    }

    // Validation du mot de passe
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Le mot de passe doit contenir au moins 8 caractères',
      });
    }

    const result = await authService.register({
      fullName,
      phone: phone.replace(/\s/g, ''),
      password,
      email: email || undefined,
      role: role || 'TENANT',
    });

    res.status(201).json({
      success: true,
      data: result,
      message: 'Inscription réussie',
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error instanceof Error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'inscription',
    });
  }
}

// POST /api/auth/login - Connexion
export async function login(req: Request, res: Response) {
  try {
    const { phone, password } = req.body;

    // Validation basique
    if (!phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Le téléphone et le mot de passe sont requis',
      });
    }

    const result = await authService.login({
      phone: phone.replace(/\s/g, ''),
      password,
    });

    res.json({
      success: true,
      data: result,
      message: 'Connexion réussie',
    });
  } catch (error) {
    console.error('Login error:', error);
    
    if (error instanceof Error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erreur lors de la connexion',
    });
  }
}

// POST /api/auth/refresh - Rafraîchir le token
export async function refreshToken(req: Request, res: Response) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token requis',
      });
    }

    const result = await authService.refreshToken(refreshToken);

    res.json({
      success: true,
      data: result,
      message: 'Token rafraîchi',
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    
    if (error instanceof Error) {
      return res.status(401).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erreur lors du rafraîchissement du token',
    });
  }
}

// POST /api/auth/change-password - Changer le mot de passe
export async function changePassword(req: Request, res: Response) {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user?.id; // Sera défini par le middleware d'auth

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentification requise',
      });
    }

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Le mot de passe actuel et le nouveau mot de passe sont requis',
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Le nouveau mot de passe doit contenir au moins 8 caractères',
      });
    }

    await authService.changePassword(userId, currentPassword, newPassword);

    res.json({
      success: true,
      message: 'Mot de passe changé avec succès',
    });
  } catch (error) {
    console.error('Change password error:', error);
    
    if (error instanceof Error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erreur lors du changement de mot de passe',
    });
  }
}

// POST /api/auth/request-password-reset - Demander une réinitialisation
export async function requestPasswordReset(req: Request, res: Response) {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Le numéro de téléphone est requis',
      });
    }

    const resetToken = await authService.requestPasswordReset(phone.replace(/\s/g, ''));

    // En production, vous enverriez ce token par SMS
    res.json({
      success: true,
      message: 'Un code de réinitialisation a été envoyé à votre numéro de téléphone',
      // En développement uniquement, pour les tests
      ...(process.env.NODE_ENV === 'development' && { resetToken }),
    });
  } catch (error) {
    console.error('Request password reset error:', error);
    
    if (error instanceof Error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erreur lors de la demande de réinitialisation',
    });
  }
}

// POST /api/auth/reset-password - Réinitialiser le mot de passe
export async function resetPassword(req: Request, res: Response) {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Le token de réinitialisation et le nouveau mot de passe sont requis',
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Le nouveau mot de passe doit contenir au moins 8 caractères',
      });
    }

    await authService.resetPassword(resetToken, newPassword);

    res.json({
      success: true,
      message: 'Mot de passe réinitialisé avec succès',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    
    if (error instanceof Error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erreur lors de la réinitialisation du mot de passe',
    });
  }
}

// GET /api/auth/me - Obtenir le profil utilisateur
export async function getProfile(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentification requise',
      });
    }

    res.json({
      success: true,
      data: req.user,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du profil',
    });
  }
}
