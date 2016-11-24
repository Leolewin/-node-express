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
