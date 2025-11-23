import type { TransaccionDto } from "../DTO/transaccionesDto.js";
export declare class TransaccionesRepository {
    static create(transaccion: TransaccionDto): Promise<import("mysql2").QueryResult>;
    static findByAccount(numero_de_cuenta: string): Promise<any>;
    static findAccountsByUserId(id_user: number): Promise<any>;
    static updateAccountsByUserId(sql: string, values: any[]): Promise<any>;
    static deleteAccountsByUserId(id: number, id_user: number): Promise<any>;
}
//# sourceMappingURL=transaccionesRepository.d.ts.map