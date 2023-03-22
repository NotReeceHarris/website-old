/* eslint-disable new-cap */
'use strict';

const express = require('express');
const router = express.Router();

router.get('/', async (req, res, _next) => {
	res.renderMin('./sandbox/index');
});

router.get('/detector', async (req, res, _next) => {
	res.renderMin('./sandbox/detector');
});

router.get('/nodes', async (req, res, _next) => {
	res.renderMin('./sandbox/vvv');
});

module.exports = router;
