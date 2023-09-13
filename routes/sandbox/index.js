/* eslint-disable new-cap */
'use strict';

const express = require('express');
const router = express.Router();

router.get('/', async (req, res, _next) => {
	res.render('./sandbox/index');
});

router.get('/detector', async (req, res, _next) => {
	res.render('./sandbox/detector');
});

router.get('/nodes', async (req, res, _next) => {
	res.render('./sandbox/vvv');
});

module.exports = router;
