import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { BadRequestError } from '../utils/errors';

export const validate = (schema: AnyZodObject) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            return next();
        } catch (error) {
            if (error instanceof ZodError) {
                const errors = error.errors.map(e => ({
                    path: e.path.join('.').replace(/^(body|query|params)\./, ''),
                    message: e.message,
                }));
                return next(new BadRequestError('Erreur de validation', errors));
            }
            return next(error);
        }
    };
};

export const validateBody = (schema: AnyZodObject) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            req.body = await schema.parseAsync(req.body);
            return next();
        } catch (error) {
            if (error instanceof ZodError) {
                const errors = error.errors.map(e => ({
                    path: e.path.join('.'),
                    message: e.message,
                }));
                return next(new BadRequestError('Données de requête invalides', errors));
            }
            return next(error);
        }
    };
};
