const express = require("express");
const vehicleController = require("../controllers/vehicleController");
const authController = require("../controllers/authController");

const router = express.Router();

router
  .route("/")
  .get(vehicleController.getAllVehicles)
  .post(authController.protect, vehicleController.addVehicle);

router
  .route("/:id")
  .get(vehicleController.getVehicle)
  .delete(vehicleController.deleteVehicle)
  .patch(vehicleController.updateVehicle);

router
  .route("/upload")
  .post(
    authController.protect,
    vehicleController.uloadVehicleImages,
    vehicleController.addImages
  );

module.exports = router;
