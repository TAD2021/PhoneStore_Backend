const productController = require("../controlllers/productControllers");

const router = require("express").Router();

router.post("/", productController.createProduct);
router.get("/", productController.getAllProduct);
router.get("/:id", productController.getAProduct);
router.put("/:id", productController.updateProduct);
router.delete("/:id", productController.deleteProduct);
module.exports = router;
