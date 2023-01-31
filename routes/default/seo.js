/* eslint-disable new-cap */
'use strict';

const express = require('express');
const router = express.Router();
var path = require('path');

router.get('/robots.txt', async (req, res, next) => {
    res.type('text/plain')
    res.send("User-agent: *\nAllow: /");
});

router.get('/faq', async (req, res, next) => {
    res.renderMin('./landing/faq');
});

router.get('/favicon.ico', async (req, res, next) => {
    res.type('image/png')
    res.sendFile('./favicon.png', {
            root: path.join(__dirname)
        }, function (err) {
    });
});

router.get('/sitemap.xml', async (req, res, next) => {
    res.set('Content-Type', 'text/xml');
    res.send(`<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        <url>
            <loc>https://reeceharris.net/</loc>
            <lastmod>2023-01-29T16:12:20+03:00</lastmod>
        </url>
        <url>
            <loc>https://reeceharris.net/blogs</loc>
            <lastmod>2023-01-29T07:56:12+03:00</lastmod>
        </url>
        <url>
            <loc>https://reeceharris.net/sandbox</loc>
            <lastmod>2023-01-29T07:56:12+03:00</lastmod>
        </url>
        <url>
            <loc>https://reeceharris.net/sandbox/detector</loc>
            <lastmod>2023-01-29T16:12:20+03:00</lastmod>
        </url>
        <url>
            <loc>https://reeceharris.net/privacy-policy</loc>
            <lastmod>2023-01-29T07:56:12+03:00</lastmod>
        </url>
        <url>
            <loc>https://reeceharris.net/faq</loc>
            <lastmod>2023-01-29T07:56:12+03:00</lastmod>
        </url>
    </urlset>
    `);
});


module.exports = router;
