const express = require("express");
const router = express.Router();

const category_controller = require("../controllers/categoryController");
//ROUTES

///* CATEGORY ROUTES ///

//get categories page
router.get("/", category_controller.index);

//get request for one category
router.get("/:id", category_controller.category_detail);

// //get request for create category
// router.get("/:id", category_controller.category_create_get);

// //get request for create category
// router.get("/:id", category_controller.category_create_post);

module.exports = router;
