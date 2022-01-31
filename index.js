"use strict";
const crawler = require("./crawler");
const log = console.log.bind(console, '>');

crawler.scrap(process.argv[2], (err, filename, downloaded) => {
  if (err) return log(err);
  if (downloaded) return log(`Completed the download of "${filename}."`);
  return log(`"${filename}" was already downloaded.`);
});