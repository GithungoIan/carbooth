const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema({
  fistName: {
    type: String,
    requred: [true, "Please provide your first name"],
  },
  surName: {
    type: String,
    required: [true, "Please provide your your surName"],
  },
  email: {
    type: String,
    required: [true, "Please Provide your email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email address"],
  },
  password: {
    type: String,
    rquired: [true, "Please provide your password"],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please confirm your password"],
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

const User = mongoose.model("User", userSchema);
module.exports = User;
