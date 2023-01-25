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

router.get('/blog/:slug', async (req, res, next) => {

    axios.get(`https://cms.reeceharris.net/api/slugify/slugs/article/${req.params.slug}?populate=*`, authHeader)
    .then(response => {
        if (response.data != null) {
            res.renderMin('./blog/post', {post: response.data});
        } else {
            res.renderMin('./blog/notfound');
        }
    })
    .catch(error => {
        res.renderMin('./error/500', {error:error});
    });

});

router.get('/rss', async (req, res, next) => {
    axios.get(`https://cms.reeceharris.net/api/articles?fields=title,createdAt,slug`, authHeader)
    .then(response => {
        if (response.data != null) {
            
            let items = ``;
            response.data.data.forEach(element => {
                const pubdate = new Date(element.attributes.createdAt);
                const weekday = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
                items += `<item><guid>https://reeceharris.net/cms/${element.attributes.slug}</guid><title>${element.attributes.title}</title><link>https://reeceharris.net/cms/${element.attributes.slug}</link><pubDate>${weekday[pubdate.getDay()]}, ${pubdate.getDate()} ${pubdate.toLocaleString('en-US', { month: 'short' })} ${pubdate.getFullYear()} ${pubdate.getHours()}:${pubdate.getMinutes()}:${pubdate.getSeconds()} GMT</pubDate></item>`
            });

            res.set('Content-Type', 'text/xml');
            res.send(`<rss version="2.0"><channel><title>( ͡° ͜ʖ ͡°)</title><description>Latest articles from the reeceharris.net blog</description><link>https://reeceharris.net</link><image><title>( ͡° ͜ʖ ͡°)</title><url>https://cms.reeceharris.net/uploads/site_logo_5edcfddd75.png</url><link>https://reeceharris.net</link></image>${items}</channel></rss>`)
        } else {
            res.renderMin('./error/404');
        }
    })
    .catch(error => {
        res.renderMin('./error/500', {error:error});
    });
});


router.get('/privacy-policy', async (req, res, next) => {
    axios.get(`https://cms.reeceharris.net/api/privacy-policy`, authHeader)
    .then(response => {
        if (response.data != null) {
            res.renderMin('./landing/privacy-policy', {article: response.data});
        } else {
            res.renderMin('./error/404');
        }
    })
    .catch(error => {
        res.renderMin('./error/500', {error:error});
    });
});

module.exports = router;