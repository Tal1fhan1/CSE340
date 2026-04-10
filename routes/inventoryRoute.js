// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities/")
const invValidate = require('../utilities/inventory-validation')

router.get("/", utilities.checkPrivileges, utilities.handleErrors(invController.buildManagement));

router.get("/add-classification", utilities.checkPrivileges, utilities.handleErrors(invController.buildAddClassification));

router.post(
  "/add-classification",
  invValidate.classificationRules(),
  invValidate.checkClassData,
  utilities.handleErrors(invController.AddClassification)
)

router.get("/add-vehicle", utilities.checkPrivileges, utilities.handleErrors(invController.buildAddVehicle));

router.post(
  "/add-vehicle",
  invValidate.vehicleRules(),
  invValidate.checkVehicleData,
  utilities.handleErrors(invController.AddVehicle)
)

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// Route to build inventory by vehicle details view
router.get("/detail/:invId", invController.buildByVehicleDetails);

router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON))

// Route to edit a vehicle, build the edit view
router.get("/edit/:invId", utilities.checkPrivileges, utilities.handleErrors(invController.editInventoryView));

// Route to delete a vehicle, build the delete view
router.get("/delete/:invId", utilities.checkPrivileges, utilities.handleErrors(invController.deleteInventoryView));

router.post("/delete/",
  utilities.handleErrors(invController.deleteInventory))

router.post("/update/", 
  invValidate.vehicleRules(),
  invValidate.checkUpdateData,
  utilities.handleErrors(invController.updateInventory))

router.get("/error", invController.buildError);

module.exports = router;
