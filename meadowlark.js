var express = require("express");
var path = require('path');
var app = express();
var fortune = require('./public/lib/fortune.js');
 var weather = require('./public/lib/weatherData.js');
var cresentials = require('./public/lib/credentials.js');
var nodemailer = require('nodemailer');

//nodemailer to set mail server
var mailTransport = nodemailer.createTransport('SMTP', {
	service: 'Gmail',
	auth: {
		user: cresentials.gmail.user,
		password: cresentials.gmail.password
	}
});


//set engine
var handlebars = require('express-handlebars').create({
		defaultLayout: 'main',
		extname: '.hbs',
		helpers: {
			section: function (name, options) {
				if (!this._sections) this._sections = {};
				this._sections[name] = options.fn(this);
				return null;
			}
		}
	}
);
app.engine('hbs', handlebars.engine);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

//use body-parser to process form
app.use(require('body-parser')());
//use cookie
app.use(require('cookie-parser')(cresentials.cookieSecret));
//use session
app.use(require('express-session')());

//set static folder
app.use(express.static(__dirname + '/public'));

app.set('port', process.env.PORT || 3000);

app.use(function (req, res, next) {
	res.locals.showTests = app.get('env') !== 'production' && req.query.test === "1";
	next();
});


app.use(function (req, res, next) {
	if (!res.locals.partials)
		res.locals.partials = {};
	res.locals.partials.weather = weather.getWeatherData();

	//save the session message and delete it	
	res.locals.flash = req.session.flash;
	delete req.session.flash;
	next();
});


app.post('/', function(req, res, err){
	var name = req.body.name || '';
	var email = req.body.email || '';
	var reg = /\w+@\w+.com/ig;
	if(!email.match(reg)){
		console.log('---------1---------------');
		if(req.xhr) return res.json({error : "Invalid name eamil address."});
		req.session.flash = {
			type: 'danger',
			intro: req.body.email,
			message: 'This eamil address you entered is not valid!'
		};
		return res.redirect(303, '/error/login_error');
	}else{
		return res.redirect(303, '/home');
	}
});
 
app.get('/', function(req, res){
	res.render('index');
});
app.get('/home', function (req, res) {
	//console.log(res.locals.partials.weather.locations);
	res.cookie('user', 'express cookie test');
	res.render('home');
	// res.render('partials/weather')
});
app.get('/about', function (req, res) {
	res.render('about', {
		fortune: fortune.getFortune(),
		pageTestScript: '/qa/tests-about.js'
	});
});
app.get('/error/login_error', function(req, res){
	res.render('loginError');
});

app.get('/jquery', function (req, res) {
	res.render('jqTest');
});
app.get('/tours/hood-river', function (req, res) {
	res.render('tours/hood-river');
});
app.get('/tours/request-group-rate', function (req, res) {
	res.render('tours/request-group-rate');
});

//404
app.use(function (req, res, next) {
	res.status(404);
	res.render('404');
});

//500
app.use(function (err, req, res, next) {
	console.error(err.stack);
	res.status(500);
	res.render("505");
});

app.listen(app.get('port'), function () {
	console.log('Express started on http://localhost:' + app.get('port'));
});


//
// //
// app.use(function(req, res, next));
// app.use('/a', function(req, res, next));
// app.use(function(err, req, res, next));
// 以上是常见的express 中间件的形式
// 
// 
mailTransport.sendMail({
	from: "Meadowlark Travel <info@meadowlarktravel.com>",
	to: "leolewin@163.com",
	subject: "node express nodemailer demo test",
	text: "if the demo succeed, you will see the infomation here and you can delete this mail"
},function(err){
	if(err){
		console.error('Unable to send a mail' + err);
	}
})