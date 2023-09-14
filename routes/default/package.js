/* eslint-disable new-cap */
'use strict';

const express = require('express');
const router = express.Router();

router.get('/package/spino.js', async (req, res, _next) => {
	res.redirect('https://github.com/NotReeceHarris/spino.js');
});

module.exports = router;
