'use strict';
var bootweb = require('../bootweb');
bootweb.worker = {id:0};
var app = require('../apps/bootweb');
// import the moongoose helper utilities
var utils = require('./utils');
var request = require('supertest');
var should = require('should');

describe('Home page', function () {
 //... previous test
 it('should return 200', function (done) {
   request(app)
     .get('/')
     .expect(200)
     .end(function (err, res) {
       should.not.exist(err);
       return done();
     });
 });
 ;
});
