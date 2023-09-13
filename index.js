'use strict';

const minify = require('express-minify');
const cookieParser = require('cookie-parser');
const serveStatic = require('serve-static');
const compression = require('compression');
const express = require('express');
const path = require('path');
const app = express();

/* View engine set to ejs */
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

/* Cookie parser */
app.use(cookieParser());
app.use(express.urlencoded({extended: true}));

/* Compression and minify to speed up load times */
app.use(compression());
app.use(minify({
	cache: __dirname + '/cache',
}));
app.use(require('./minify'));

/* Add routes to uri */
app.use((req, res, next) => {
	res.setHeader('X-Powered-By', '¯\\(º_o)/¯');
	res.locals.url = req.protocol + '://' + req.hostname + req.path;
	next();
});

app.use('/', require('./routes/default.js'));
app.use('/portfolio', require('./routes/portfolio.js'));
app.use('/sandbox', require('./routes/sandbox.js'));
app.use('/static', serveStatic('./public'));

app.use((req, res) => {
	if (res.statusCode === 500) {
		if (req.accepts('html')) {
			return res.render('./error/500');
		}

		if (req.accepts('json')) {
			return res.json({error: 'Not found'});
		}

		return res.type('txt').send('Not found');
	}

	return res.render('./error/404');
});

/* START */
const port = process.argv.slice(2)[0] === 'dev' ? 8081 : 80;

if (!module.parent) {
	app.listen(port, () => {
		console.log(`[server]: listening on port ${port}`);
	});
}
