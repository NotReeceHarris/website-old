/* eslint-disable no-negated-condition */
/* eslint-disable new-cap */
'use strict';

const express = require('express');
const router = express.Router();
const axios = require('axios');
const openpgp = require('openpgp');
const fs = require('fs');

require('dotenv').config();

const privateKeyPath = './privatekey';
const passphrase = process.env.PGP_pass;
const privateKeyFile = fs.readFileSync(privateKeyPath, 'utf-8');

const authHeader = {
	headers: {
		Authorization: process.env.cmsToken,
	},
};

router.get('/blogs', async (req, res, _next) => {
	axios.get('https://cms.reeceharris.net/api/articles?fields=title,description,slug,publishedAt&sort[0]=publishedAt:DESC&populate=banner,topics', authHeader)
		.then(articles => {
			if (articles.data !== null) {
				res.render('./blog/blogs', {articles: articles.data});
			} else {
				res.render('./blog/notfound');
			}
		})
		.catch(error => {
			res.render('./error/500', {error});
		});
});

router.get('/blog/:slug', async (req, res, _next) => {
	if (req.params.slug) {
		axios.get(`https://cms.reeceharris.net/api/slugify/slugs/article/${req.params.slug}?populate=*`, authHeader)
			.then(article => {
				if (article.data !== null) {
					axios.get(`https://cms.reeceharris.net/api/authors/${article.data.data.attributes.author.data.id}?populate=*`, authHeader)
						.then(async author => {
							if (author.data !== null) {
								res.render('./blog/post', {post: article.data.data.attributes, author: author.data});
							} else {
								res.render('./blog/notfound');
							}
						})
						.catch(error => {
							console.log(error);
							if (error.response.status === 404) {
								res.render('./error/404', {error});
							} else {
								res.render('./error/500', {error});
							}
						});
				} else {
					res.render('./blog/notfound');
				}
			})
			.catch(error => {
				if (error !== null) {
					if (error.response.status === 404) {
						res.render('./error/404', {error});
					} else {
						res.render('./error/500', {error});
					}
				} else {
					res.render('./error/500', {error});
				}
			});
	} else {
		res.redirect('/');
	}
});

router.get('/blog/:slug/openPGP', async (req, res, _next) => {
	if (req.params.slug) {
		axios.get(`https://cms.reeceharris.net/api/slugify/slugs/article/${req.params.slug}?populate=*`, authHeader)
			.then(async article => {
				if (article.data !== null) {
					const privateKey = await openpgp.decryptKey({
						privateKey: await openpgp.readPrivateKey({armoredKey: privateKeyFile}),
						passphrase,
					});
					const unsignedMessage = await openpgp.createCleartextMessage({text: article.data.data.attributes.content});
					const cleartextMessage = await openpgp.sign({
						message: unsignedMessage, // CleartextMessage or Message object
						signingKeys: privateKey,
					});
					res.set('Content-Type', 'text/plain');
					res.send(cleartextMessage);
				} else {
					res.render('./blog/notfound');
				}
			})
			.catch(error => {
				if (error !== null) {
					if (error.response.status === 404) {
						res.render('./error/404', {error});
					} else {
						res.render('./error/500', {error});
					}
				} else {
					res.render('./error/500', {error});
				}
			});
	} else {
		res.redirect('/');
	}
});

router.get('/author/:id', async (req, res, _next) => {
	axios.get(`https://cms.reeceharris.net/api/articles?fields=title,description,slug,publishedAt&populate=banner,author,topics&sort[0]=createdAt:desc&filters[author][id]=${req.params.id}`, authHeader)
		.then(article => {
			if (article.data !== null) {
				axios.get(`https://cms.reeceharris.net/api/authors/${req.params.id}?populate=social.Logo,portrait`, authHeader)
					.then(author => {
						if (author.data !== null) {
							res.render('./blog/author', {articles: article.data, author: author.data});
						} else {
							res.render('./blog/notfound');
						}
					})
					.catch(error => {
						if (error.response.status === 404) {
							res.render('./error/404', {error});
						} else {
							res.render('./error/500', {error});
						}
					});
			} else {
				res.render('./blog/notfound');
			}
		})
		.catch(error => {
			if (error) {
				if (error.response.status === 404) {
					res.render('./error/404', {error});
				} else {
					res.render('./error/500', {error});
				}
			} else {
				res.render('./error/500', {error});
			}
		});
});

