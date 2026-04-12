const express = require("express")
const router = new express.Router() 
const accountController = require("../controllers/accountController")
const utilities = require("../utilities/")
const regValidate = require('../utilities/account-validation')

router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.accountManagement));

// Route to build login view
router.get("/login", utilities.handleErrors(accountController.buildLogin));

// Process the login attempt
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)

// Process logout
router.get("/logout", utilities.handleErrors(accountController.accountLogout));

router.get("/register", utilities.handleErrors(accountController.buildRegister));

// Process the registration data
router.post(
  "/register",
  regValidate.registationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

router.get("/update/:accountId", utilities.handleErrors(accountController.updateAccountView));

router.post("/update/", 
  regValidate.updateAccountRules(),
  regValidate.checkAccountUpdateData,
  utilities.handleErrors(accountController.updateAccount));

router.post("/update/password", 
  regValidate.updatePasswordRules(),
  regValidate.checkAccountUpdateData,
  utilities.handleErrors(accountController.updatePassword));

router.get("/admin", utilities.checkPrivileges, utilities.handleErrors(accountController.buildAdmin))

router.get("/admin/delete/:accountId", utilities.checkPrivileges, utilities.handleErrors(accountController.deleteAccountView))

router.post("/admin/delete/", utilities.checkPrivileges, utilities.handleErrors(accountController.deleteAccount))

module.exports = router;
