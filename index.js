"use strict";

const minifyHTML = require('express-minify-html');
const cookieParser = require('cookie-parser');
const serveStatic = require("serve-static");
const compression = require('compression');
const express = require('express');
const path = require('path');
const app = express();

/* View engine set to ejs */

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

/* cookie parser */

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

/* compression and minify to speed up load times */

app.use(compression());
app.use(
    minifyHTML({
        override: true,
        exception_url: false,
        htmlMinifier: {
            removeComments: true,
            collapseWhitespace: true,
            collapseBooleanAttributes: true,
            removeAttributeQuotes: false,
            removeEmptyAttributes: true,
            minifyJS: true,
        },
    })
);

/* Add routes to uri */

app.use(function (req, res, next) {
    res.setHeader('X-Powered-By', '¯\\(º_o)/¯');
    next();
});

app.use(function(req, res, next) {

    if (res.statusCode == 404) {
        if (req.accepts('html')) {
            res.renderMin('./error/404');
            return;
        }

        if (req.accepts('json')) {
            res.json({ error: 'Internal Server Error' });
            return;
        }

        res.type('txt').send('Internal Server Error');
    } else if (res.statusCode == 500) {
        if (req.accepts('html')) {
            res.renderMin('./error/500');
            return;
        }

        if (req.accepts('json')) {
            res.json({ error: 'Not found' });
            return;
        }

        res.type('txt').send('Not found');
    } else {
        next()
    }
  });

app.use('/', require("./routes/default.js"))
app.use('/sandbox', require("./routes/sandbox.js"))
app.use('/static', serveStatic("./public"))

/* START */

const port = 1336

if (!module.parent) {
    app.listen(port, () => {
        console.log(`[server]: listening on port ${port}`);
    });
}