router.get('/topic/:topic', async (req, res, _next) => {
	if (req.params.topic) {
		axios.get(`https://cms.reeceharris.net/api/topics?fields=title,slug,color,description&filters[slug]=${req.params.topic}`, authHeader)
			.then(topic => {
				if (topic.data !== null) {
					axios.get(`https://cms.reeceharris.net/api/articles?fields=title,description,slug,publishedAt&filters[topics][slug]=${req.params.topic}&sort[0]=publishedAt:DESC&populate=banner,topics`, authHeader)
						.then(articles => {
							if (articles.data !== null) {
								res.render('./blog/topic', {topic: topic.data.data[0], articles: articles.data});
							} else {
								res.render('./blog/notfound');
							}
						})
						.catch(error => {
							if (error) {
								if (error.response.status === 404) {
									res.render('./error/404', {error});
								} else {
									res.render('./error/500', {error});
								}
							} else {
								res.render('./error/500', {error});
							}
						});
				} else {
					res.render('./blog/notfound');
				}
			})
			.catch(error => {
				if (error) {
					if (error.response.status === 404) {
						res.render('./error/404', {error});
					} else {
						res.render('./error/500', {error});
					}
				} else {
					res.render('./error/500', {error});
				}
			});
	} else {
		res.redirect('/');
	}
});

