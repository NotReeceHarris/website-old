/* eslint-disable new-cap */
'use strict';

const express = require('express');
const router = express.Router();
const axios = require('axios');

const authHeader = {
    headers: {
        'Authorization': 'Bearer ddbc58254e61078f381ff1d1bc50e2949b29e0a68ad6d7f4fea4b8027e5926d0e5edd19761768203430ba9476985a0fa84295aba27f2eeb8ffcaab35dcfce449b93047d3401bbd7be6eeb3db9d1706a08c3a874abb4c2667c44f682a892bb50221e92c708ca59cfdef037c17797507946ba144d1b753a74fca7d990d3a44d285'
    }
};


router.get('/api/blogs', async (req, res, next) => {
    axios.get(`https://cms.reeceharris.net/api/articles?fields=title,slug,description,content,createdAt&populate=banner&sort[0]=createdAt:desc`, authHeader)
    .then(response => {
        if (response.data != null) {
            res.json(response.data)
        } else {
            res.json(response.data)
        }
    })
    .catch(error => {
        res.json(`{
            "data": null,
            "error": {
                "status": 500,
                "name": "InternalServerError",
                "message": "Internal Server Error"
            }
        }`)
    });
});

router.post('/api/newletter', async (req, res, next) => {

    axios.post(`https://www.google.com/recaptcha/api/siteverify`, null, {params: {
        secret: '6LckWSkkAAAAADD2gij1HmFjwVnwd2V_SkpdowAY',
        response: req.body.recaptcha
    }})
    .then(response => {

        if (response.data != null) {
            if (response.data.success) {
                axios({
                    method: 'post',
                    url: 'https://cms.reeceharris.net/api/newletter-signups',
                    headers: authHeader.headers,
                    data: {
                        "data": {
                            "email": req.body.email
                        }
                    }
                }).then(response => {
                    res.json({
                        "data": "success"
                    })
                }).catch(error => {
                    res.json({
                        "data": null,
                        "error": {
                            "status": 403,
                            "name": "Forbidden",
                            "message": "Forbidden captcha failed"
                        }
                    })
                });
            } else {
                res.json({
                    "data": null,
                    "error": {
                        "status": 403,
                        "name": "Forbidden",
                        "message": "Forbidden captcha failed"
                    }
                })
            }
        } else {
            res.json({
                "data": null,
                "error": {
                    "status": 500,
                    "name": "InternalServerError",
                    "message": "Internal Server Error"
                }
            })
        }

    })
    .catch(error => {
        res.json({
            "data": null,
            "error": {
                "status": 500,
                "name": "InternalServerError",
                "message": "Internal Server Error"
            }
        })
    });
});

module.exports = router;