const express = require("express");
const router = express.Router();

const item_controller = require("../controllers/itemController");

///* ITEM ROUTES ///

//get item home page
router.get("/", item_controller.index);

//get item detail page
router.get("/item/:id", item_controller.item_detail);

//get request for create item
router.get("/createItem", item_controller.item_create_get);

//post request for create item
router.post("/createItem", item_controller.item_create_post);

//get request for delete item
router.get("/item/:id/delete/", item_controller.item_delete_get);

//post request for delete item
router.post("/item/:id/delete/", item_controller.item_delete_post);

//get request for update item
router.get("/item/:id/update", item_controller.item_update_get);

//post request for update item
router.post("/item/:id/update/", item_controller.item_update_post);

module.exports = router;
