const ratingController = require("../controllers/ratingControllers");

const router = require("express").Router();

router.post("/", ratingController.createRating);
router.get("/:id", ratingController.getRatingByProduct);

module.exports = router;
