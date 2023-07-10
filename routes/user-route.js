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
  EditFullName,
  AvatarPatch,
  EditPhone,
  GetProfile,
} = require("../controllers/user/user-controller");

const fileUpload = require("express-fileupload");

const userMiddleware = require("../middlewares/user-middleware");

router.post("/check-phone", CheckPhone);
router.post("/signup", SignUp);
router.post("/login", Login);
router.post("/send-code", sendCode);
router.post("/validate-code", ValidateCode);

router.use(userMiddleware);

router.patch("/edit-full-name", EditFullName);
router.patch("/avatar", fileUpload(), AvatarPatch);
router.patch("/edit-phone", EditPhone);
router.get("/profile", GetProfile);
router.get("/logout", LogoutProfile);

module.exports = {
  path: "/api/users",
  router,
};
