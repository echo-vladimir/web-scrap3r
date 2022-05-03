import scrap3r from "./scrap3r/index.js"

const url = process.argv[2]
const nesting = Number.parseInt(process.argv[3], 10) || 1

scrap3r(url, nesting)
  .then(() => log("✅ Completed"))
  .catch(err => console.error(err))