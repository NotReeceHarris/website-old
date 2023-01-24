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

app.use('/', require("./routes/default.js"))
app.use('/static', serveStatic("./public"))

/* START */

const port = 80

if (!module.parent) {
    app.listen(port, () => {
        console.log(`[server]: listening on port ${port}`);
    });
}
