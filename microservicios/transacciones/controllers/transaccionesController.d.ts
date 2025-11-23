import type { Request, Response } from "express";
export declare class TransaccionesController {
    static crearTransaccion(req: Request, res: Response): Promise<void>;
    static obtenerCuentas(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static updateUser(req: Request, res: Response): Promise<void>;
    static eliminarCuenta(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=transaccionesController.d.ts.map