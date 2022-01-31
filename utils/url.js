"use strict";
const urlParse = require('url').parse;
const path = require('path');
const slug = require('slug');

module.exports.urlToFile = (url) => {
  const parsedUrl = urlParse(url);
  const urlPath = parsedUrl.path.split('/')
    .filter(comp => comp !== '')
    .map(comp => slug(comp, { remove: null }))
    .join('/');

  let filename = path.join(parsedUrl.hostname, urlPath);
  if (!path.extname(filename).match(/htm/)) {
    filename += '.html';
  }

  return filename;
};
