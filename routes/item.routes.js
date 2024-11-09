const express = require("express");
const router = express.Router();
const itemController = require("../controllers/item.controller");
const upload = require("../middleware/upload");

// Item routes
router.get("/", itemController.listItems);
router.post("/", upload.single("image"), itemController.createItem);
router.get("/:id", itemController.getItem);
router.put("/:id", upload.single("image"), itemController.updateItem);
router.delete("/:id", itemController.deleteItem);

module.exports = router;
