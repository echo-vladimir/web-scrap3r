import mkdirp from "mkdirp"
import axios from "axios"
import path, { dirname } from "path"
import { fileURLToPath } from "url"
import { promises as fsPromises } from 'fs'

import Link from "../utils/link.js"

global.log = console.log.bind(console, "[scrap3r]")

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default function scrape(url, nesting) {
    const filename = Link.urlToFilename(url)
    return fsPromises
        .readFile(filename, 'utf8')
        .catch(err => {
            if (err.code !== 'ENOENT') {
                throw err
            }
            return download(url, filename)
        })
        .then(data => scrapeLinks(url, data, nesting))
}

function scrapeLinks(currentUrl, data, nesting) {
    let promise = Promise.resolve()
    if (nesting === 0) {
        return promise
    }

    const links = Link.getPageLinks(currentUrl, data)
    for (const link of links) {
        promise = promise.then(() => scrape(link, nesting - 1))
    }

    return promise
}

function download(url, filename) {
    const dataPath = path.resolve(__dirname, "../data")
    const dataDirPath = path.resolve(dataPath, path.dirname(filename))
    let data
    return axios.get(url)
        .then(res => {
            // log(`[Downloaded] - ${url}`)
            data = res.data
            return mkdirp(dataDirPath)
        })
        .then(() => fsPromises.writeFile(path.resolve(dataPath, filename), data))
        .then(() => {
            log(`💾 Saved - ${url}`)
            return data
        })
}