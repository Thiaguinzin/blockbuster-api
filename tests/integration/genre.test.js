const request = require('supertest');
const { Genre } = require('../../models/genre');
const { default: mongoose } = require('mongoose');
const {User} = require('../../models/user');

let server;

describe('/api/genres', () => {
    
    beforeEach(() => {server = require('../../index')})
    afterEach(async () => {
        await server.close();
        await Genre.deleteMany({});
    });

    describe('GET /GetAll', () => {

        it('should return all genres', async () => {
            await Genre.insertMany([
                {name: 'genre1'},
                {name: 'genre2'},
            ]);

            const res = await request(server).get('/api/genre/GetAll');
            expect(res.status).toBe(200);
            expect(res.body.length).toBe(2);
            expect(res.body.some(g => g.name === 'GENRE1')).toBe(true);
            expect(res.body.some(g => g.name === 'GENRE2')).toBe(true);
        })

    });

    describe('GET /GetById', () => {

        it('should return the genre by id', async () => {
            const genre = await Genre.insertOne({name: 'genre1'});
            const res = await request(server).get('/api/genre/GetById/'+genre._id);
            expect(res.status).toBe(200);
            expect(res.body).toMatchObject({name: 'GENRE1'});
        });

        it('should return error when id is invalid', async () => {
            const res = await request(server).get('/api/genre/GetById/1');
            expect(res.status).toBe(404);
        });

    });

    describe('POST /Create', () => {

        let token;
        let name;
        
        const exec = async () => {
            return await request(server)
            .post('/api/genre/Create')
            .set('Authorization', `Bearer ${token}`)
            .send({name});
        }

        beforeEach(() => {
            token = new User().generateAuthToken();
            name = 'genre1';
        });

        it('should return 401 if client is not logged in', async () => {
            
            const res = await request(server)
            .post('/api/genre/Create');

            expect(res.status).toBe(401);
        });

        it('should return 400 if genre name is less than 5 chars', async () => {
            name = 'a';
            const res = await exec();
            expect(res.status).toBe(400);
        });

        it('should return 400 if genre name is greater than 30 chars', async () => {
            name = new Array(32).join('a');
            const res = await exec();
            expect(res.status).toBe(400);
        });        

        it('should save the genre if it is valid', async () => {
            const res = await exec();
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('name', 'GENRE1');
        }); 

    });    

});