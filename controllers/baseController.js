const utilities = require("../utilities/")
const baseController = {}

baseController.buildHome = async function(req, res){
  const nav = await utilities.getNav()
  const link = utilities.changeLink(req, res)
  res.render("index", {title: "Home", nav, link})
}

module.exports = baseController
