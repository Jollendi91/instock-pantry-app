const chai = require('chai');
const chaiHttp = require('chai-http');

const {app} = require('../server');

const expect = chai.expect;
chai.use(chaiHttp);

describe('Pantry call', function() {

    it('should return HTML on GET call', function() {
        return chai.request(app)
            .get('/')
            .then(function(res) {
                expect(res).to.have.status(200);
                expect(res).to.be.html;
            });
    });
});

describe('Shopping list call', function() {

    it('should return Shopping List Data on GET call', function() {
        return chai.request(app)
            .get('/shopping-list.html')
            .then(function(res) {
                expect(res).to.have.status(200);
                expect(res).to.be.html;
            });
    });
});

describe('Recipes call', function() {
    it('should return recipe data on GET call', function() {
        return chai.request(app)
            .get('/recipes.html')
            .then(function(res) {
                expect(res).to.have.status(200);
                expect(res).to.be.html;
            });
    });
});