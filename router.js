var express = require("express");
var router = express.Router();
var app = express();

//set the exception process
app.use(function(req, res, next){
	var domain = require('domain').create();
	domain.on('error', function(err){
		console.error('DOMAIN ERROR CAUGHT\n', err.stack);

		try{
			//在5s内进行保护关机
			setTimeout(function(){
				console.error('Failsafe Shoutdown.');
			}, 500);

			//从集群中断开
			var worker = require('cluster').worker;
			if(worker){
				worker.disconnect();
			}

			//停止接受请求
			server.close();

			try{
				//try express error router
				next(err);
			}catch(err){
				//if the express router failed, try to response with common text
				console.error('Express error mechanism failed.\n', err.stack);
				res.statusCode = 500;
				res.setheader('content-type', 'text/plain');
				res.render("505");
			}
		}catch(err){
			console.error('Unable to send 500 response.\n', err.stack);
		}
	});

	//向域中添加请求和响应对象
	domain.add(req);
	domain.add(res);

	//执行該域中剩余的请求链
	domain.run(next);
});

router.post('/', function(req, res, err){
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
 
router.get('/', function(req, res){
	res.render('index');
});
router.get('/home', function (req, res) {
	//console.log(res.locals.partials.weather.locations);
	res.cookie('user', 'express cookie test');
	res.render('home');
	// res.render('partials/weather')
});
router.get('/about', function (req, res) {
	res.render('about', {
		fortune: fortune.getFortune(),
		pageTestScript: '/qa/tests-about.js'
	});
});
router.get('/error/login_error', function(req, res){
	res.render('loginError');
});

router.get('/jquery', function (req, res) {
	res.render('jqTest');
});
router.get('/tours/hood-river', function (req, res) {
	res.render('tours/hood-river');
});
router.get('/tours/request-group-rate', function (req, res) {
	res.render('tours/request-group-rate');
});
router.post('/cart/checkout', function(req, res){
	console.log('get in cart confirm');
	var cart = req.session.cart || {};
	// if(!cart) next(new Error("cart dosn't exist"));
	var name = req.body.name || "",
		email = req.body.email || "";
	var reg = /\w+@\w+.com/ig;
	if(!email.match(reg)){
		return res.next(new Error('Invalid email address.'));
	}
	cart.number = Math.random().toString().replace(/^0\.0*/, "");
	cart.billing = {
		name: name,
		email: email
	};
	res.render('email/carThanks',{
		layout: null,
		cart: cart
	}, function(err, html){
		if(err){
			console.log("error in email template");
		}
		mailTransport.sendMail({
			from: "Meadowlark Travel : <leolewin@163.com>",
			to: cart.billing.email,
			subject: "test email for my learning on express",
			html: html,
			generateTextFromHtml: true
		}, function(err){
			if(err){
				console.log("Unable to send confimation" + err.stack);
			}
		});
	});
	res.render('carThanks', {
		cart: cart
	});
});

router.get('/todolist', function(req, res){
	res.render('todolist');
});

//error process
router.get('/fail', function(req, res){
	throw new Error('Nope!');
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

module.exports = router;