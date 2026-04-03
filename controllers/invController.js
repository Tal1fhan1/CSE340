const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

/* ***************************
 *  Build inventory by vehicle details view
 * ************************** */
invCont.buildByVehicleDetails = async function (req, res, next) {
  const vehicle_id = req.params.invId
  const data = await invModel.getInventoryByVehicleId(vehicle_id)
  const grid = await utilities.buildVehicleDetailsGrid(data)
  let nav = await utilities.getNav()
  const vehicleName = data[0].inv_make + ' ' + data[0].inv_model
  const modelYear = data[0].inv_year
  res.render("./inventory/details", {
    title: vehicleName + " Details",
    heading: modelYear + ' ' + vehicleName,
    nav,
    grid,
  })
}

invCont.buildError = async function (req, res, next) {
  const error_id = req.params.errorID
  const data = await invModel.getError(error_id)
  const grid = await utilities.buildErrorGrid(data)
  let nav = await utilities.getNav()
  res.render("./inventory/details", {
    title: "Error",
    nav,
    grid,
  })
}

invCont.buildManagement = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("./inventory/management", {
    title: "Vehicle Management",
    nav,
    errors: null,
  })
}

invCont.buildAddClassification = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("./inventory/add-classification", {
    title: "Add New Classification",
    nav,
    errors: null,
  })
}

invCont.AddClassification = async function (req, res, next) {
  let nav = await utilities.getNav()
  const { classification_name } = req.body

  const classResult = await invModel.addClassification(classification_name)

  if (classResult) {
    let newNav = await utilities.getNav()
    req.flash(
      "notice",
      `Classification added successfully.`
    )
    res.status(201).render("inventory/management", {
      title: "Vehicle Management",
      nav: newNav,
      errors: null,
    })
  } else {
    req.flash("notice", "Sorry, the classification addition failed.")
    res.status(501).render("inventory/add-classification", {
      title: "Add New Classification",
      nav,
      errors: null,
    })
  }
}

invCont.buildAddVehicle = async function (req, res, next) {
  let nav = await utilities.getNav()
  const classificationList = await utilities.buildClassificationList()
  res.render("./inventory/add-vehicle", {
    title: "Add New Vehicle",
    nav,
    classificationList,
    errors: null,
  })
}

invCont.AddVehicle = async function (req, res, next) {
  let nav = await utilities.getNav()
  const { inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id } = req.body
  const classificationList = await utilities.buildClassificationList()

  const vehicleResult = await invModel.addVehicle(inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id)

  if (vehicleResult) {
    let newNav = await utilities.getNav()
    req.flash(
      "notice",
      `Vehicle added successfully.`
    )
    res.status(201).render("inventory/management", {
      title: "Vehicle Management",
      nav: newNav,
      classificationList,
      errors: null,
    })
  } else {
    req.flash("notice", "Sorry, the vehicle addition failed.")
    res.status(501).render("inventory/add-vehicle", {
      title: "Add New Vehicle",
      nav,
      classificationList,
      errors: null,
    })
  }
}

module.exports = invCont
