const mongoose = require("mongoose");
const slugify = require("slugify");

const vehicleSchema = new mongoose.Schema({
  stockNumber: {
    type: String,
    required: [true, "Plese provide the stock number"],
  },
  slug: String,
  author_id: {
    type: String,
    required: [true, "Plese provide the author_id"],
  },
  uid: {
    type: String,
    required: [true, "Please provide a uid"],
  },
  make: {
    type: String,
    requiedBy: [true, "Please provide a make for the vehicle"],
  },
  model: {
    type: String,
    required: [true, "Please provide a model for the vehicle"],
  },
  year: {
    type: String,
    required: [true, "Please provide a year for the vehicle"],
  },
  notes: {
    type: String,
    trim: true,
  },
  datePosted: {
    type: Date,
    default: Date.now(),
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  photos: [String],
});

vehicleSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name _id",
  });
  next();
});

vehicleSchema.pre("save", function (next) {
  this.slug = slugify(`${this.make}-${this.model}`, { lower: true });
  next();
});

const Vehicle = mongoose.model("Vehicle", vehicleSchema);
module.exports = Vehicle;
