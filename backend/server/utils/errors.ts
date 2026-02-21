export class ApiError extends Error {
    public statusCode: number;
    public success: boolean;
    public errors?: any[];

    constructor(statusCode: number, message: string, errors?: any[]) {
        super(message);
        this.statusCode = statusCode;
        this.success = false;
        this.errors = errors;

        Error.captureStackTrace(this, this.constructor);
    }
}

export class BadRequestError extends ApiError {
    constructor(message: string = 'Requête invalide', errors?: any[]) {
        super(400, message, errors);
    }
}

export class UnauthorizedError extends ApiError {
    constructor(message: string = 'Authentification requise') {
        super(401, message);
    }
}

export class ForbiddenError extends ApiError {
    constructor(message: string = 'Accès refusé') {
        super(403, message);
    }
}

export class NotFoundError extends ApiError {
    constructor(message: string = 'Ressource non trouvée') {
        super(404, message);
    }
}

export class InternalServerError extends ApiError {
    constructor(message: string = 'Erreur interne du serveur') {
        super(500, message);
    }
}
