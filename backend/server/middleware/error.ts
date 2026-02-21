import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/errors';
import { ZodError } from 'zod';

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.error(`[Error] ${req.method} ${req.path}:`, err);

    // If it's an instance of our custom ApiError
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            errors: err.errors,
        });
    }

    // Handle Zod validation errors (fallback if not caught by middleware)
    if (err instanceof ZodError) {
        return res.status(400).json({
            success: false,
            message: 'Erreur de validation',
            errors: err.errors.map(e => ({
                path: e.path.join('.'),
                message: e.message,
            })),
        });
    }

    // Fallback for unexpected errors
    const statusCode = (err as any).statusCode || (err as any).status || 500;
    const message = err.message || 'Une erreur inattendue est survenue';

    res.status(statusCode).json({
        success: false,
        message: process.env.NODE_ENV === 'production' ? 'Erreur interne du serveur' : message,
        stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
    });
};
