import { type Request, type Response, type NextFunction } from 'express';
import { authService } from '../services/authService';

// Étendre l'interface Request pour inclure l'utilisateur
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        fullName: string;
        phone: string;
        email: string | null;
        role: string;
        isActive: boolean;
        isVerified: boolean;
        completionPercent: number;
        createdAt: Date;
        updatedAt: Date;
        lastLoginAt: Date | null;
      };
    }
  }
}

// Middleware d'authentification
export async function authenticateToken(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token d\'authentification requis',
      });
    }

    const user = await authService.verifyAuth(token);
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(403).json({
      success: false,
      message: 'Token invalide ou expiré',
    });
  }
}

// Middleware pour vérifier les rôles
export function requireRole(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentification requise',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Permissions insuffisantes',
      });
    }

    next();
  };
}

// Middleware optionnel (ne bloque pas si pas de token)
export async function optionalAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const user = await authService.verifyAuth(token);
      req.user = user;
    }
    
    next();
  } catch (error) {
    // Ignorer les erreurs pour l'auth optionnelle
    next();
  }
}

// Middleware pour vérifier si l'utilisateur est propriétaire de la ressource
export function requireOwnership(resourceIdParam: string = 'id') {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentification requise',
      });
    }

    const resourceId = req.params[resourceIdParam];
    
    // Pour les propriétés, vérifier que l'utilisateur est le propriétaire
    if (req.path.includes('/properties/')) {
      // TODO: Implémenter la vérification de propriété
      // const property = await propertyService.getPropertyById(resourceId);
      // if (property.ownerId !== req.user.id) {
      //   return res.status(403).json({
      //     success: false,
      //     message: 'Vous n\'êtes pas le propriétaire de cette ressource',
      //   });
      // }
    }

    next();
  };
}

// Middleware pour limiter aux propriétaires et agences
export const requireOwnerOrAgency = requireRole(['OWNER', 'AGENCY']);

// Middleware pour tous les utilisateurs authentifiés
export const requireAuth = authenticateToken;
