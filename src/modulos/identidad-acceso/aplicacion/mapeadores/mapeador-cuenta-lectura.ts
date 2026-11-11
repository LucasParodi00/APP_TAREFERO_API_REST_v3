import { CuentaEmpresa } from '../../dominio/entidades/cuenta-empresa.entidad';
import { CuentaEmpresaLectura } from '../puertos/consulta-cuentas-empresa.puerto';

export class MapeadorCuentaLectura {
    static aLectura(cuenta: CuentaEmpresa): CuentaEmpresaLectura {
        return {
            id: cuenta.id,
            empresaId: cuenta.empresaId,
            empleadoId: cuenta.empleadoId,
            nombreMostrado: cuenta.nombreMostrado?.valor,
            correoAcceso: cuenta.correoAcceso.valor,
            accesoWeb: cuenta.accesoWeb,
            accesoMovil: cuenta.accesoMovil,
            roles: cuenta.roles,
            estado: cuenta.estado,
            version: cuenta.version,
        };
    }
}
