import { Request, Response, NextFunction } from 'express';
import { body, validationResult, ValidationChain } from 'express-validator';

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array(),
        });
    }
    next();
};

export const validateRegistration: Array<ValidationChain | ((req: Request, res: Response, next: NextFunction) => void)> = [
    body('userName').
    notEmpty().
    withMessage('Name is required'),
    body('name').
    notEmpty().
    withMessage('Name is required'),

    body('email').
    isEmail().
    withMessage('Invalid email format'),

    body('password').
    isLength({ min: 6 }).
    withMessage('Password must be at least 6 characters long'),
    handleValidationErrors,
];


export const validateLogin: Array<ValidationChain | ((req: Request, res: Response, next: NextFunction) => void)> = [
   
    body('userName').
    notEmpty().
    withMessage('userName is required'),

    body('password').
    isLength({ min: 6 }).
    withMessage('Password must be at least 6 characters long'),
    handleValidationErrors,
];
