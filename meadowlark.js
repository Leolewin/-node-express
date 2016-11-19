var express = require("express");
var path = require('path');
var app = express();
var fortune = require('./public/lib/fortune.js');
var weather = require('./public/lib/weatherData.js');
var cresentials = require('./public/lib/credentials.js');
var nodemailer = require('nodemailer');
var router = require('./router');

//nodemailer to set mail server
var mailTransport = nodemailer.createTransport('SMTP', {
	host: 'smtp.163.com',
	secureConnection: true,
	port: 465,
	auth: {
		user: cresentials.mail_163.user,
		pass: cresentials.mail_163.password
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

app.use('/', router);
// app.post('/', function(req, res, err){
// 	var name = req.body.name || '';
// 	var email = req.body.email || '';
// 	var reg = /\w+@\w+.com/ig;
// 	if(!email.match(reg)){
// 		console.log('---------1---------------');
// 		if(req.xhr) return res.json({error : "Invalid name eamil address."});
// 		req.session.flash = {
// 			type: 'danger',
// 			intro: req.body.email,
// 			message: 'This eamil address you entered is not valid!'
// 		};
// 		return res.redirect(303, '/error/login_error');
// 	}else{
// 		return res.redirect(303, '/home');
// 	}
// });
 
// app.get('/', function(req, res){
// 	res.render('index');
// });
// app.get('/home', function (req, res) {
// 	//console.log(res.locals.partials.weather.locations);
// 	res.cookie('user', 'express cookie test');
// 	res.render('home');
// 	// res.render('partials/weather')
// });
// app.get('/about', function (req, res) {
// 	res.render('about', {
// 		fortune: fortune.getFortune(),
// 		pageTestScript: '/qa/tests-about.js'
// 	});
// });
// app.get('/error/login_error', function(req, res){
// 	res.render('loginError');
// });

// app.get('/jquery', function (req, res) {
// 	res.render('jqTest');
// });
// app.get('/tours/hood-river', function (req, res) {
// 	res.render('tours/hood-river');
// });
// app.get('/tours/request-group-rate', function (req, res) {
// 	res.render('tours/request-group-rate');
// });
// app.post('/cart/checkout', function(req, res){
// 	console.log('get in cart confirm');
// 	var cart = req.session.cart || {};
// 	// if(!cart) next(new Error("cart dosn't exist"));
// 	var name = req.body.name || "",
// 		email = req.body.email || "";
// 	var reg = /\w+@\w+.com/ig;
// 	if(!email.match(reg)){
// 		return res.next(new Error('Invalid email address.'));
// 	}
// 	cart.number = Math.random().toString().replace(/^0\.0*/, "");
// 	cart.billing = {
// 		name: name,
// 		email: email
// 	};
// 	res.render('email/carThanks',{
// 		layout: null,
// 		cart: cart
// 	}, function(err, html){
// 		if(err){
// 			console.log("error in email template");
// 		}
// 		mailTransport.sendMail({
// 			from: "Meadowlark Travel : <leolewin@163.com>",
// 			to: cart.billing.email,
// 			subject: "test email for my learning on express",
// 			html: html,
// 			generateTextFromHtml: true
// 		}, function(err){
// 			if(err){
// 				console.log("Unable to send confimation" + err.stack);
// 			}
// 		});
// 	});
// 	res.render('carThanks', {
// 		cart: cart
// 	});
// });

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


// //发送邮件
// mailTransport.sendMail({
// 	from: "Meadowlark Travel <leolewin@163.com>",
// 	to: "449375181@qq.com",
// 	subject: "node express nodemailer demo test",
// 	text: "if the demo succeed, you will see the infomation here and you can delete this mail",
// 	html: "<h1>Meadowlark Travel</h1>\n<p>Thanks with book your trip with Meadowlark Travel</p>" +
// 			"<b>We look forword to your visit"
// },function(err){
// 	if(err){
// 		console.error('Unable to send a mail' + err);
// 	}
// })

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
