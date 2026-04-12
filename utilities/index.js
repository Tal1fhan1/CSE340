const e = require("connect-flash")
const invModel = require("../models/inventory-model")
const Util = {}
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
  let grid
  if(data.length > 0){
    grid = '<ul class="inv-display">'
    data.forEach(vehicle => { 
      grid += '<li>'
      grid += '<img src="' + vehicle.inv_thumbnail 
      +'" alt="' + vehicle.inv_make + ' ' + vehicle.inv_model 
      +' on CSE Motors">'
      grid += '<h2>'
      grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
      grid += '</h2>'
      grid += '<span>$' 
      + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else { 
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

/* **************************************
* Build the vehicle details view HTML
* ************************************ */
Util.buildVehicleDetailsGrid = async function(info){
  let grid
  if(info.length > 0){
    info.forEach(vehicle => { 
      grid = '<div class="vehicleDetails">'
      grid += '<img src="' + vehicle.inv_image 
      +'" alt="'+ vehicle.inv_make + ' ' + vehicle.inv_model 
      +' on CSE Motors">'
      grid += '<ul class="vehicle-details-display">'
      grid += '<li><h2>'
      grid += vehicle.inv_make + ' ' + vehicle.inv_model + ' Details'
      grid += '</h2></li>'

      grid += '<li><h3>' 
      grid += 'Price: $' + new Intl.NumberFormat('en-US').format(vehicle.inv_price)
      grid += '</h3></li>'

      grid += '<li><h3>' 
      grid += 'Description: '
      grid += '<span>' + vehicle.inv_description + '</span>'
      grid += '</h3></li>'

      grid += '<li><h3>' 
      grid += 'Color: '
      grid += '<span>' + vehicle.inv_color + '</span>'
      grid += '</h3></li>'

      grid += '<li><h3>' 
      grid += 'Miles: '
      grid += '<span>' + new Intl.NumberFormat('en-US').format(vehicle.inv_miles) + '</span>'
      grid += '</h3></li>'
      grid += '</ul>'

      grid += '</div>'

    })
  } else { 
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

Util.buildErrorGrid = async function(stuff){
  let grid
  if(stuff.length > 0){
    stuff.forEach(vehicle => { 
      grid = '<div class="vehicleDetails">'
      grid += '<img src="' + vehicle.inv_image 
      +'" alt="'+ vehicle.inv_make + ' ' + vehicle.inv_model 
      +' on CSE Motors">'
      grid += '<ul class="vehicle-details-display">'
      grid += '<li><h2>'
      grid += vehicle.inv_make + ' ' + vehicle.inv_model + ' Details'
      grid += '</h2></li>'

      grid += '<li><h3>' 
      grid += 'Price: $' + new Intl.NumberFormat('en-US').format(vehicle.inv_price)
      grid += '</h3></li>'

      grid += '<li><h3>' 
      grid += 'Description: '
      grid += '<span>' + vehicle.inv_description + '</span>'
      grid += '</h3></li>'

      grid += '<li><h3>' 
      grid += 'Color: '
      grid += '<span>' + vehicle.inv_color + '</span>'
      grid += '</h3></li>'

      grid += '<li><h3>' 
      grid += 'Miles: '
      grid += '<span>' + new Intl.NumberFormat('en-US').format(vehicle.inv_miles) + '</span>'
      grid += '</h3></li>'
      grid += '</ul>'

      grid += '</div>'

    })
  } else { 
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

Util.buildClassificationList = async function (classification_id = null) {
    let things = await invModel.getClassifications()
    let classificationList =
      '<select name="classification_id" id="classificationList" required value="<%= locals.inv_make %>">'
    classificationList += "<option value=''>Choose a Classification</option>"
    things.rows.forEach((row) => {
      classificationList += '<option value="' + row.classification_id + '"'
      if (
        classification_id != null &&
        row.classification_id == classification_id
      ) {
        classificationList += " selected "
      }
      classificationList += ">" + row.classification_name + "</option>"
    })
    classificationList += "</select>"
    return classificationList
  }

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
 if (req.cookies.jwt) {
  jwt.verify(
   req.cookies.jwt,
   process.env.ACCESS_TOKEN_SECRET,
   function (err, accountData) {
    if (err) {
     req.flash("Please log in")
     res.clearCookie("jwt")
     return res.redirect("/account/login")
    }
    res.locals.accountData = accountData
    res.locals.loggedin = 1
    next()
   })
 } else {
  next()
 }
}

/* ****************************************
 *  Check Login
 * ************************************ */
 Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
 }

/****************************************
 *  Change header link if logged in
 * ************************************ */
Util.changeLink = (req, res) => {
  let link
  if(res.locals.loggedin) {
    link = '<a href="/inv/">Welcome ' + res.locals.accountData.account_firstname + ' </a><a href="/account/logout" title="Click to log out">Logout</a>'
  } else {
    link = '<a href="/account/login" title="Click to log in">My Account</a>'
  }
  return link
}

Util.changeGreeting = (req, res) => {
  let greeting
  if(res.locals.accountData.account_type == 'Admin' || res.locals.accountData.account_type == 'Employee') {
    greeting = '<h2>Welcome ' + res.locals.accountData.account_firstname + ' </h2>'
    greeting += '<br>'
    greeting += '<p>You\'re logged in</p>'
    greeting += '<br>'
    greeting += '<a href="/account/update/' + res.locals.accountData.account_id + '" title="Click to update your account information">Update Account Information</a>'
    greeting += '<br>'
    greeting += '<h3>Inventory Management</h3>'
    greeting += '<br>'
    greeting += '<p>To manage inventory classifications and vehicles, <a href="/inv/">Click here</a></p>'
  }
  else {
    greeting = '<h2>Welcome ' + res.locals.accountData.account_firstname + ' </h2>'
    greeting += '<br>'
    greeting += '<p>You\'re logged in</p>'
    greeting += '<br>'
    greeting += '<a href="/account/update/' + res.locals.accountData.account_id + '" title="Click to update your account information">Update Account Information</a>'
    greeting += '<br>'
  }
  return greeting
}

Util.checkPrivileges = (req, res, next) => {
  if (res.locals.accountData.account_type == 'Admin' || res.locals.accountData.account_type == 'Employee') {
    next()
  } else {
    req.flash("notice", "You do not have permission to access this page.")
    return res.redirect("/account/login")
  }
}

module.exports = Util
