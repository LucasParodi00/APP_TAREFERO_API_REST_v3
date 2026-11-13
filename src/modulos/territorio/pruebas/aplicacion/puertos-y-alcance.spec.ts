import { ContextoSolicitud } from '../../../../comun/aplicacion';
import { resolverAlcanceTerritorio } from '../../aplicacion/alcance/resolver-alcance-territorio';
import { ErrorAccesoDenegado } from '../../dominio/errores';

describe('T03 — Aplicación: Puertos y resolución de alcance territorial (D-01, D-07)', () => {
    const empresaId = '018f6f5d-7a6b-7345-9123-000000000001';
    const actorId = '018f6f5d-7a6b-7345-9123-actor000001';

    describe('resolverAlcanceTerritorio', () => {
        it('debe devolver TODAS para un Administrador', () => {
            const contexto: ContextoSolicitud = {
                solicitudId: '018f6f5d-7a6b-7345-9123-sol000000001',
                actorId,
                empresaId,
                roles: ['ADMINISTRADOR'],
                permisos: ['TER-UC-002', 'TER-UC-003'],
            };

            const alcance = resolverAlcanceTerritorio(contexto);
            expect(alcance.tipo).toBe('TODAS');
        });

        it('debe devolver TODAS para un SuperAdministrador en soporte autorizado', () => {
            const contexto: ContextoSolicitud = {
                solicitudId: '018f6f5d-7a6b-7345-9123-sol000000001',
                actorId,
                empresaId,
                roles: ['SUPERADMINISTRADOR'],
                permisos: ['TER-UC-002', 'TER-UC-003'],
                soporte: {
                    usuarioPlataformaId: 'sup01',
                    sesionId: 'ses01',
                    motivo: 'Ticket de soporte 1234',
                    venceEn: new Date(Date.now() + 60000).toISOString(),
                },
            };

            const alcance = resolverAlcanceTerritorio(contexto);
            expect(alcance.tipo).toBe('TODAS');
        });

        it('debe devolver SELECCION con lista de chacraIds para un Capataz con asignaciones válidas', () => {
            const chacraId1 = '018f6f5d-7a6b-7345-9123-chacra000001';
            const chacraId2 = '018f6f5d-7a6b-7345-9123-chacra000002';
            const contexto: ContextoSolicitud = {
                solicitudId: '018f6f5d-7a6b-7345-9123-sol000000001',
                actorId,
                empresaId,
                roles: ['CAPATAZ'],
                permisos: ['TER-UC-002', 'TER-UC-003'],
                alcance: {
                    chacras: [chacraId1, chacraId2],
                },
            };

            const alcance = resolverAlcanceTerritorio(contexto);
            expect(alcance.tipo).toBe('SELECCION');
            if (alcance.tipo === 'SELECCION') {
                expect(alcance.chacraIds).toEqual([chacraId1, chacraId2]);
            }
        });

        it('debe devolver SELECCION vacía para un Capataz con lista de chacras vacía', () => {
            const contexto: ContextoSolicitud = {
                solicitudId: '018f6f5d-7a6b-7345-9123-sol000000001',
                actorId,
                empresaId,
                roles: ['CAPATAZ'],
                permisos: ['TER-UC-002', 'TER-UC-003'],
                alcance: {
                    chacras: [],
                },
            };

            const alcance = resolverAlcanceTerritorio(contexto);
            expect(alcance.tipo).toBe('SELECCION');
            if (alcance.tipo === 'SELECCION') {
                expect(alcance.chacraIds).toEqual([]);
            }
        });

        it('debe rechazar a un Capataz sin objeto de alcance o sin chacras', () => {
            const contextoSinAlcance: ContextoSolicitud = {
                solicitudId: '018f6f5d-7a6b-7345-9123-sol000000001',
                actorId,
                empresaId,
                roles: ['CAPATAZ'],
                permisos: ['TER-UC-002'],
            };

            expect(() => resolverAlcanceTerritorio(contextoSinAlcance)).toThrow(ErrorAccesoDenegado);
        });

        it('debe rechazar a un Capataz con alcance TODAS o malformado', () => {
            const contextoConTodas: ContextoSolicitud = {
                solicitudId: '018f6f5d-7a6b-7345-9123-sol000000001',
                actorId,
                empresaId,
                roles: ['CAPATAZ'],
                permisos: ['TER-UC-002'],
                alcance: 'TODAS',
            };

            expect(() => resolverAlcanceTerritorio(contextoConTodas)).toThrow(ErrorAccesoDenegado);
        });
    });
});
