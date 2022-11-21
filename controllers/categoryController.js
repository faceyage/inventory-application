//models
const Category = require("../models/category");
const Item = require("../models/item");
//needed modules
const async = require("async");
const { body, validationResult } = require("express-validator");

exports.index = (req, res, next) => {
  Category.find({}).exec(function (err, category_list) {
    if (err) return next(err);

    res.render("categories", {
      title: "Categories",
      category_list,
    });
  });
};

exports.category_detail = (req, res, next) => {
  async.parallel(
    {
      category(cb) {
        Category.findById(req.params.id).exec(cb);
      },
      item_list(cb) {
        Item.find({ category: req.params.id }).exec(cb);
      },
    },
    (err, results) => {
      if (err) return next(err);

      res.render("category_detail", {
        title: "Category",
        category: results.category,
        item_list: results.item_list,
      });
    }
  );
};

// exports.category_create_get = (req, res, next) => {
//   res.send("IMPLEMENT CATEGORY CREATE GET");
// };

// exports.category_create_post = (req, res, next) => {
//   res.send("IMPLEMENT CATEGORY CREATE POST");
// };
