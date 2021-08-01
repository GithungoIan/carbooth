const express = require("express");
const vehicleController = require("../controllers/vehicleController");

const router = express.Router();

router
  .route("/")
  .get(vehicleController.getAllVehicles)
  .post(vehicleController.setUserIds, vehicleController.addVehicle);

router
  .route("/:id")
  .get(vehicleController.getVehicle)
  .delete(vehicleController.deleteVehicle)
  .patch(vehicleController.updateVehicle);

module.exports = router;
