var express = require("express");
var path = require('path');
var app = express();
var fortune = require('./public/lib/fortune.js');

//set engine
var handlebars = require('express-handlebars').create({defaultLayout: 'main'});
app.engine('handlebars', handlebars.engine);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'handlebars');

//set static folder
app.use(express.static(__dirname + '/public'));

app.set('port', process.env.PORT || 3000);

app.use(function(req, res, next){
	res.locals.showTests = app.get('env') !== 'production' && req.query.test === "1";
	next();
})

app.get('/', function(req, res){
	res.render('home');
});
app.get('/about', function(req, res){
	res.render('about', {fortune : fortune.getFortune()});
});

//404
app.use(function(req, res, next){
	res.status(404);
	res.render('404');
});

//500
app.use(function(err, req, res, next){
	console.error(err.stack);
	res.status(500);
	res.render("500");
});

app.listen(app.get('port'), function(){
	console.log('Express started on http://localhost:' + app.get('port'));
});