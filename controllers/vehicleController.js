const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Vehicle = require("../models/vehicleModel");
const APIFeatures = require("../utils/apiFeatures");

exports.setUserIds = (req, res, next) => {
  // allow nested routes
  if (!req.body.user) req.body.user = rq.user.id;
  next();
};

//Get ALL VEHICLES
exports.getAllVehicles = catchAsync(async (req, res, next) => {
  // to allow for nested get user on vehicle (hack)
  let filter = {};
  if (req.params.vehicleId) filter = { vehicle: req.params.vehicleId };

  const features = new APIFeatures(Vehicle.find(filter), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const vehicle = await features.query;

  res
    .status(200)
    .json({ status: "success", results: vehicle.length, data: { vehicle } });
});

// GET SINGLE VEHICLE
exports.getVehicle = catchAsync(async (req, res, next) => {
  let query = Vehicle.findById(req.params.id);
  if ({ path: "user" }) query = query.populate({ path: "user" });

  const vehicle = await query;

  if (!vehicle) {
    return next(new AppError("No vehicle found with that id", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      vehicle,
    },
  });
});

// create new vehicle
exports.addVehicle = catchAsync(async (req, res, next) => {
  const vehicle = await Vehicle.create(req.body);

  res.status(201).json({
    status: "success",
    data: {
      vehicle,
    },
  });
});

// delete vehicle
exports.deleteVehicle = catchAsync(async (req, res, next) => {
  const vehicle = await Vehicle.findByIdAndDelete(req.params.id);

  if (!vehicle) {
    return next(new AppError("No vehicle found with that id", 404));
  }

  res.status(204).json({ status: "success", data: null });
});

// update vehicle
exports.updateVehicle = catchAsync(async (req, res, next) => {
  const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!vehicle) {
    return next(new AppError("No vehicle found with that id", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      vehicle,
    },
  });
});
