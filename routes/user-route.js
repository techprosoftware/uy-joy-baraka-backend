const express = require("express");
const router = express.Router();

const {
  SignUp,
  Login,
  sendCode,
  CheckPhone,
  ValidateCode,
  LogoutProfile,
} = require("../controllers/auth/auth-controller");

const {
  editFullName,
  avatarPatch,
  editPhone,
  getProfile,
  editPassword,
} = require("../controllers/user/user-controller");

const fileUpload = require("express-fileupload");

const userMiddleware = require("../middlewares/user-middleware");

router.post("/check-phone", CheckPhone);
router.post("/signup", SignUp);
router.post("/login", Login);
router.post("/send-code", sendCode);
router.post("/validate-code", ValidateCode);

router.use(userMiddleware);

router.patch("/edit-full-name", editFullName);
router.patch("/avatar", fileUpload(), avatarPatch);
router.patch("/edit-phone", editPhone);
router.get("/profile", getProfile);
router.get("/logout", LogoutProfile);
router.patch("/edit-password", editPassword);
module.exports = {
  path: "/api/users",
  router,
};
