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
import { MapeadorEmpresaTypeOrm } from '../../infraestructura/persistencia/typeorm/mapeadores/mapeador-empresa.typeorm';

describe('Mapeador TypeORM Empresa (T06)', () => {
    it('realiza round-trip completo entre dominio y entidad TypeORM con datos completos', () => {
        const empresaOriginal = Empresa.crear({
            id: '019313ea-1111-7000-8000-000000000001',
            nombre: new NombreEmpresa('Yerba Misionera'),
            alias: new AliasEmpresa('yerba-misionera'),
            cuit: new Cuit('30123456789'),
            responsableNombre: new ResponsableNombre('Carlos Gonzalez'),
            ubicacionTexto: new UbicacionTexto('Oberá, Misiones'),
            ubicacionGeografica: new PuntoGeografico(-27.48, -55.12),
            descripcionActividad: new DescripcionActividad('Secadero y molino'),
            actor: 'usuario-admin',
            fecha: new Date('2026-11-10T12:00:00.000Z'),
        });

        empresaOriginal.modificarConfiguracionGeneral({
            paisReferencia: new PaisReferencia('BR'),
            zonaHoraria: new ZonaHoraria('America/Sao_Paulo'),
            monedaPrincipal: new MonedaPrincipal('BRL'),
            esSuperAdmin: true,
            actor: 'usuario-superadmin',
            fecha: new Date('2026-11-10T12:30:00.000Z'),
        });

        const persistencia = MapeadorEmpresaTypeOrm.aPersistencia(empresaOriginal);

        expect(persistencia.id).toBe('019313ea-1111-7000-8000-000000000001');
        expect(persistencia.nombre).toBe('Yerba Misionera');
        expect(persistencia.alias).toBe('yerba-misionera');
        expect(persistencia.cuit).toBe('30123456789');
        expect(persistencia.responsableNombre).toBe('Carlos Gonzalez');
        expect(persistencia.ubicacionTexto).toBe('Oberá, Misiones');
        expect(persistencia.ubicacionLatitud).toBe(-27.48);
        expect(persistencia.ubicacionLongitud).toBe(-55.12);
        expect(persistencia.descripcionActividad).toBe('Secadero y molino');
        expect(persistencia.estado).toBe(EstadoEmpresa.ACTIVA);
        expect(persistencia.version).toBe(2);

        expect(persistencia.configuracionGeneral).toBeDefined();
        expect(persistencia.configuracionGeneral.paisReferencia).toBe('BR');
        expect(persistencia.configuracionGeneral.zonaHoraria).toBe('America/Sao_Paulo');
        expect(persistencia.configuracionGeneral.monedaPrincipal).toBe('BRL');

        const dominioReconstituido = MapeadorEmpresaTypeOrm.aDominio(persistencia);

        expect(dominioReconstituido.id).toBe(empresaOriginal.id);
        expect(dominioReconstituido.nombre.valor).toBe(empresaOriginal.nombre.valor);
        expect(dominioReconstituido.alias.valor).toBe(empresaOriginal.alias.valor);
        expect(dominioReconstituido.cuit.valor).toBe(empresaOriginal.cuit.valor);
        expect(dominioReconstituido.responsableNombre.valor).toBe(empresaOriginal.responsableNombre.valor);
        expect(dominioReconstituido.ubicacionTexto.valor).toBe(empresaOriginal.ubicacionTexto.valor);
        expect(dominioReconstituido.ubicacionGeografica?.latitud).toBe(empresaOriginal.ubicacionGeografica?.latitud);
        expect(dominioReconstituido.ubicacionGeografica?.longitud).toBe(empresaOriginal.ubicacionGeografica?.longitud);
        expect(dominioReconstituido.descripcionActividad.valor).toBe(empresaOriginal.descripcionActividad.valor);
        expect(dominioReconstituido.estado).toBe(empresaOriginal.estado);
        expect(dominioReconstituido.version).toBe(empresaOriginal.version);

        expect(dominioReconstituido.configuracionGeneral.paisReferencia.valor).toBe('BR');
        expect(dominioReconstituido.configuracionGeneral.zonaHoraria.valor).toBe('America/Sao_Paulo');
        expect(dominioReconstituido.configuracionGeneral.monedaPrincipal.valor).toBe('BRL');
    });

    it('realiza round-trip con campos opcionales nulos', () => {
        const empresaMinima = Empresa.crear({
            id: '019313ea-1111-7000-8000-000000000002',
            nombre: new NombreEmpresa('Yerba Simple'),
            alias: new AliasEmpresa('yerba-simple'),
            actor: 'super-admin',
        });

        const persistencia = MapeadorEmpresaTypeOrm.aPersistencia(empresaMinima);
        expect(persistencia.cuit).toBeNull();
        expect(persistencia.responsableNombre).toBeNull();
        expect(persistencia.ubicacionTexto).toBeNull();
        expect(persistencia.ubicacionLatitud).toBeNull();
        expect(persistencia.ubicacionLongitud).toBeNull();
        expect(persistencia.descripcionActividad).toBeNull();

        const dominio = MapeadorEmpresaTypeOrm.aDominio(persistencia);
        expect(dominio.cuit.valor).toBeNull();
        expect(dominio.responsableNombre.valor).toBeNull();
        expect(dominio.ubicacionTexto.valor).toBeNull();
        expect(dominio.ubicacionGeografica).toBeNull();
        expect(dominio.descripcionActividad.valor).toBeNull();
    });
});
