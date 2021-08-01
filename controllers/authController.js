const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const crypo = require("crypo");

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

// sign the token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// create token for user
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") {
    cookieOptions.secure = true;
  }

  // for browsers
  res.cookie("jwt", token, cookieOptions);

  // remove password from the Output
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};
//  TODO: login
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  // check if email and password exist
  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }

  // check if user exist and password is correct
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  // if okay send token to the user
  createSendToken(user, 200, res);
});

//  TODO: logout
exports.logOut = (req, res) => {
  res.cookie("jwt", "Logged out", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({
    status: "success",
  });
};

//  TODO: forgot password
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // get the user based on the email address
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError("There is no user with that email address", 404));
  }

  // genereate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // send it to the users email address
  const resetURL = `${req.protocal}://${req.get(
    "host"
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? submit a patch request with your new password and passwordConfirm to : ${resetURL}.\n If you didn't forget your password, please ignore this email`;

  try {
    // await sendEmail({
    //   email: user.email,
    //   subject: "your password reset token valid for (10 min)",
    //   messae,
    // });
    res.status(200).json({
      status: "success",
      message: "Token sent to email",
      token: resetToken,
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.PasswordResetExpires = undefined;

    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        "There was an error sending your email, please try again",
        500
      )
    );
  }
});

//  TODO: reset password
exports.resetPassword = catchAsync(async (req, res, next) => {
  // get user based on the token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // if token has not expired and there is a user, set password
  if (!user) {
    return next(new AppError("Token is invalid or has expired", 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // login the user and set JWT
  createSendToken(user, 200, res);
});

//  TODO: update password
//  TODO: protect routes
//  TODO: check if user is logged in for rendered pages only
//  TODO: restrict to admin ||  users
