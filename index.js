import scrap3r from "./scrap3r/index.js"

const url = process.argv[2]
const nesting = Number.parseInt(process.argv[3], 10) || 1
const concurrency = Number.parseInt(process.argv[4], 10) || 1

scrap3r(url, nesting, concurrency)
  .then(() => log(`✅ Completed - ${url}`))
  .catch(err => console.error(err))