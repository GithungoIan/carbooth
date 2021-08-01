const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const User = require("../models/userModel");

//  TODO:  signup  || register
exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    firstName: req.body.firstName,
    surName: req.body.surName,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  // send response
  res.status(201).json({
    status: "success",
    data: {
      newUser,
    },
  });
});
//  TODO: login
//  TODO: logout
//  TODO: forgot password
//  TODO: reset password
//  TODO: update password
//  TODO: protect routes
//  TODO: check if user is logged in for rendered pages only
//  TODO: restrict to admin ||  users
