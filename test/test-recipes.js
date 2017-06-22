const chai = require('chai');
const chaiHttp = require('chai-http');

const {app, runServer, closeServer} = require('../server');

//should style syntax in our tests
const should = chai.should();

//HTTP requests in our tests
chai.use(chaiHttp);


describe('Recipes', function() {

//activate server before running tests
//'run server' function returns a promise, we return that promise by doing 'return runServer'
before(function() {
	return runServer();
});

//close our server at the end of the tests, otherwise another test module that has `before` block will cause an error
after(function() {
	return closeServer();
});

//test strategy
//make request to `\shopping list`
//inspect response object and prove it has correct code and right keys in response object
it('should list recipes on GET', function() {

	//mocha tests must return a promise or else call a 'done' callback
	// at the end of the test. The `chai.request(server).get...` call is asynchronous and returns a promise, so we return it
	return chai.request(app)
	.get('/recipes')
	.then(function(res) {
		res.should.have.status(200);
		res.should.be.json;
		res.body.should.be.a('array');

		//because we create three recipes on app load
		res.body.length.should.be.at.least(1);
		//each item should be an object with key value pairs: id, name, ingredients
		const expectedKeys = ['id', 'name', 'ingredients'];
		res.body.forEach(function(item) {
			item.should.be.a('object');
			item.should.include.keys(expectedKeys);
		});
	});
});

//test strategy
//make a POST request with data for a new item
//inspect response object and prove it has right status code and returned an 'id'
it('should add a recipe on POST', function() {
	const newRecipe = {name: 'coffee', ingredients: 'beans', checked: false};
	return chai.request(app)
	.post('/recipes')
	.send(newRecipe)
	.then(function(res) {
		res.should.have.status(201);
		res.should.be.json;
		res.body.should.be.a('object');
		res.body.should.include.keys('id', 'name', 'ingredients');
		res.body.id.should.not.be.null;
		//response should be equal to newItem from above if assign id to it from res.body.id
	});
});

//test strategy
//initialize some update data we don't have an 'id' yet
//make a GET request so we can get an item to update
//add the `id` to `updateData`
//inspect response object make sure it has status code and that item gets updated
it('should update recipes on PUT', function() {
	//initialize our updateData her and then after the initial
	//request to the app, update it with an 'id' property so we can make a second PUT call to the app
	const updateData = {
		name: 'foo',
		ingredients: 'beans',
	};

	return chai.request(app)
	//needed to get idea of object to update
	.get('/recipes')
	.then(function(res) {
		updateData.id = res.body[0].id;
		//this will return a promise whose value will be the response object, which can inspect in the next `then` back
		//use promise to avoid nested callback
		return chai.request(app) 
			.put(`/recipes/${updateData.id}`)
			.send(updateData);
	})
	//prove that put request has right status code
	//returns udpated item
	.then(function(res) {
		res.should.have.status(200);
		res.should.be.json;
		res.body.should.be.a('object');
		res.body.should.deep.equal(updateData);
	});
});

	//test strategy
	//get recipe items so we can get id of one to delete
	//delete an item and ensure we get status of 205

	it('should delete recipes on DELETE', function() {
		return chai.request(app)
		//get ID of item to delete
		.get('/recipes')
		.then(function(res) {
			return chai.request(app)
			.delete(`/recipes/${res.body[0].id}`);
		})
		.then(function(res) {
			res.should.have.status(204);
		});
	});
});