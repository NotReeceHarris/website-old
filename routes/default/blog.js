/* eslint-disable new-cap */
'use strict';

require('dotenv').config();

const express = require('express');
const router = express.Router();

router.get('/blog', async (req, res, next) => {
    res.renderMin('./blog/post');
});

module.exports = router;