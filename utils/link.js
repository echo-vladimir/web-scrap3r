import { URL } from "url"
import path from "path"
import * as cheerio from "cheerio"
import slug from "slug"

export default class Link {
  static getPageLinks(currentUrl, body) {
    return Array
      .from(cheerio.load(body)("a"))
      .map((element) => this.getLinkUrl(currentUrl, element))
      .filter(Boolean)
  }

  static getLinkUrl(currentUrl, element) {
    const parsedLink = new URL(element.attribs.href || "", currentUrl)
    const currentParsedUrl = new URL(currentUrl)

    if (parsedLink.hostname !== currentParsedUrl.hostname || !parsedLink.pathname) {
      return null
    }

    return parsedLink.toString()
  }

  static urlToFilename(url) {
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
}