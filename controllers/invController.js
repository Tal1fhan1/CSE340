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
  let link = utilities.changeLink(req, res)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    link,
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
  let link = utilities.changeLink(req, res)
  const vehicleName = data[0].inv_make + ' ' + data[0].inv_model
  const modelYear = data[0].inv_year
  res.render("./inventory/details", {
    title: vehicleName + " Details",
    heading: modelYear + ' ' + vehicleName,
    nav,
    link,
    grid,
  })
}

/* ***************************
 *  Build inventory by vehicle details view
 * ************************** */
invCont.buildEditVehicle = async function (req, res, next) {
  let nav = await utilities.getNav()
  let link = utilities.changeLink(req, res)
  const classificationList = await utilities.buildClassificationList()
  res.render("./inventory/edit-inventory", {
    title: "Vehicle Edit",
    nav,
    link,
    classificationList,
    errors: null,
  })
}

invCont.buildError = async function (req, res, next) {
  const error_id = req.params.errorID
  const data = await invModel.getError(error_id)
  const grid = await utilities.buildErrorGrid(data)
  let nav = await utilities.getNav()
  let link = utilities.changeLink(req, res)
  res.render("./inventory/details", {
    title: "Error",
    nav,
    link, 
    grid,
  })
}

invCont.buildManagement = async function (req, res, next) {
  let nav = await utilities.getNav()
  const classificationList = await utilities.buildClassificationList()
  let link = utilities.changeLink(req, res)
  res.render("./inventory/management", {
    title: "Vehicle Management",
    nav,
    classificationList,
    link,
    errors: null,
  })
}

invCont.buildAddClassification = async function (req, res, next) {
  let nav = await utilities.getNav()
  let link = utilities.changeLink(req, res)
  res.render("./inventory/add-classification", {
    title: "Add New Classification",
    nav,
    link,
    errors: null,
  })
}

invCont.AddClassification = async function (req, res, next) {
  let nav = await utilities.getNav()
  const { classification_name } = req.body
  let link = utilities.changeLink(req, res)
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
      link,
      errors: null,
    })
  } else {
    req.flash("notice", "Sorry, the classification addition failed.")
    res.status(501).render("inventory/add-classification", {
      title: "Add New Classification",
      nav,
      link,
      errors: null,
    })
  }
}

invCont.buildAddVehicle = async function (req, res, next) {
  let nav = await utilities.getNav()
  let link = utilities.changeLink(req, res)
  const classificationList = await utilities.buildClassificationList()
  res.render("./inventory/add-vehicle", {
    title: "Add New Vehicle",
    nav,
    link,
    classificationList,
    errors: null,
  })
}

invCont.AddVehicle = async function (req, res, next) {
  let nav = await utilities.getNav()
  let link = utilities.changeLink(req, res)
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
      link,
      classificationList,
      errors: null,
    })
  } else {
    req.flash("notice", "Sorry, the vehicle addition failed.")
    res.status(501).render("inventory/add-vehicle", {
      title: "Add New Vehicle",
      nav,
      link,
      classificationList,
      errors: null,
    })
  }
}

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.invId)
  let nav = await utilities.getNav()
  let link = utilities.changeLink(req, res)
  const itemData = await invModel.getInventoryByVehicleId(inv_id)
  const classificationList = await utilities.buildClassificationList(itemData.classification_id)
  const itemName = `${itemData[0].inv_make} ${itemData[0].inv_model}`
  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    link,
    classificationList,
    errors: null,
    inv_id: itemData[0].inv_id,
    inv_make: itemData[0].inv_make,
    inv_model: itemData[0].inv_model,
    inv_year: itemData[0].inv_year,
    inv_description: itemData[0].inv_description,
    inv_image: itemData[0].inv_image,
    inv_thumbnail: itemData[0].inv_thumbnail,
    inv_price: itemData[0].inv_price,
    inv_miles: itemData[0].inv_miles,
    inv_color: itemData[0].inv_color,
    classification_id: itemData[0].classification_id
  })
}

/* ***************************
 *  Build delete inventory view
 * ************************** */
invCont.deleteInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.invId)
  let nav = await utilities.getNav()
  let link = utilities.changeLink(req, res)
  const itemData = await invModel.getInventoryByVehicleId(inv_id)
  const classificationList = await utilities.buildClassificationList(itemData.classification_id)
  const itemName = `${itemData[0].inv_make} ${itemData[0].inv_model}`
  res.render("./inventory/delete-inventory", {
    title: "Delete " + itemName,
    nav,
    link,
    classificationList,
    errors: null,
    inv_id: itemData[0].inv_id,
    inv_make: itemData[0].inv_make,
    inv_model: itemData[0].inv_model,
    inv_year: itemData[0].inv_year,
  })
}

invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  let link = utilities.changeLink(req, res)
  const { inv_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id } = req.body
  const classificationList = await utilities.buildClassificationList()

  const updateResult = await invModel.updateVehicle(inv_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id)

  if (updateResult) {
    let newNav = await utilities.getNav()
    req.flash(
      "notice",
      `Vehicle updated successfully.`
    )
    res.status(201).render("inventory/management", {
      title: "Vehicle Management",
      nav: newNav,
      link,
      classificationList,
      errors: null,
    })
  } else {
    req.flash("notice", "Sorry, the vehicle update failed.")
    res.status(501).render("inventory/edit-inventory", {
      title: "Edit Vehicle",
      nav,
      link,
      classificationList,
      errors: null,
    })
  }
}

invCont.deleteInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  let link = utilities.changeLink(req, res)
  const { inv_id, inv_make, inv_model, inv_year } = req.body
  const classificationList = await utilities.buildClassificationList()

  const deleteResult = await invModel.deleteVehicle(inv_id)

  if (deleteResult) {
    let newNav = await utilities.getNav()
    req.flash(
      "notice",
      `Vehicle deleted successfully.`
    )
    res.status(201).render("inventory/management", {
      title: "Vehicle Management",
      nav: newNav,
      link,
      classificationList,
      errors: null,
    })
  } else {
    req.flash("notice", "Sorry, the vehicle delete failed.")
    res.status(501).render("inventory/delete-inventory", {
      title: "Delete Vehicle",
      nav,
      link,
      classificationList,
      errors: null,
    })
  }
}


module.exports = invCont
