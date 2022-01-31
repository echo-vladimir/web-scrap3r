"use strict";
const mkdirp = require('mkdirp');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

const utils = require('./utils/url');

module.exports.scrap = (url, cb) => {
    const filename = utils.urlToFile(url);
    const filepath = path.resolve(__dirname, `./src/`)

    fs.stat(`./src/${filename}`, err => {
        if (err === null) return cb(null, filename, false);
        if (err?.code === 'ENOENT') {
            axios.get(url)
                .then(res => {
                    mkdirp(filepath)
                        .then(() => {
                            fs.writeFile(`./src/${filename}`, res.data, err => {
                                if (err) return cb(err);
                                cb(null, filename, true);
                            });
                        });
                }).catch(err => cb(err));
        } else {
            cb(err);
        };
    });
};