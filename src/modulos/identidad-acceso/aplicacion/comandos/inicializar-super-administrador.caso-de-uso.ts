import { randomUUID } from 'crypto';
import { RepositorioUsuariosPlataforma } from '../../dominio/repositorios/repositorio-usuarios-plataforma';
import { ServicioHash } from '../puertos/servicio-hash.puerto';
import { Reloj } from '../puertos/reloj.puerto';
import { UsuarioPlataforma } from '../../dominio/entidades/usuario-plataforma.entidad';
import { CorreoAcceso } from '../../dominio/objetos-valor/correo-acceso.vo';
import { ContraseniaPlana } from '../../dominio/objetos-valor/contrasenia-plana.vo';
import { InicializacionNoPermitida } from '../../dominio/errores/errores-identidad-acceso';
import { AccesoDenegado } from '../errores/errores-aplicacion';

export interface ComandoInicializarSuperAdministrador {
    claveSecretaBootstrapping: string;
    correoSuperAdmin: string;
    contraseniaSuperAdmin: string;
}

export class InicializarSuperAdministrador {
    constructor(
        private readonly repoUsuariosPlat: RepositorioUsuariosPlataforma,
        private readonly servicioHash: ServicioHash,
        private readonly reloj: Reloj,
        private readonly claveSecretaConfigurada: string,
    ) {}

    async ejecutar(comando: ComandoInicializarSuperAdministrador): Promise<{ mensaje: string }> {
        if (!comando.claveSecretaBootstrapping || comando.claveSecretaBootstrapping !== this.claveSecretaConfigurada) {
            throw new AccesoDenegado('Clave secreta de bootstrapping inválida.');
        }

        const cantidadActivos = await this.repoUsuariosPlat.contarActivos();
        if (cantidadActivos > 0) {
            throw new InicializacionNoPermitida();
        }

        const correoVo = CorreoAcceso.crear(comando.correoSuperAdmin);
        const contraseniaVo = ContraseniaPlana.crear(comando.contraseniaSuperAdmin);
        const hash = await this.servicioHash.hashearContrasenia(contraseniaVo);

        const usuario = UsuarioPlataforma.crear({
            id: randomUUID(),
            correo: correoVo,
            credencialHash: hash,
            creadoEn: this.reloj.ahora(),
        });

        await this.repoUsuariosPlat.guardar(usuario);

        return { mensaje: 'Plataforma inicializada exitosamente.' };
    }
}
