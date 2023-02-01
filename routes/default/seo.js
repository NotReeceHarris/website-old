/* eslint-disable new-cap */
'use strict';

const express = require('express');
const router = express.Router();
const axios = require('axios');
var path = require('path');

const authHeader = {
    headers: {
        'Authorization': 'Bearer ddbc58254e61078f381ff1d1bc50e2949b29e0a68ad6d7f4fea4b8027e5926d0e5edd19761768203430ba9476985a0fa84295aba27f2eeb8ffcaab35dcfce449b93047d3401bbd7be6eeb3db9d1706a08c3a874abb4c2667c44f682a892bb50221e92c708ca59cfdef037c17797507946ba144d1b753a74fca7d990d3a44d285'
    }
};

router.get('/robots.txt', async (req, res, next) => {
    res.type('text/plain')
    res.send("User-agent: *\nAllow: /");
});

router.get('/faq', async (req, res, next) => {
    axios.get(`https://cms.reeceharris.net/api/faq?populate=faq`, authHeader)
    .then(response => {
        if (response.data != null) {
            const middleIndex = Math.ceil(response.data.data.attributes.faq.length / 2);
            res.renderMin('./landing/faq', {faq: [response.data.data.attributes.faq.splice(0, middleIndex),response.data.data.attributes.faq.splice(-middleIndex)]});
        } else {
            res.renderMin('./error/404');
        }
    })
    .catch(error => {
        res.renderMin('./error/500', {error:error});
    });
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
