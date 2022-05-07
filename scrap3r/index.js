"use strict";
import mkdirp from "mkdirp"
import axios from "axios"
import path, { dirname } from "path"
import { fileURLToPath } from "url"
import { promises as fsPromises } from "fs"

import Link from "../utils/link.js"
import TaskQueue from "./taskq.js"

global.log = console.log.bind(console, "[scrap3r]")

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default function scrape(url, nesting, concurrency) {
    const queue = new TaskQueue(concurrency)
    return scrapeTask(url, nesting, queue)
}

const scraping = new Set()
function scrapeTask(url, nesting, queue) {
    if (scraping.has(url)) {
        return Promise.resolve()
    }
    scraping.add(url)

    const filename = Link.urlToFilename(url)
    return queue.runTask(() => {
        return fsPromises.readFile(filename, "utf8")
            .catch(err => {
                if (err.code !== "ENOENT") {
                    throw err
                }
                return download(url, filename)
            })
    }).then(data => scrapeLinks(url, data, nesting, queue))
}

function scrapeLinks(currentUrl, data, nesting, queue) {
    if (nesting === 0) {
        return Promise.resolve()
    }
    const links = Link.getPageLinks(currentUrl, data)
    const promises = links.map(link => scrapeTask(link, nesting - 1, queue))

    return Promise.all(promises)
}

function download(url, filename) {
    const dataPath = path.resolve(__dirname, "../data")
    const dataDirPath = path.resolve(dataPath, path.dirname(filename))
    let data

    return axios.get(url)
        .then(res => {
            data = res.data
            return mkdirp(dataDirPath)
        })
        .then(() => fsPromises.writeFile(path.resolve(dataPath, filename), data))
        .then(() => {
            log(`💾 Saved - ${url}`)
            return data
        })
}