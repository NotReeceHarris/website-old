/* eslint-disable new-cap */
'use strict';

const express = require('express');
const router = express.Router();
const axios = require('axios');
const { query, json } = require('express');

const authHeader = {
    headers: {
        'Authorization': 'Bearer ddbc58254e61078f381ff1d1bc50e2949b29e0a68ad6d7f4fea4b8027e5926d0e5edd19761768203430ba9476985a0fa84295aba27f2eeb8ffcaab35dcfce449b93047d3401bbd7be6eeb3db9d1706a08c3a874abb4c2667c44f682a892bb50221e92c708ca59cfdef037c17797507946ba144d1b753a74fca7d990d3a44d285'
    }
};

router.get('/blogs', async (req, res, next) => {

        axios.get(`https://cms.reeceharris.net/api/articles?fields=title,description,slug,publishedAt&sort[0]=publishedAt:DESC&populate=banner`, authHeader)
        .then(articles => {
            if (articles.data != null) {
                res.renderMin('./blog/blogs', {articles: articles.data})
            } else {
                res.renderMin('./blog/notfound');
            }
        })
        .catch(error => {
            res.renderMin('./error/500', {error:error});
        });
});

router.get('/blog/:slug', async (req, res, next) => {
    if (req.params.slug) {
        axios.get(`https://cms.reeceharris.net/api/slugify/slugs/article/${req.params.slug}?populate=*`, authHeader)
        .then(article => {
            if (article.data != null) {
                axios.get(`https://cms.reeceharris.net/api/authors/${article.data.data.attributes.author.data.id}?populate=*`, authHeader)
                .then(author => {
                    if (author.data != null) {
                        res.renderMin('./blog/post', {post: article.data.data.attributes, author: author.data});
                    } else {
                        res.renderMin('./blog/notfound');
                    }
                })
                .catch(error => {
                    if (error.response.status == 404) {
                        res.renderMin('./error/404', {error:error});
                    } else {
                        res.renderMin('./error/500', {error:error});
                    }
                });
            } else {
                res.renderMin('./blog/notfound');
            }
        })
        .catch(error => {
            console.log(error)
            if (error != null) {
                if (error.response.status == 404) {
                    res.renderMin('./error/404', {error:error});
                } else {
                    res.renderMin('./error/500', {error:error});
                }
            } else {
                res.renderMin('./error/500', {error:error});
            }
            
        });
    } else {
        res.redirect('/')
    }
});

router.get('/author/:id', async (req, res, next) => {
        axios.get(`https://cms.reeceharris.net/api/articles?fields=title,description,slug,publishedAt&populate=banner,author&sort[0]=createdAt:desc&filters[author][id]=${req.params.id}`, authHeader)
        .then(article => {
            if (article.data != null) {
                axios.get(`https://cms.reeceharris.net/api/authors/${req.params.id}?populate=social.Logo,portrait`, authHeader)
                .then(author => {
                    if (author.data != null) {
                        res.renderMin('./blog/author', {articles: article.data, author: author.data});
                    } else {
                        res.renderMin('./blog/notfound');
                    }
                })
                .catch(error => {
                    if (error.response.status == 404) {
                        res.renderMin('./error/404', {error:error});
                    } else {
                        res.renderMin('./error/500', {error:error});
                    }
                });
            } else {
                res.renderMin('./blog/notfound');
            }
        })
        .catch(error => {
            if (error) {
                if (error.response.status == 404) {
                    res.renderMin('./error/404', {error:error});
                } else {
                    res.renderMin('./error/500', {error:error});
                }
            } else {
                res.renderMin('./error/500', {error:error});
            }
        });
});

