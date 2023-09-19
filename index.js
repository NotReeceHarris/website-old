'use strict';

const express = require('express');
const app = express();

app.set('view engine', 'ejs');
app.set('views', require('path').join(__dirname, 'views'));

app.use(require('cookie-parser')());
app.use(express.urlencoded({extended: true}));

app.use(require('compression')());
app.use(require('express-minify')({
	cache: __dirname + '/cache',
}));
app.use(require('./minify'));

app.use((req, res, next) => {
	res.setHeader('X-Powered-By', '¯\\(º_o)/¯');
	res.locals.url = req.protocol + '://' + req.hostname + req.path;

	if (req.hostname === 'reeceharris.net') {
		return res.redirect(req.protocol + '://www.' + req.hostname + req.path);
	}

	return next();
});

app.use('/', require('./routes/default.js'));
app.use('/portfolio', require('./routes/portfolio.js'));
app.use('/sandbox', require('./routes/sandbox.js'));
app.use('/static', require('serve-static')('./public'));

app.use((req, res) => {
	if (res.statusCode === 500) {
		if (req.accepts('html')) {
			return res.status(500).render('./error/500');
		}

		if (req.accepts('json')) {
			return res.status(500).json({error: 'System error!'});
		}

		return res.status(500).type('txt').send('System error!');
	}

	if (req.accepts('html')) {
		return res.status(404).render('./error/404');
	}

	if (req.accepts('json')) {
		return res.status(404).json({error: 'Not found'});
	}

	return res.type('txt').send('Not found');
});

const port = process.argv.slice(2)[0] === 'dev' ? 8081 : 80;
if (!module.parent) {
	app.listen(port, () => {
		console.log(`[server]: listening on port ${port}`);
	});
}
