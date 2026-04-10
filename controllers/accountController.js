const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { parse } = require("dotenv")
require("dotenv").config()

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  let link = utilities.changeLink(req, res)
  res.render("account/login", {
    title: "Login",
    nav,
    link,
    errors: null,
  })
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  let link = utilities.changeLink(req, res)
  res.render("account/register", {
    title: "Register",
    nav,
    link,
    errors: null,
  })
}

async function accountManagement(req, res, next) {
  let nav = await utilities.getNav()
  let link = utilities.changeLink(req, res)
  let greeting = utilities.changeGreeting(req, res)
  res.render("./account/account-management", { 
    title: "Account Management",
    nav,
    link,
    greeting,
    errors: null,
  })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  let link = utilities.changeLink(req, res)
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      link,
      errors: null,
    })
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      link,
      errors: null,
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
      link,
    })
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  let link = utilities.changeLink(req, res)
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      link,
      errors: null,
      account_email,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account/")
    }
    else {
      req.flash("message notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        link,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    throw new Error('Access Forbidden')
  }
}

async function updateAccountView(req, res, next) {
  const account_email = req.params.accountId
  let nav = await utilities.getNav()
  let link = utilities.changeLink(req, res)
  const accountData = await accountModel.getAccountByEmail(account_email)
  res.render("./account/update-account", {
    title: "Update " + accountData.account_firstname + " " + accountData.account_lastname,
    nav,
    link,
    errors: null,
    account_id: accountData.account_id,
    account_firstname: accountData.account_firstname,
    account_lastname: accountData.account_lastname,
    account_email: accountData.account_email,
  })
}

async function updateAccount (req, res, next) {
  let nav = await utilities.getNav()
  let link = utilities.changeLink(req, res)
  const { account_id, account_firstname, account_lastname, account_email } = req.body

  const updateResult = await accountModel.updateAccount(account_id, account_firstname, account_lastname, account_email)

  if (updateResult) {
    let newNav = await utilities.getNav()
    req.flash(
      "notice",
      `Account updated successfully.`
    )
    res.status(201).render("account/account-management", {
      title: "Account Management",
      nav: newNav,
      link,
      errors: null,
    })
  } else {
    req.flash("notice", "Sorry, the account update failed.")
    res.status(501).render("account/update-account", {
      title: "Update Account",
      nav,
      link,
      errors: null,
    })
  }
}

async function updatePassword(req, res) {
  let nav = await utilities.getNav()
  let link = utilities.changeLink(req, res)
  const { account_id, account_password } = req.body

  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      link,
      errors: null,
    })
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_id,
    hashedPassword
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, your password has been updated.`
    )
    res.status(201).render("account/account-management", {
      title: "Account Management",
      nav,
      link,
      errors: null,
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/update-account", {
      title: "Update Account",
      nav,
      link,
    })
  }
}
module.exports = { buildLogin, buildRegister, registerAccount, accountLogin, accountManagement, updateAccountView, updateAccount, updatePassword }