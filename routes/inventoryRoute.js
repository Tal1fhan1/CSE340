// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities/")
const invValidate = require('../utilities/inventory-validation')

router.get("/", invController.buildManagement);

router.get("/add-classification", invController.buildAddClassification);

router.post(
  "/add-classification",
  invValidate.classificationRules(),
  invValidate.checkClassData,
  utilities.handleErrors(invController.AddClassification)
)

router.get("/add-vehicle", invController.buildAddVehicle);

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

router.get("/error", invController.buildError);

module.exports = router;
