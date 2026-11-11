import { Empresa } from '../../dominio/agregados/empresa';
import { EstadoEmpresa } from '../../dominio/enumeraciones';
import {
    NombreEmpresa,
    AliasEmpresa,
    Cuit,
    PuntoGeografico,
    ResponsableNombre,
    UbicacionTexto,
    DescripcionActividad,
    PaisReferencia,
    ZonaHoraria,
    MonedaPrincipal,
} from '../../dominio/objetos-valor';
import { TransicionEstadoInvalida, AliasInmutable, ModificacionNoPermitida } from '../../dominio/errores';

describe('Dominio Empresas — Agregado Empresa y Configuración General', () => {
    const actor = 'usuario-superadmin-id';

    function crearEmpresaActiva(): Empresa {
        return Empresa.crear({
            id: '019313ea-1111-7000-8000-000000000001',
            nombre: new NombreEmpresa('Yerba Misionera'),
            alias: new AliasEmpresa('yerba-misionera'),
            actor,
        });
    }

    describe('Creación inicial', () => {
        it('se crea en estado ACTIVA con version 1 y configuración general por defecto', () => {
            const empresa = crearEmpresaActiva();

            expect(empresa.id).toBe('019313ea-1111-7000-8000-000000000001');
            expect(empresa.nombre.valor).toBe('Yerba Misionera');
            expect(empresa.alias.valor).toBe('yerba-misionera');
            expect(empresa.estado).toBe(EstadoEmpresa.ACTIVA);
            expect(empresa.version).toBe(1);
            expect(empresa.creadoPor).toBe(actor);
            expect(empresa.actualizadoPor).toBe(actor);
            expect(empresa.estaHabilitadaParaOperar()).toBe(true);

            // EMP-BR-006: configuración general inicial
            const config = empresa.configuracionGeneral;
            expect(config.paisReferencia.valor).toBe('AR');
            expect(config.zonaHoraria.valor).toBe('America/Argentina/Buenos_Aires');
            expect(config.monedaPrincipal.valor).toBe('ARS');
        });

        it('acepta datos opcionales completos al crearse', () => {
            const empresa = Empresa.crear({
                id: '019313ea-2222-7000-8000-000000000002',
                nombre: new NombreEmpresa('Cooperativa Agrícola'),
                alias: new AliasEmpresa('coop-agricola'),
                cuit: new Cuit('30123456789'),
                responsableNombre: new ResponsableNombre('Carlos Gonzalez'),
                ubicacionTexto: new UbicacionTexto('Oberá, Misiones'),
                ubicacionGeografica: new PuntoGeografico(-27.48, -55.12),
                descripcionActividad: new DescripcionActividad('Producción y secado de yerba mate'),
                actor,
            });

            expect(empresa.cuit.valor).toBe('30123456789');
            expect(empresa.responsableNombre.valor).toBe('Carlos Gonzalez');
            expect(empresa.ubicacionTexto.valor).toBe('Oberá, Misiones');
            expect(empresa.ubicacionGeografica?.latitud).toBe(-27.48);
            expect(empresa.ubicacionGeografica?.longitud).toBe(-55.12);
            expect(empresa.descripcionActividad.valor).toBe('Producción y secado de yerba mate');
        });
    });

    describe('EMP-BR-004 — Transiciones de estado', () => {
        it('permite suspender una empresa ACTIVA pasando a SUSPENDIDA e incrementando versión', () => {
            const empresa = crearEmpresaActiva();
            empresa.suspender('actor-suspensor');

            expect(empresa.estado).toBe(EstadoEmpresa.SUSPENDIDA);
            expect(empresa.actualizadoPor).toBe('actor-suspensor');
            expect(empresa.version).toBe(2);
            expect(empresa.estaHabilitadaParaOperar()).toBe(false);
        });

        it('permite reactivar una empresa SUSPENDIDA pasando a ACTIVA', () => {
            const empresa = crearEmpresaActiva();
            empresa.suspender(actor);
            empresa.reactivar('actor-reactivador');

            expect(empresa.estado).toBe(EstadoEmpresa.ACTIVA);
            expect(empresa.actualizadoPor).toBe('actor-reactivador');
            expect(empresa.version).toBe(3);
            expect(empresa.estaHabilitadaParaOperar()).toBe(true);
        });

        it('permite cerrar una empresa ACTIVA o SUSPENDIDA pasando a CERRADA', () => {
            const empresa1 = crearEmpresaActiva();
            empresa1.cerrar(actor);
            expect(empresa1.estado).toBe(EstadoEmpresa.CERRADA);

            const empresa2 = crearEmpresaActiva();
            empresa2.suspender(actor);
            empresa2.cerrar(actor);
            expect(empresa2.estado).toBe(EstadoEmpresa.CERRADA);
        });

        it('rechaza transiciones inválidas con EMP_TRANSICION_ESTADO_INVALIDA', () => {
            const empresa = crearEmpresaActiva();
            // Ya activa, intentar reactivar
            expect(() => empresa.reactivar(actor)).toThrow(TransicionEstadoInvalida);

            empresa.suspender(actor);
            // Ya suspendida, intentar suspender
            expect(() => empresa.suspender(actor)).toThrow(TransicionEstadoInvalida);

            empresa.cerrar(actor);
            // Desde CERRADA no se puede reactivar, suspender ni volver a cerrar
            expect(() => empresa.reactivar(actor)).toThrow(TransicionEstadoInvalida);
            expect(() => empresa.suspender(actor)).toThrow(TransicionEstadoInvalida);
            expect(() => empresa.cerrar(actor)).toThrow(TransicionEstadoInvalida);
        });
    });

    describe('EMP-BR-013 y EMP-BR-014 — Modificaciones y reglas de alias', () => {
        it('permite a un Administrador modificar una empresa ACTIVA sin cambiar alias', () => {
            const empresa = crearEmpresaActiva();
            empresa.modificarDatos({
                nombre: new NombreEmpresa('Yerba Misionera Renovada'),
                responsableNombre: new ResponsableNombre('Ana Martinez'),
                esSuperAdmin: false,
                actor: 'admin-empresa',
            });

            expect(empresa.nombre.valor).toBe('Yerba Misionera Renovada');
            expect(empresa.responsableNombre.valor).toBe('Ana Martinez');
            expect(empresa.alias.valor).toBe('yerba-misionera');
            expect(empresa.version).toBe(2);
        });

        it('rechaza modificación si se intenta alterar el alias con EMP_ALIAS_INMUTABLE', () => {
            const empresa = crearEmpresaActiva();
            expect(() =>
                empresa.modificarDatos({
                    nombre: new NombreEmpresa('Yerba Misionera'),
                    nuevoAlias: new AliasEmpresa('otro-alias'),
                    esSuperAdmin: true,
                    actor,
                }),
            ).toThrow(AliasInmutable);
        });

        it('permite a un SuperAdmin modificar datos de una empresa SUSPENDIDA', () => {
            const empresa = crearEmpresaActiva();
            empresa.suspender(actor);

            empresa.modificarDatos({
                nombre: new NombreEmpresa('Yerba Misionera Corregida'),
                esSuperAdmin: true,
                actor,
            });

            expect(empresa.nombre.valor).toBe('Yerba Misionera Corregida');
        });

        it('rechaza modificación por un Administrador si la empresa está SUSPENDIDA', () => {
            const empresa = crearEmpresaActiva();
            empresa.suspender(actor);

            expect(() =>
                empresa.modificarDatos({
                    nombre: new NombreEmpresa('Nuevo Nombre'),
                    esSuperAdmin: false,
                    actor: 'admin-empresa',
                }),
            ).toThrow(ModificacionNoPermitida);
        });

        it('rechaza cualquier modificación si la empresa está CERRADA', () => {
            const empresa = crearEmpresaActiva();
            empresa.cerrar(actor);

            expect(() =>
                empresa.modificarDatos({
                    nombre: new NombreEmpresa('Nuevo Nombre'),
                    esSuperAdmin: true,
                    actor,
                }),
            ).toThrow(ModificacionNoPermitida);

            expect(() =>
                empresa.modificarConfiguracionGeneral({
                    paisReferencia: new PaisReferencia('BR'),
                    zonaHoraria: new ZonaHoraria('America/Sao_Paulo'),
                    monedaPrincipal: new MonedaPrincipal('BRL'),
                    esSuperAdmin: true,
                    actor,
                }),
            ).toThrow(ModificacionNoPermitida);
        });
    });
});
