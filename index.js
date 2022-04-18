"use strict"
import scrape from "./scraper.js"

const url = process.argv[2]
const nesting = Number.parseInt(process.argv[3], 10) || 1

scrape(url, nesting, err => {
  if (err) {
    console.error(err)
    process.exit(1)
  }

  log("Download complete")
})
