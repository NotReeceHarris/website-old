/* eslint-disable new-cap */
'use strict';

const express = require('express');
const path = require('path');
const router = express.Router();

router.get('/', async (req, res, next) => {
    res.renderMin('./landing/landing');
});

router.get('/robots.txt', async (req, res, next) => {
    res.type('text/plain')
    res.send("User-agent: *\nDisallow: /");
});


module.exports = router;
