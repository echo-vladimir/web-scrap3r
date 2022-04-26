import scrap3r from "./scrap3r/index.js"

const url = process.argv[2]

scrap3r(url)
  .then(() => log("💾 Complete"))
  .catch(err => console.error(err))