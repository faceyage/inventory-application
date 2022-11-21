//models
const Item = require("../models/item");
const Category = require("../models/category");
//needed modules
const async = require("async");
const path = require("path");
const { body, validationResult } = require("express-validator");
const fs = require("fs");
require("dotenv").config();

//for uploading file
const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); //Appending extension
  },
});
const upload = multer({ storage: storage });

//display index
exports.index = (req, res, next) => {
  Item.find({}).exec(function (err, item_list) {
    if (err) return next(err);
    res.render("index", {
      title: "Item List",
      item_list,
    });
  });
};

//display item detail page
exports.item_detail = (req, res, next) => {
  Item.findById(req.params.id)
    .populate("category")
    .exec((err, item) => {
      if (err) return next(err);

      if (item === null) {
        const err = new Error("Item not found");
        err.status = 404;
        return next(err);
      }

      //success
      res.render("item_detail", {
        title: item.name,
        item,
      });
    });
};

exports.item_create_get = (req, res, next) => {
  Category.find({}).exec(function (err, category_list) {
    if (err) return next(err);
    res.render("item_form", {
      title: "Create Item",
      category_list,
    });
  });
};

exports.item_create_post = [
  //validate and sanitize fields
  upload.single("img"),
  body("name", "name must be specified").trim().isLength({ min: 1 }).escape(),
  body("desc", "description must be specified").trim().isLength({ min: 1 }).escape(),
  body("price", "price must be specified")
    .trim()
    .isFloat({ gt: 0 })
    .withMessage("Price must be greater than 0$")
    .escape(),
  body("stock", "stock must be specified")
    .trim()
    .isFloat({ min: 0 })
    .withMessage("Stock can't be negative")
    .escape(),
  body("category", "category must be specified").escape(),
  //! commented because you first have to remove image when upload not successful
  // body("password", "password must be specified")
  //   .trim()
  //   .isLength({ min: 1 })
  //   .equals(process.env.ADMIN_PASSWORD)
  //   .withMessage("Passwords not match")
  //   .escape(),
  (req, res, next) => {
    console.log("Uploaded Image: ", req.file);
    const errors = validationResult(req);
    const imgPath = "/images/" + req.file.filename;

    const item = new Item({
      name: req.body.name,
      desc: req.body.desc,
      img: imgPath,
      price: req.body.price,
      stock: req.body.stock,
      category: req.body.category,
    });

    if (!errors.isEmpty()) {
      //re-render item_create_get with error messages, sanitized values

      Category.find({}).exec(function (err, category_list) {
        if (err) return next(err);

        let categoryExist = false;
        for (const category of category_list) {
          if (category._id.toString() === item.category.toString()) {
            // console.log(`Yes found it! Category: ${category}`);
            categoryExist = true;
          }
        }
        if (!categoryExist) {
          const err = new Error("Category not exist try again!");
          err.status = 404;
          return next(err);
        }

        res.render("item_form", {
          title: "Create Item",
          item,
          category_list,
          errors: errors.array(),
        });
      });

      return;
    }

    //No error, save new item
    item.save((err) => {
      if (err) return next(err);

      res.redirect(item.url);
    });
  },
];

exports.item_update_get = (req, res, next) => {
  async.parallel(
    {
      category_list(cb) {
        Category.find({}).exec(cb);
      },
      item(cb) {
        Item.findById(req.params.id).exec(cb);
      },
    },
    (err, results) => {
      if (err) return next(err);

      if (results.item === null) {
        const err = new Error("Item not found");
        err.status = 404;
        return next(err);
      }

      //success
      res.render("item_form", {
        title: "Update Item",
        item: results.item,
        category_list: results.category_list,
      });
    }
  );
};

exports.item_update_post = [
  upload.single("img"),
  //validate and sanitize fields
  body("name", "name must be specified").trim().isLength({ min: 1 }).escape(),
  body("desc", "description must be specified").trim().isLength({ min: 1 }).escape(),
  body("price", "price must be specified")
    .trim()
    .isFloat({ gt: 0 })
    .withMessage("Price must be greater than 0$")
    .escape(),
  body("stock", "stock must be specified")
    .trim()
    .isFloat({ min: 0 })
    .withMessage("Stock can't be negative")
    .escape(),
  body("category", "category must be specified").escape(),
  body("name", "name must be specified").trim().isLength({ min: 1 }).escape(),
  body("password", "password must be specified")
    .trim()
    .isLength({ min: 1 })
    .equals(process.env.ADMIN_PASSWORD)
    .withMessage("Passwords not match")
    .escape(),
  (req, res, next) => {
    const errors = validationResult(req);

    let imgPath = req.body.img;
    if (req.file) {
      console.log("Old Path: ", imgPath);
      imgPath = "/images/" + req.file.filename;
      console.log("New Path: ", imgPath);
    }

    const item = new Item({
      name: req.body.name,
      desc: req.body.desc,
      img: imgPath,
      price: req.body.price,
      stock: req.body.stock,
      category: req.body.category,
      _id: req.params.id, //This is required, or a new ID will be assigned!
    });

    if (!errors.isEmpty()) {
      //re-render with error messages, sanitized values

      //error occured remove uploaded image if any
      if (req.file) {
        const path = __dirname + "/../public" + item.img;
        try {
          fs.unlinkSync(path);
          //file removed
        } catch (err) {
          console.error("Error: Can't delete uploaded file.\n", err);
        }
      }

      Category.find({}).exec(function (err, category_list) {
        if (err) return next(err);

        let categoryExist = false;
        for (const category of category_list) {
          if (category._id.toString() === item.category.toString()) {
            // console.log(`Yes found it! Category: ${category}`);
            categoryExist = true;
          }
        }
        if (!categoryExist) {
          const err = new Error("Category not exist try again!");
          err.status = 404;
          return next(err);
        }

        res.render("item_form", {
          title: "Update Item",
          item,
          category_list,
          errors: errors.array(),
        });
      });

      return;
    }

    if (req.file) {
      //Remove old image before updating to new image
      removeItemImage(req.params.id);
    }

    //No error, update new item
    Item.findByIdAndUpdate(req.params.id, item, {}, (err, theitem) => {
      if (err) return next(err);

      //successful redirect item detail page.
      res.redirect(theitem.url);
    });
  },
];

exports.item_delete_get = (req, res, next) => {
  Item.findById(req.params.id).exec((err, item) => {
    if (err) return next(err);

    res.render("item_delete", {
      title: "Delete Item",
      item,
    });
  });
};

exports.item_delete_post = [
  body("password", "password must be specified")
    .trim()
    .isLength({ min: 1 })
    .equals(process.env.ADMIN_PASSWORD)
    .withMessage("Passwords not match")
    .escape(),
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      //password not match re-render with error message
      Item.findById(req.params.id, (err, item) => {
        if (err) return next(err);

        res.render("item_delete", {
          title: "Delete Item",
          item,
          errors: errors.array(),
        });
      });
      //stop function
      return;
    }

    //Passwords match app continues

    //Remove old image before updating to a new image
    removeItemImage(req.params.id);
    Item.findByIdAndRemove(req.params.id).exec((err) => {
      if (err) return next(err);

      //item deleted successfully return to homepage
      res.redirect("/");
    });
  },
];

function removeItemImage(itemID) {
  Item.findById(itemID, function (err, theitem) {
    if (err) return next(err);
    console.log("Current directory:", __dirname);

    console.log("Item Path: ", theitem.img);
    const path = __dirname + "/../public" + theitem.img;
    try {
      fs.unlinkSync(path);
    } catch (err) {
      console.error("Error: Can't delete old file.\n", err);
    }
  });
}
