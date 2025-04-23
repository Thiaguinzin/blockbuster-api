const request = require('supertest');
const mongoose = require('mongoose');
const {Rental} = require('../../models/rental')
const {Movie} = require('../../models/movie')
const {User} = require('../../models/user')
const {Customer} = require('../../models/customer')
const {Genre} = require('../../models/genre')


describe('POST /return', () => {

    let token;
    let server;
    let rental;
    let rentalId;
    let customerId;
    let movieId;

    beforeEach(async () => {
        server = require('../../index');
        token = new User().generateAuthToken();

        customerId = new mongoose.Types.ObjectId();
        movieId = new mongoose.Types.ObjectId();

        rental = new Rental({
            customer: {
                _id: customerId,
                name: "Thiago",
                phone: "12345"
            },
            movie: {
                _id: movieId,
                title: "Inception",
                dailyRentalRate: 2
            }
        });

        await rental.save();
        rentalId = rental._id;       

    });

    afterEach(async () => {
        await server.close();
        await Rental.deleteMany({});
        await Customer.deleteMany({});
        await Movie.deleteMany({});
        await Genre.deleteMany({});
    });

    
    const exec = () => {
        return request(server)
            .put(`/api/rental/Return/${rentalId.toString()}`)
    }

    it('should return status 401 if user is not logged in', async () => {
        const result = await exec()
        expect(result.status).toBe(401);
    });

    it('should return status 404 if rental is not found it', async () => {
        rentalId = new mongoose.Types.ObjectId();

        const result = await exec()
                        .set("Authorization", `Bearer ${token}`);
                    
        // console.log(result.error.text);
        expect(result.status).toBe(404);
    });

    it('should return status 404 if customer is not found it', async () => {
        const result = await exec()
        .set("Authorization", `Bearer ${token}`);
        expect(result.status).toBe(404);
    });

    it('should return status 404 if movie is not found it', async () => {
        await Customer.insertOne({
            _id: customerId,
            name: "Thiago",
            phone: "12345"
        });
        
        const result = await exec()
        .set("Authorization", `Bearer ${token}`);
        expect(result.status).toBe(404);
    });

    it('should return status 400 if rental is already returned', async () => {        
        
        customerId = new mongoose.Types.ObjectId();
        const movieId = new mongoose.Types.ObjectId();

        rental = new Rental({
            customer: {
                _id: customerId,
                name: "Thiago",
                phone: "12345"
            },
            movie: {
                _id: movieId,
                title: "Inception",
                dailyRentalRate: 2
            },
            dateReturned: Date.now()
        });

        await rental.save();
        rentalId = rental._id;

        const result = await exec()
        .set("Authorization", `Bearer ${token}`);
        expect(result.status).toBe(400);
    });


    it('should return status 200 if request is valid', async () => {
        await Customer.insertOne({ _id: customerId, name: "Thiago", phone: "12345" });
        const genre = await Genre.insertOne({ name: "Comedy" });
        await Movie.insertOne({ _id: movieId, title: "Scary Movie 2", dailyRentalRate: 2, numberInStock: 4, genre: genre}); 

        const result = await exec()
            .set("Authorization", `Bearer ${token}`);

        expect(result.status).toBe(200);
    });

    it('should return dateReturned filled', async () => {
        await Customer.insertOne({ _id: customerId, name: "Thiago", phone: "12345" });
        const genre = await Genre.insertOne({ name: "Comedy" });
        await Movie.insertOne({ _id: movieId, title: "Scary Movie 2", dailyRentalRate: 2, numberInStock: 4, genre: genre}); 

        await exec().set("Authorization", `Bearer ${token}`);

        const rental = await Rental.findById(rentalId);
        expect(rental.dateReturned).not.toBeNull();
    });

    it('should return rentalFees filled', async () => {
        await Customer.insertOne({ _id: customerId, name: "Thiago", phone: "12345" });
        const genre = await Genre.insertOne({ name: "Comedy" });
        await Movie.insertOne({ _id: movieId, title: "Scary Movie 2", dailyRentalRate: 2, numberInStock: 4, genre: genre}); 

        await exec().set("Authorization", `Bearer ${token}`);

        const rental = await Rental.findById(rentalId);
        expect(rental.rentalFee).not.toBeNull();
        expect(rental.rentalFee).not.toBe(0);
    });

    it('should return the updated numberInStock', async () => {
        await Customer.insertOne({ _id: customerId, name: "Thiago", phone: "12345" });
        const genre = await Genre.insertOne({ name: "Comedy" });
        await Movie.insertOne({ _id: movieId, title: "Scary Movie 2", dailyRentalRate: 2, numberInStock: 4, genre: genre}); 

        const movieBefore = await Movie.findById(movieId);
        const numberInStockBefore = movieBefore.numberInStock;

        await exec().set("Authorization", `Bearer ${token}`);

        const movie = await Movie.findById(movieId);

        expect((numberInStockBefore + 1) == movie.numberInStock).toBeTruthy();
    });

})