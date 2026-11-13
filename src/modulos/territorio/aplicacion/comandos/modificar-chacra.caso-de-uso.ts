import { Inject, Injectable } from '@nestjs/common';
import type { ContextoSolicitud, Reloj } from '../../../../comun/aplicacion';
import { RELOJ } from '../../../../comun/aplicacion';
import {
    NombreChacra,
    NombreCortoChacra,
    DireccionChacra,
    PuntoGeograficoReferencia,
    ResponsableChacra,
} from '../../dominio/objetos-valor';
import type { RepositorioChacras } from '../../dominio/repositorios';
import { TOKEN_REPOSITORIO_CHACRAS } from '../../dominio/repositorios';
import {
    ErrorAccesoDenegado,
    ErrorChacraNoEncontrada,
    ErrorVersionConflicto,
    ErrorNombreCortoDuplicado,
    ErrorConsultaInvalida,
} from '../../dominio/errores';

export interface ModificarChacraComando {
    chacraId: string;
    versionEsperada: number;
    nombre?: string;
    nombreCorto?: string;
    responsableNombre?: string | null;
    direccion?: string | null;
    puntoGeograficoReferencia?: { latitud: number; longitud: number } | null;
}

export interface ResultadoModificarChacra {
    id: string;
    empresaId: string;
    nombre: string;
    nombreCorto: string;
    responsableNombre: string | null;
    direccion: string | null;
    puntoGeograficoReferencia: { latitud: number; longitud: number } | null;
    estado: string;
    actualizadoEn: string;
    version: number;
}

@Injectable()
export class ModificarChacraCasoDeUso {
    constructor(
        @Inject(TOKEN_REPOSITORIO_CHACRAS)
        private readonly repositorio: RepositorioChacras,
        @Inject(RELOJ)
        private readonly reloj: Reloj,
    ) {}

    async ejecutar(comando: ModificarChacraComando, contexto: ContextoSolicitud): Promise<ResultadoModificarChacra> {
        if (!contexto?.permisos?.includes('TER-UC-004')) {
            throw new ErrorAccesoDenegado('No posee permiso TER-UC-004 para modificar una chacra.');
        }

        if (!contexto?.empresaId) {
            throw new ErrorAccesoDenegado('Contexto inválido: empresa no identificada.');
        }

        const tieneAlMenosUnCampo =
            comando.nombre !== undefined ||
            comando.nombreCorto !== undefined ||
            comando.responsableNombre !== undefined ||
            comando.direccion !== undefined ||
            comando.puntoGeograficoReferencia !== undefined;

        if (!tieneAlMenosUnCampo) {
            throw new ErrorConsultaInvalida('Debe enviar al menos un campo para modificar.');
        }

        const chacra = await this.repositorio.obtenerPorId(comando.chacraId, contexto.empresaId);
        if (!chacra) {
            throw new ErrorChacraNoEncontrada(comando.chacraId);
        }

        if (chacra.version !== comando.versionEsperada) {
            throw new ErrorVersionConflicto();
        }

        const nuevoNombre = comando.nombre !== undefined ? NombreChacra.crear(comando.nombre) : chacra.nombre;

        let nuevoNombreCorto = chacra.nombreCorto;
        if (comando.nombreCorto !== undefined) {
            nuevoNombreCorto = NombreCortoChacra.crear(comando.nombreCorto);
            if (nuevoNombreCorto.claveNormalizada !== chacra.nombreCorto.claveNormalizada) {
                const existeDuplicado = await this.repositorio.existePorNombreCorto(
                    contexto.empresaId,
                    nuevoNombreCorto.claveNormalizada,
                    chacra.id,
                );
                if (existeDuplicado) {
                    throw new ErrorNombreCortoDuplicado(nuevoNombreCorto.valor);
                }
            }
        }

        let nuevoResponsable = chacra.responsableNombre;
        if (comando.responsableNombre !== undefined) {
            nuevoResponsable = comando.responsableNombre ? ResponsableChacra.crear(comando.responsableNombre) : null;
        }

        let nuevaDireccion = chacra.direccion;
        if (comando.direccion !== undefined) {
            nuevaDireccion = comando.direccion ? DireccionChacra.crear(comando.direccion) : null;
        }

        let nuevoPunto = chacra.puntoGeograficoReferencia;
        if (comando.puntoGeograficoReferencia !== undefined) {
            nuevoPunto = comando.puntoGeograficoReferencia
                ? PuntoGeograficoReferencia.crear(
                      comando.puntoGeograficoReferencia.latitud,
                      comando.puntoGeograficoReferencia.longitud,
                  )
                : null;
        }

        const ahora = this.reloj.ahora();
        const actorId = contexto.actorId;

        chacra.modificarDescriptivos({
            nombre: nuevoNombre,
            nombreCorto: nuevoNombreCorto,
            responsableNombre: nuevoResponsable,
            direccion: nuevaDireccion,
            puntoGeograficoReferencia: nuevoPunto,
            actualizadoEn: ahora,
            actualizadoPor: actorId,
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
            actualizadoEn: ahora.toISOString(),
            version: chacra.version,
        };
    }
}
