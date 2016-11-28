var express = require("express");
var path = require('path');
var app = express();
var fortune = require('./public/lib/fortune.js');
var weather = require('./public/lib/weatherData.js');
var cresentials = require('./public/lib/credentials.js');
var nodemailer = require('nodemailer');
var router = require('./router');

//set the runtime model
switch(app.get('env')){
	case 'development':
		app.use(require('morgan')('dev'));
		break;
	case 'production':
		app.use(require('express-logger')({
			path: _dirname + '/log/requsets.log'
		}));
		break;
}

//set the exception process
app.use(function(req, res, next){
	var domain = require('domain').create();
	domain.on('error', function(err){
		console.error('DOMAIN ERROR CAUGHT\n', err.stack);
	});
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
	}
});

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

//show the requests info on diffrent workers
app.use(function(req, res, next){
	var cluster = require('cluster');
	if(cluster.isWorker){
		console.log('worker %d received request', cluster.worker.id);
	}
})

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

function startServer(){
	app.listen(app.get('port'), function () {
	console.log('Express started in ' + app.get('env') + 
		'model on http://localhost:' + app.get('port') + '; Press Control + C to terminate');
	});
}

if(require.main === module){
	startServer();
}else{
	module.exports = startServer;
}
//
// //
// app.use(function(req, res, next));
// app.use('/a', function(req, res, next));
// app.use(function(err, req, res, next));
// 以上是常见的express 中间件的形式
// 
// 
