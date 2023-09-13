const Minifier = require('html-minifier');

/**
* Render with minified HTML (express + nunjucks)
*   Works as a response.method that minifies html string
*   after nunjucks.render compiles and callback
* @param {String} view
* @param {Object} options
*/

module.exports = (req, res, next) => {
	res.oldRender = res.render;
	res.render = function (view, options) {
		this.oldRender(view, options, (err, html) => {
			if (err) {
				throw err;
			}

			html = Minifier.minify(html, {
				removeComments: true,
				collapseWhitespace: true,
				removeAttributeQuotes: true,
				removeEmptyAttributes: true,
				minifyJS: true,
				minifyCSS: true,
				minifyURLs: true,
				useShortDoctype: true,
				preventAttributesEscaping: true,
				html5: true,
				decodeEntities: true,
			});

			res.send(html);
		});
	};

	next();
};
