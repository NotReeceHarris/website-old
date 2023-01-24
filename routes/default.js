/* eslint-disable new-cap */
const fs = require('fs');
const path = require('path');
const express = require('express');
const router = express.Router();

fs.readdirSync(path.join(__dirname, 'default')).forEach(function(file) {
  if (file.substr(-3) != '.js') return;
  const name = file.substr(0, file.indexOf('.'));
  router.use('/', require(path.join(__dirname, 'default') + '/' + name));
});

module.exports = router;