router.get('/api/related', async (req, res, _next) => {
	let topicQuery = '';

	req.query.topic.split(',').forEach(element => {
		topicQuery += `&filters[topics][slug]=${element}`;
	});

	if (req.query.topic !== null) {
		axios.get(`https://cms.reeceharris.net/api/articles?fields=title,slug,description,content,publishedAt&populate=banner&sort[0]=publishedAt:desc&pagination[limit]=3&filters[slug][$not]=${req.query.current}${topicQuery}`, authHeader)
			.then(related => {
				let filterOut = '';
				related.data.data.forEach(element => {
					filterOut += `&filters[$not][slug]=${element.attributes.slug}`;
				});

				let url = `https://cms.reeceharris.net/api/articles?fields=title,slug,description,content,publishedAt&populate=banner&sort[0]=publishedAt:desc&pagination[limit]=3&sort[0]=publishedAt:desc&filters[slug][$not]=${req.query.current}${filterOut}`;
				if (related.data.data.length === 3) {
					url = `https://cms.reeceharris.net/api/articles?fields=title,slug,description,content,publishedAt&populate=banner&sort[0]=publishedAt:desc&pagination[limit]=1&sort[0]=publishedAt:desc&filters[slug][$not]=${req.query.current}${filterOut}`;
				}

				axios.get(url, authHeader)
					.then(latest => {
						related.data.data.shift();
						const newArray = latest.data.data.concat(related.data.data);
						if (newArray.length === 4) {
							newArray.pop();
						}

						if (latest.data !== null) {
							res.json({data: newArray});
						} else {
							res.json({data: newArray});
						}
					})
					.catch(() => {
						res.json(`{
                        "data": null,
                        "error": {
                            "status": 500,
                            "name": "InternalServerError",
                            "message": "Internal Server Error"
                        }
                    }`);
					});
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
	}
});

router.get('/api/latest', async (req, res, _next) => {
	axios.get('https://cms.reeceharris.net/api/articles?fields=title,slug,description,content,publishedAt&populate=banner&sort[0]=publishedAt:desc&pagination[limit]=6', authHeader)
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

router.get('/latest', async (req, res, _next) => {
	axios.get('https://cms.reeceharris.net/api/articles?fields=slug&sort[0]=publishedAt:desc&pagination[limit]=1', authHeader)
		.then(response => {
			if (response.data !== null) {
				res.redirect(`/blog/${response.data.data[0].attributes.slug}`);
			} else {
				res.redirect('/blogs');
			}
		})
		.catch(_error => {
			res.redirect('/blogs');
		});
});

router.get('/random', async (req, res, _next) => {
	axios.get('https://cms.reeceharris.net/api/articles?fields=slug&pagination[limit]=5', authHeader)
		.then(response => {
			if (response.data !== null) {
				const random = Math.floor(Math.random() * response.data.data.length);
				res.redirect(`/blog/${response.data.data[random].attributes.slug}`);
			} else {
				res.redirect('/blogs');
			}
		})
		.catch(_error => {
			res.redirect('/blogs');
		});
});

function xmlSafeString(str) {
	return str.replace(/[<>&'"]/g, char => {
		// eslint-disable-next-line default-case
		switch (char) {
			case '<': return '&lt;';
			case '>': return '&gt;';
			case '&': return '&amp;';
			case '\'': return '&apos;';
			case '"': return '&quot;';
		}
	});
}

router.get('/rss', async (req, res, _next) => {
	axios.get('https://cms.reeceharris.net/api/articles?fields=title,createdAt,description,slug&sort[0]=publishedAt:desc&pagination[limit]=10&populate=banner,topics', authHeader)
		.then(response => {
			if (response.data !== null) {
				let items = '';
				response.data.data.forEach(element => {
					const pubdate = new Date(element.attributes.createdAt);
					const weekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
					let category = '';
					if (element.attributes.topics) {
						element.attributes.topics.data.forEach(topic => {
							category += `<category domain="https://reeceharris.net/topic/${topic.attributes.slug}">${topic.attributes.title}</category>`;
						});
					}

					items += `<item>
                <title>${element.attributes.title}</title>
                <guid>https://reeceharris.net/blog/${element.attributes.slug}</guid>
                <link>https://reeceharris.net/blog/${element.attributes.slug}</link>
                <language>en-us</language>
                ${category}
                <description>${xmlSafeString(element.attributes.description)}</description>
                <pubDate>${weekday[pubdate.getDay()]}, ${pubdate.getDate()} ${pubdate.toLocaleString('en-US', {month: 'short'})} ${pubdate.getFullYear()} ${pubdate.getHours()}:${pubdate.getMinutes()}:${pubdate.getSeconds()} GMT</pubDate>
                </item>`;
				});

				res.set('Content-Type', 'text/xml');
				res.send(`<rss version="2.0"><channel><title>( ͡° ͜ʖ ͡°) reeceharris.net</title><description>Latest articles from the reeceharris.net blog</description><link>https://reeceharris.net</link><image><title>( ͡° ͜ʖ ͡°)</title><url>https://cms.reeceharris.net/uploads/site_logo_5edcfddd75.png</url><link>https://reeceharris.net</link></image>${items}</channel></rss>`);
			} else {
				res.render('./error/404');
			}
		})
		.catch(error => {
			res.render('./error/500', {error});
		});
});

router.get('/rss/topic/:slug', async (req, res, _next) => {
	axios.get(`https://cms.reeceharris.net/api/articles?fields=title,description,slug,publishedAt&filters[topics][slug]=${req.params.slug}&sort[0]=publishedAt:DESC&populate=banner,topics`, authHeader)
		.then(response => {
			if (response.data !== null) {
				let items = '';
				response.data.data.forEach(element => {
					const pubdate = new Date(element.attributes.createdAt);
					const weekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
					let category = '';
					if (element.attributes.topics) {
						element.attributes.topics.data.forEach(topic => {
							category += `<category domain="https://reeceharris.net/topic/${topic.attributes.slug}">${topic.attributes.title}</category>`;
						});
					}

					items += `<item>
                <title>${element.attributes.title}</title>
                <guid>https://reeceharris.net/blog/${element.attributes.slug}</guid>
                <link>https://reeceharris.net/blog/${element.attributes.slug}</link>
                <language>en-us</language>
                ${category}
                <description>${xmlSafeString(element.attributes.description)}</description>
                <pubDate>${weekday[pubdate.getDay()]}, ${pubdate.getDate()} ${pubdate.toLocaleString('en-US', {month: 'short'})} ${pubdate.getFullYear()} ${pubdate.getHours()}:${pubdate.getMinutes()}:${pubdate.getSeconds()} GMT</pubDate>
                </item>`;
				});

				res.set('Content-Type', 'text/xml');
				res.send(`<rss version="2.0"><channel><title>( ͡° ͜ʖ ͡°) reeceharris.net | Topic </title><description>Latest articles from the reeceharris.net blog</description><link>https://reeceharris.net/topic/${req.params.slug}</link><image><title>( ͡° ͜ʖ ͡°)</title><url>https://cms.reeceharris.net/uploads/site_logo_5edcfddd75.png</url><link>https://reeceharris.net</link></image>${items}</channel></rss>`);
			} else {
				res.render('./error/404');
			}
		})
		.catch(error => {
			res.render('./error/500', {error});
		});
});

router.get('/privacy-policy', async (req, res, _next) => {
	axios.get('https://cms.reeceharris.net/api/privacy-policy', authHeader)
		.then(response => {
			if (response.data !== null) {
				res.render('./landing/privacy-policy', {article: response.data});
			} else {
				res.render('./error/404');
			}
		})
		.catch(error => {
			res.render('./error/500', {error});
		});
});

module.exports = router;
