/* eslint-disable new-cap */
'use strict';

const express = require('express');
const router = express.Router();

router.get('/', async (req, res, _next) => {
	res.render('./portfolio/comingsoon');
});

module.exports = router;
