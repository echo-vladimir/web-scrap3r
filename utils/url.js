"use strict"
import { URL } from "url"
import path from "path"
import * as cheerio from "cheerio"
import slug from "slug"

export function getPageLinks(currentUrl, body) {
  return Array
    .from(cheerio.load(body)("a"))
    .map((element) => getLinkUrl(currentUrl, element))
    .filter(Boolean)
}

export function getLinkUrl(currentUrl, element) {
  const parsedLink = new URL(element.attribs.href || "", currentUrl)
  const currentParsedUrl = new URL(currentUrl)

  if (parsedLink.hostname !== currentParsedUrl.hostname || !parsedLink.pathname) {
    return null
  }

  return parsedLink.toString()
}

export function urlToFilename(url) {
  const parsedUrl = new URL(url)
  const urlPath = parsedUrl.pathname
    .split("/")
    .filter(comp => comp !== "")
    .map(comp => slug(comp, { remove: null }))
    .join("/")

  let filename = path.join(parsedUrl.hostname, urlPath)
  if (!path.extname(filename).match(/htm/)) {
    filename += ".html"
  }

  return filename
}
