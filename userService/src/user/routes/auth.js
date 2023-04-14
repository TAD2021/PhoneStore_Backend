const router = require("express").Router();
const authController = require("../controllers/authControllers");

router.post("/register", authController.registerUser);
router.post("/login", authController.loginUser);
router.post("/logout",  authController.logOut);
router.put("/:id", authController.updateUser);
router.put("/changePassword/:id", authController.changePassword);
router.post("/refresh", authController.requestRefreshToken);

module.exports = router;