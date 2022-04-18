"use strict"
import mkdirp from "mkdirp"
import axios from "axios"
import path, { dirname } from "path"
import { fileURLToPath } from "url"
import fs from "fs"

import { urlToFilename, getPageLinks } from "./utils/url.js"

global.log = console.log.bind(console, "[scrap3r]")

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default function scrape(url, nesting, cb) {
    const filename = urlToFilename(url)
    fs.readFile(filename, "utf8", (err, fileContent) => {
        if (err) {
            if (err.code !== "ENOENT") {
                return cb(err)
            }

            // The file doesn't exist
            return download(url, filename, (err, requestContent) => {
                if (err) {
                    return cb(err)
                }

                scrapeLinks(url, requestContent, nesting, cb)
            })
        }

        // The file already exists
        scrapeLinks(url, fileContent, nesting, cb)
    })
}

function scrapeLinks(currentUrl, body, nesting, cb) {
    if (nesting === 0) {
        return process.nextTick(cb)
    }

    const links = getPageLinks(currentUrl, body)
    if (links.length === 0) {
        process.nextTick(cb)
    }

    (function iterate(index) {
        if (index === links.length) {
            return cb()
        }

        scrape(links[index], nesting - 1, (err) => {
            if (err) {
                return cb(err)
            }
            iterate(index + 1)
        })
    })(0)
}

function download(url, filename, cb) {
    axios.get(url).then(res => {
        log(`[Downloaded] - ${url}`)
        save(filename, res.data, err => {
            if (err) {
                return cb(err)
            }
            log(`[Saved] - ${url}`)
            cb(null, res.data)
        })

    })
}

function save(filename, data, cb) {
    const filePath = path.resolve(__dirname, "data", path.dirname(filename))
    mkdirp(filePath)
        .then(() =>
            fs.writeFile(path.resolve(__dirname, "data", filename), data, cb))
}