/* eslint-disable new-cap */
'use strict';

const express = require('express');
const path = require('path');
const router = express.Router();

router.get('/', async (req, res, next) => {
    res.renderMin('./sandbox/index');
});

router.get('/detector', async (req, res, next) => {
    res.renderMin('./sandbox/detector');
});


module.exports = router;
