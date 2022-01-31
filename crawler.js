"use strict";
const mkdirp = require('mkdirp');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

const utils = require('./utils/url');
const log = console.log.bind(console, '>');

module.exports.scrap = (url, cb) => {
    const filename = utils.urlToFile(url);
    fs.stat(`./src/${filename}`, err => {
        if (err === null) {
            return cb(null, filename, false);
        }
        if (err?.code === 'ENOENT') {
            return download(url, filename, () => {
                cb(null, filename, true);
            });
        }
        cb(err);
    });
};

function download(url, filename, cb) {
    log(`[Downloading] - ${url}`);
    axios.get(url).then(res => {
        save(filename, res.data, err => {
            if (err) return cb(err)
            log(`[Downloaded] - ${url}`);
        });
    }).catch(err => cb(err));
}

function save(filename, data, cb) {
    mkdirp(path.resolve(__dirname, `./src/`)).then(() => {
        fs.writeFile(`./src/${filename}`, data, err => {
            if (err) return cb(err);
            log(`[Saved] - ${filename}`);
            cb(null, data);
        });
    }).catch(err => cb(err));
}