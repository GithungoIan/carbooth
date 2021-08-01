const express = require("express");
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");

const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/logout", authController.logOut);
router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:token", authController.resetPassword);
router.post(
  "/updateMyPassword",
  authController.protect,
  authController.updatePassword
);

router.route("/").get(userController.getAllUsers);
router
  .route("/:id")
  .get(userController.getOne)
  .delete(userController.deleteOne);

module.exports = router;
