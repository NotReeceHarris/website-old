/* eslint-disable new-cap */
'use strict';

const express = require('express');
const router = express.Router();
const axios = require('axios');
require('dotenv').config();

const authHeader = {
	headers: {
		Authorization: process.env.cmsToken,
	},
};

router.get('/', async (req, res, _next) => {
	axios.get('https://cms.reeceharris.net/api/portfolios?fields=title,content,description,url&populate=screenshots,portfolio_tags', authHeader)
		.then(portfolios => {
			axios.get('https://cms.reeceharris.net/api/portfolio-tags?fields=name', authHeader)
				.then(tags => {
					if (portfolios.data !== null && tags.data !== null) {
						return res.render('./portfolio/index', {portfolios: portfolios.data, tags: tags.data});
					}

					return res.render('./portfolio/index', {portfolios: []});
				})
				.catch(error => {
					console.log(error);
					res.render('./error/500', {error});
				});
		})
		.catch(error => {
			res.render('./error/500', {error});
		});
});

module.exports = router;