router.get('/topic/:topic', async (req, res, next) => {
    if (req.params.topic) {
        axios.get(`https://cms.reeceharris.net/api/topics?fields=title,slug,color,description&filters[slug]=${req.params.topic}`, authHeader)
        .then(topic => {
            if (topic.data != null) {
                axios.get(`https://cms.reeceharris.net/api/articles?fields=title,description,slug,publishedAt&filters[topics][slug]=${req.params.topic}&sort[0]=publishedAt:DESC&populate=banner`, authHeader)
                .then(articles => {
                    if (articles.data != null) {
                        res.renderMin('./blog/topic', {topic: topic.data.data[0], articles: articles.data})
                    } else {
                        res.renderMin('./blog/notfound');
                    }
                })
                .catch(error => {
                    if (error) {
                        if (error.response.status == 404) {
                            res.renderMin('./error/404', {error:error});
                        } else {
                            res.renderMin('./error/500', {error:error});
                        }
                    } else {
                        res.renderMin('./error/500', {error:error});
                    }
                });
            } else {
                res.renderMin('./blog/notfound');
            }
        })
        .catch(error => {
            if (error) {
                if (error.response.status == 404) {
                    res.renderMin('./error/404', {error:error});
                } else {
                    res.renderMin('./error/500', {error:error});
                }
            } else {
                res.renderMin('./error/500', {error:error});
            }
        });
    } else {
        res.redirect('/')
    }
});

router.get('/api/related', async (req, res, next) => {

    let topicQuery = ''

    req.query.topic.split(',').forEach(element => {
        topicQuery += `&filters[topics][slug]=${element}`
    });

    if (req.query.topic == null) {} else {
        axios.get(`https://cms.reeceharris.net/api/articles?fields=title,slug,description,content,publishedAt&populate=banner&sort[0]=publishedAt:desc&pagination[limit]=1&sort[0]=publishedAt:desc&filters[slug][$not]=${req.query.current}`, authHeader)
        .then(latest => {
            axios.get(`https://cms.reeceharris.net/api/articles?fields=title,slug,description,content,publishedAt&populate=banner&sort[0]=publishedAt:desc&pagination[limit]=3&filters[slug][$not]=${req.query.current}&[$and][slug][$not]=${latest.data.data[0].attributes.slug}${topicQuery}`, authHeader)
            .then(response => {
                if (response.data != null) {
                    res.json({data:latest.data.data.concat(response.data.data)})
                } else {
                    res.json({data:latest.data.data.concat(response.data.data)})
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
    }
});

router.get('/api/latest', async (req, res, next) => {
        axios.get(`https://cms.reeceharris.net/api/articles?fields=title,slug,description,content,publishedAt&populate=banner&sort[0]=publishedAt:desc&pagination[limit]=3`, authHeader)
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

router.get('/rss', async (req, res, next) => {
    axios.get(`https://cms.reeceharris.net/api/articles?fields=title,createdAt,description,slug&sort[0]=publishedAt:desc&pagination[limit]=10&populate=banner,topics`, authHeader)
    .then(response => {
        if (response.data != null) {
            
            let items = ``;
            response.data.data.forEach(element => {
                const pubdate = new Date(element.attributes.createdAt);
                const weekday = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
                let category = ''
                if (element.attributes.topics) {
                    element.attributes.topics.data.forEach(topic => {
                        category += `<category domain="https://reeceharris.net/topic/${topic.attributes.slug}">${topic.attributes.title}</category>`
                    })
                }
                items += `<item>
                <title>${element.attributes.title}</title>
                <guid>https://reeceharris.net/blog/${element.attributes.slug}</guid>
                <link>https://reeceharris.net/blog/${element.attributes.slug}</link>
                <language>en-us</language>
                ${category}
                <description>${element.attributes.description}</description>
                <pubDate>${weekday[pubdate.getDay()]}, ${pubdate.getDate()} ${pubdate.toLocaleString('en-US', { month: 'short' })} ${pubdate.getFullYear()} ${pubdate.getHours()}:${pubdate.getMinutes()}:${pubdate.getSeconds()} GMT</pubDate>
                </item>`
            });

            res.set('Content-Type', 'text/xml');
            res.send(`<rss version="2.0"><channel><title>( ͡° ͜ʖ ͡°) reeceharris.net</title><description>Latest articles from the reeceharris.net blog</description><link>https://reeceharris.net</link><image><title>( ͡° ͜ʖ ͡°)</title><url>https://cms.reeceharris.net/uploads/site_logo_5edcfddd75.png</url><link>https://reeceharris.net</link></image>${items}</channel></rss>`)
        } else {
            res.renderMin('./error/404');
        }
    })
    .catch(error => {
        console.log(error)
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