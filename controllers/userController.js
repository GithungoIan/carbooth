const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

// get all users
exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    status: "success",
    results: users.length,
    data: {
      users,
    },
  });
});

// get a single user
exports.getOne = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new AppError("There is not user with that Id"));
  }
  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

// delete a user
exports.deleteOne = catchAsync(async (req, res, next) => {
  const user = await User.findOneAndDelete(req.params.id);

  if (!user) {
    return next(new AppError("There is not user with that Id"));
  }

  res.status(200).json({
    status: "success",
    data: null,
  });
});
