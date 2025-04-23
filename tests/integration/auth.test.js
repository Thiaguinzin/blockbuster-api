const request = require('supertest');
const { User } = require('../../models/user');
const { Genre } = require('../../models/genre');

describe('auth middleware', () => {

    let token;

    beforeEach(() => {
        server = require('../../index');
        const generateToken = new User().generateAuthToken();
        token = `Bearer ${generateToken}`;
    })
    afterEach(async () => {
        await server.close();
    });
    
    const exec = function() {
        return request(server)
            .post('/api/genre/Create')
            .set('Authorization', token)
            .send({name: 'genre1'});
    }
    
    it('should return 401 if no token is provide', async () => {
        token = '';
        const result = await exec();
        expect(result.status).toBe(401);
    });

    it('should return 400 if token is invalid', async () => {
        token = 'a';
        const result = await exec();
        expect(result.status).toBe(400);
    });

    it('should return 200 if token is valid', async () => {
        const result = await exec();
        expect(result.status).toBe(200);
    });    

})