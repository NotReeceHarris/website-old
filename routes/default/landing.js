/* eslint-disable new-cap */
'use strict';

require('dotenv').config();

const express = require('express');
const router = express.Router();

router.get('/', async (req, res, next) => {
    res.renderMin('./landing/landing');
});

module.exports = router;
