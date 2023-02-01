/* eslint-disable no-negated-condition */
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

router.get('/api/blogs', async (req, res, _next) => {
	axios.get('https://cms.reeceharris.net/api/articles?fields=title,slug,description,content,createdAt&populate=banner&sort[0]=createdAt:desc', authHeader)
		.then(response => {
			if (response.data !== null) {
				res.json(response.data);
			} else {
				res.json(response.data);
			}
		})
		.catch(_error => {
			res.json(`{
            "data": null,
            "error": {
                "status": 500,
                "name": "InternalServerError",
                "message": "Internal Server Error"
            }
        }`);
		});
});

router.post('/api/newletter', async (req, res, _next) => {
	axios.post('https://www.google.com/recaptcha/api/siteverify', null, {params: {
		secret: process.env.recaptchaSecret,
		response: req.body.recaptcha,
	}})
		.then(response => {
			if (response.data !== null) {
				if (response.data.success) {
					axios({
						method: 'post',
						url: 'https://cms.reeceharris.net/api/newletter-signups',
						headers: authHeader.headers,
						data: {
							data: {
								email: req.body.email,
							},
						},
					}).then(_response => {
						res.json({
							data: 'success',
						});
					}).catch(_error => {
						res.json({
							data: null,
							error: {
								status: 403,
								name: 'Forbidden',
								message: 'Forbidden captcha failed',
							},
						});
					});
				} else {
					res.json({
						data: null,
						error: {
							status: 403,
							name: 'Forbidden',
							message: 'Forbidden captcha failed',
						},
					});
				}
			} else {
				res.json({
					data: null,
					error: {
						status: 500,
						name: 'InternalServerError',
						message: 'Internal Server Error',
					},
				});
			}
		})
		.catch(_error => {
			res.json({
				data: null,
				error: {
					status: 500,
					name: 'InternalServerError',
					message: 'Internal Server Error',
				},
			});
		});
});

module.exports = router;
