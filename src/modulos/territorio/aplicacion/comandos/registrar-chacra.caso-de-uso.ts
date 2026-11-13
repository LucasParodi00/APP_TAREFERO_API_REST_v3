import { Inject, Injectable } from '@nestjs/common';
import type { ContextoSolicitud, GeneradorIdentificadores, Reloj } from '../../../../comun/aplicacion';
import { GENERADOR_IDENTIFICADORES, RELOJ } from '../../../../comun/aplicacion';
import {
    NombreChacra,
    NombreCortoChacra,
    DireccionChacra,
    PuntoGeograficoReferencia,
    ResponsableChacra,
} from '../../dominio/objetos-valor';
import { Chacra } from '../../dominio/agregados';
import type { RepositorioChacras } from '../../dominio/repositorios';
import { TOKEN_REPOSITORIO_CHACRAS } from '../../dominio/repositorios';
import { ErrorAccesoDenegado, ErrorNombreCortoDuplicado } from '../../dominio/errores';

export interface RegistrarChacraComando {
    nombre: string;
    nombreCorto: string;
    responsableNombre?: string | null;
    direccion?: string | null;
    puntoGeograficoReferencia?: { latitud: number; longitud: number } | null;
}

export interface ResultadoRegistrarChacra {
    id: string;
    empresaId: string;
    nombre: string;
    nombreCorto: string;
    responsableNombre: string | null;
    direccion: string | null;
    puntoGeograficoReferencia: { latitud: number; longitud: number } | null;
    estado: string;
    creadoEn: string;
    version: number;
}

@Injectable()
export class RegistrarChacraCasoDeUso {
    constructor(
        @Inject(TOKEN_REPOSITORIO_CHACRAS)
        private readonly repositorio: RepositorioChacras,
        @Inject(GENERADOR_IDENTIFICADORES)
        private readonly generadorIdentificadores: GeneradorIdentificadores,
        @Inject(RELOJ)
        private readonly reloj: Reloj,
    ) {}

    async ejecutar(comando: RegistrarChacraComando, contexto: ContextoSolicitud): Promise<ResultadoRegistrarChacra> {
        if (!contexto?.permisos?.includes('TER-UC-001')) {
            throw new ErrorAccesoDenegado('No posee permiso TER-UC-001 para registrar una chacra.');
        }

        if (!contexto?.empresaId) {
            throw new ErrorAccesoDenegado('Contexto inválido: empresa no identificada.');
        }

        const nombre = NombreChacra.crear(comando.nombre);
        const nombreCorto = NombreCortoChacra.crear(comando.nombreCorto);

        const existeDuplicado = await this.repositorio.existePorNombreCorto(contexto.empresaId, nombreCorto.claveNormalizada);
        if (existeDuplicado) {
            throw new ErrorNombreCortoDuplicado(nombreCorto.valor);
        }

        const responsable = comando.responsableNombre ? ResponsableChacra.crear(comando.responsableNombre) : null;

        const direccion = comando.direccion ? DireccionChacra.crear(comando.direccion) : null;

        const punto = comando.puntoGeograficoReferencia
            ? PuntoGeograficoReferencia.crear(
                  comando.puntoGeograficoReferencia.latitud,
                  comando.puntoGeograficoReferencia.longitud,
              )
            : null;

        const id = this.generadorIdentificadores.generar();
        const ahora = this.reloj.ahora();
        const actorId = contexto.actorId;

        const chacra = Chacra.registrar({
            id,
            empresaId: contexto.empresaId,
            nombre,
            nombreCorto,
            responsableNombre: responsable,
            direccion,
            puntoGeograficoReferencia: punto,
            creadoEn: ahora,
            creadoPor: actorId,
        });

        await this.repositorio.guardar(chacra);

        return {
            id: chacra.id,
            empresaId: chacra.empresaId,
            nombre: chacra.nombre.valor,
            nombreCorto: chacra.nombreCorto.valor,
            responsableNombre: chacra.responsableNombre ? chacra.responsableNombre.valor : null,
            direccion: chacra.direccion ? chacra.direccion.valor : null,
            puntoGeograficoReferencia: chacra.puntoGeograficoReferencia
                ? {
                      latitud: chacra.puntoGeograficoReferencia.latitud,
                      longitud: chacra.puntoGeograficoReferencia.longitud,
                  }
                : null,
            estado: chacra.estado,
            creadoEn: ahora.toISOString(),
            version: chacra.version,
        };
    }
}
