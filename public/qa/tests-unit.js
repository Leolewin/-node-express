var fortune = require('../lib/fortune.js');
var expect = require('../vendor/chai.js');

suite('Fortune cookie tests', function(){
	test('getFortune() should return a fortune', function(){
		expect(typeof fortune.getFortune() === 'string');
	});
});