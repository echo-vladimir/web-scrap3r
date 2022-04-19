"use strict"
import Scrap3r from "./scrap3r/index.js"

const url = process.argv[2]
const nesting = Number.parseInt(process.argv[3], 10) || 1

new Scrap3r().scrape(url, nesting, err => {
  if (err) {
    console.error(err)
    process.exit(1)
  }

  log("[Download complete]")
})
