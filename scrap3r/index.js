"use strict"
import mkdirp from "mkdirp"
import axios from "axios"
import path, { dirname } from "path"
import { fileURLToPath } from "url"
import fs from "fs"

import Link from "../utils/link.js"

global.log = console.log.bind(console, "[scrap3r]")

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default class Scrap3r {
    scraping = new Map()

    scrape(url, nesting, cb) {
        if (this.scraping.has(url)) {
            return process.nextTick(cb)
        }

        this.scraping.set(url, true)

        const filename = Link.urlToFilename(url)
        fs.readFile(filename, "utf8", (err, fileContent) => {
            if (err) {
                if (err.code !== "ENOENT") {
                    return cb(err)
                }

                return this.download(url, filename, (err, requestContent) => {
                    if (err) {
                        return cb(err)
                    }

                    this.scrapeLinks(url, requestContent, nesting, cb)
                })
            }

            this.scrapeLinks(url, fileContent, nesting, cb)
        })
    }

    scrapeLinks(currentUrl, body, nesting, cb) {
        if (nesting === 0) {
            return process.nextTick(cb)
        }

        const links = Link.getPageLinks(currentUrl, body)
        if (links.length === 0) {
            process.nextTick(cb)
        }

        let completed = 0
        let hasErrors = false

        function done(err) {
            if (err) {
                hasErrors = true
                return cb(err)
            }

            if (++completed === links.length && !hasErrors) {
                return cb()
            }
        }

        links.forEach(url => {
            this.scrape(url, nesting - 1, done)
        })

    }
    download(url, filename, cb) {
        axios.get(url).then(res => {
            log(`[Downloaded] - ${url}`)
            this.save(filename, res.data, err => {
                if (err) {
                    return cb(err)
                }
                log(`[Saved] - ${url}`)
                cb(null, res.data)
            })

        })
    }
    save(filename, data, cb) {
        const basicPath = path.resolve(__dirname, "../data")
        mkdirp(path.resolve(basicPath, path.dirname(filename)))
            .then(() =>
                fs.writeFile(path.resolve(basicPath, filename), data, cb))
    }
}

const scraping = new Map()
export function scrape(url, nesting, cb) {
    if (scraping.has(url)) {
        return process.nextTick(cb)
    }

    scraping.set(url, true)

    const filename = Link.urlToFilename(url)
    fs.readFile(filename, "utf8", (err, fileContent) => {
        if (err) {
            if (err.code !== "ENOENT") {
                return cb(err)
            }

            return download(url, filename, (err, requestContent) => {
                if (err) {
                    return cb(err)
                }

                scrapeLinks(url, requestContent, nesting, cb)
            })
        }

        scrapeLinks(url, fileContent, nesting, cb)
    })
}

function scrapeLinks(currentUrl, body, nesting, cb) {
    if (nesting === 0) {
        return process.nextTick(cb)
    }

    const links = Link.getPageLinks(currentUrl, body)
    if (links.length === 0) {
        process.nextTick(cb)
    }

    let completed = 0
    let hasErrors = false

    function done(err) {
        if (err) {
            hasErrors = true
            return cb(err)
        }

        if (++completed === links.length && !hasErrors) {
            return cb()
        }
    }

    links.forEach(link => {
        scrape(link, nesting - 1, done)
    })

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
    const basicPath = path.resolve(__dirname, "../data")
    mkdirp(path.resolve(basicPath, path.dirname(filename)))
        .then(() =>
            fs.writeFile(path.resolve(basicPath, filename), data, cb))
}