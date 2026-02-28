import type { Request, Response } from 'express';

export class AdminController {
    static async verificaciondeAdmin(req: Request, res: Response) {
        return res.status(200).json({
            message: 'Acceso autorizado como administrador'
        });
    }
}
