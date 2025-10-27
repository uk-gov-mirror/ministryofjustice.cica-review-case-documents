import { describe, it, beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';

import createDBQuery from '../db/index.js';

describe('search-service router', () => {
    let app

    beforeEach(async () => {
        const fakeResults = { hits: { hits: [{ _id: 1 }] } };
        const searchSpy = mock.fn(async () => fakeResults);
        class FakeClient {
            constructor() {}
            search = searchSpy;
        }
        const fakeLogger = mock.fn(() => {});
        const db = createDBQuery({
            Client: FakeClient,
            logger: fakeLogger
        });
        // process.env.APP_API_URL = 'http://find-tool.local'
        // process.env.APP_COOKIE_NAME = 'testcookiename'
        // process.env.APP_COOKIE_SECRET = 'omesecretthatisusedforthecookiesecret'
        // process.env.APP_SEARCH_PAGINATION_ITEMS_PER_PAGE = 5;
        const { default: importedApp } = await import('../app.js');
        app = importedApp;
    });

    afterEach(() => {
        mock.reset();
        mock.restoreAll();
    });

    describe('/search', () => {
        describe('GET', () => {
            describe('No CRN in query parameters', () => {
                it('Should redirect to `/case`', async () => {
                    const response = await request(app).get('/search');
                    assert.equal(response.status, 302);
                    assert.match(response.text, /Found. Redirecting to \/case/);
                });
            });
            describe('CRN in query parameters', () => {
                it('Should render the search landing page', async () => {
                    const response = await request(app).get('/search?crn=25-123456');
                    assert.equal(response.status, 200);
                    assert.match(response.text, /<title>Search - CICA FIND - GOV.UK<\/title>/);
                });
                it('Should redirect to the search results page when no path parameter present', async () => {
                    const response = await request(app).get('/search/example?crn=25-123456');
                    assert.equal(response.status, 302);
                    assert.match(response.headers.location, /\/search\/example\/1\/5$/);
                });
                it('Should redirect to the search results page when pageNumber path parameter present', async () => {
                    const response = await request(app).get('/search/example/2?crn=25-123456');
                    assert.equal(response.status, 302);
                    assert.match(response.headers.location, /\/search\/example\/2\/5$/);
                });
            });
        });
    });
});
