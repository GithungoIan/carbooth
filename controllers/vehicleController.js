const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Vehicle = require("../models/vehicleModel");
const APIFeatures = require("../utils/apiFeatures");
const request = require("request");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const uid_generator = require("uid-generator");

const uidgen = new uid_generator();

exports.setUserIds = (req, res, next) => {
  // allow nested routes
  if (!req.body.user) req.body.user = req.user.id;
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
  const data = req.body;
  const uid = uidgen.generateSync();

  const vehicleDetails = {
    uid: uid,
    author_id: res.locals.user._id,
    ...data,
  };

  let filepath = path.resolve("./../images/", uid);
  // create directory for vehicle images
  await fs.mkdirSync(filepath, { recursive: true });

  const vehicle = await Vehicle.create(vehicleDetails);

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

const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image please upload only images", 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uloadVehicleImages = upload.fields([
  { name: "background", maxCount: 1 },
  { name: "photos", maxCount: 35 },
]);

// add the images
exports.addImages = catchAsync(async (req, res, next) => {
  const data = req.body;
  let photos = req.files["photos"];
  let background = req.files["background"];

  if (data.uid == null || photos == null || background == null) {
    return next(
      new AppError("Missing one or more of the required parameters", 400)
    );
  }

  if (photos.length < 1) {
    return next(new AppError("At least one image must be provided", 400));
  }

  if (photos.length > 35) {
    return next(new AppError("Exceeded 35 image limit", 400));
  }

  if (background.length < 1) {
    return next(new AppError("At least one background must be provided", 400));
  }

  // set background if it was provided
  background = req.files["background"][0];
  let filePath = path.resolve("./../images", data.uid);

  // check if the Uid exists
  if (!fs.existsSync(filePath)) {
    return next(new AppError("The provided Uid does not exist"));
  }

  // check if there are 35 or more images in the directory
  if (fs.readdirSync(filePath).length >= 35) {
    return next(new AppError("Picture upload limit reached (35 pictures)"));
  }

  // process the images
  let promise = new Promise(function (resolve, reject) {
    var attachments = [];
    photos.forEach((photo, i) => {
      console.log("i : " + i);
      request.post(
        {
          url: "https://api.slazzer.com/v2.0/remove_image_background",
          formData: {
            source_image_file: fs.createReadStream(photo.buffer),
            bg_image_file: fs.createReadStream(background.buffer),
            size: "full",
          },
          headers: {
            "API-KEY": process.env.SLAZZER_API_KEY,
          },
          encoding: null,
        },
        function (error, response, body) {
          if (error) return console.error("Request failed:", error);
          if (response.statusCode != 200)
            return console.error(
              "Error:",
              response.statusCode,
              body.toString("utf8")
            );

          console.log("Photo #" + i + " successfully processed slazzer api");
          fs.writeFileSync(path.resolve(filePath, `${i.toString()}.png`), body);
          attachments[i] = [];
          attachments[i]["filename"] = `${i.toString()}.png`;
          attachments[i]["path"] = path.resolve(
            filePath,
            `${i.toString()}.png`
          );
          console.log(i);
          console.log(photos.length);
          if (i == photos.length - 1) {
            console.log("resolve");
            resolve(attachments);
          }
        }
      );
    });
  });
  promise
    .then((result) => {
      console.log("-----------result");
      console.log(result);
      return res.status(200).json({
        length: photos.length,
        message: "images uploaded successfully",
      });
    })
    .catch((error) => {
      console.log("Error", error);
    });
});
