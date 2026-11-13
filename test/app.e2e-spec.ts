import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import supertest from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

process.env.DB_PASSWORD = process.env.DB_PASSWORD ?? 'root';
process.env.DB_DATABASE = process.env.DB_DATABASE ?? 'postgres';

describe('AppController (e2e)', () => {
    let app: INestApplication<App>;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    afterEach(async () => {
        if (app) {
            await app.close();
        }
    });

    it('/ (GET)', () => {
        return supertest(app.getHttpServer()).get('/').expect(200).expect('Hello World!');
    });
});
