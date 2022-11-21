#! /usr/bin/env node
//!Before use add MONGODB_URI to your .env file
//* Use this file directly to populate database.
//* Use as "node populatedb"

console.log(
  "This script populates some test items, categories to your database. Specified database as argument"
);

// Get arguments passed on command line
// var userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
require("dotenv").config();
var async = require("async");
const Item = require("./models/item");
const Category = require("./models/category");

var mongoose = require("mongoose");
var mongoDB = process.env.MONGODB_URI;
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

let items = [];
let categories = [];

function itemCreate(name, desc, img, category, price, stock, cb) {
  const itemdetail = { name, desc, img, category, price, stock };

  const item = new Item(itemdetail);
  item.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log("New Item: " + item);
    items.push(item);
    cb(null, item);
  });
}

function categoryCreate(name, desc, cb) {
  const categorydetail = { name, desc };

  const category = new Category(categorydetail);
  category.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }

    console.log("New Item: " + category);
    categories.push(category);
    cb(null, category);
  });
}

//create categories: consoles, games, accessories
function createCategories(cb) {
  async.series(
    [
      function (callback) {
        categoryCreate("Console", "Gaming consoles", callback);
      },
      function (callback) {
        categoryCreate("PC", "Gaming PCs", callback);
      },
      function (callback) {
        categoryCreate("Games", "Games you can play in your console and pc", callback);
      },
      function (callback) {
        categoryCreate("Accessories", "Accessories for pc and console", callback);
      },
    ],
    //optional callback
    cb
  );
}

function createItems(cb) {
  const path = "/images/";
  async.parallel(
    [
      function (callback) {
        itemCreate(
          "Playstation 5",
          "The PlayStation 5 (PS5) is a home video game console developed by Sony.",
          path + "ps5.webp",
          categories[0],
          500,
          40,
          callback
        );
      },
      function (callback) {
        itemCreate(
          "Xbox Series X",
          "The Xbox Series X (XSX) is a home video game console developed by Microsoft.",
          path + "seriesx.jpg",
          categories[0],
          500,
          50,
          callback
        );
      },
      function (callback) {
        itemCreate(
          "Dualsense Controller",
          "The DualSense wireless controller is a controller for ps5 ",
          path + "dualsense.webp",
          categories[3],
          70,
          150,
          callback
        );
      },
      function (callback) {
        itemCreate(
          "Razer BlackShark v2 PRO",
          "A wireless headset powered by Razer™ HyperSpeed Wireless technology featuring ultimate mic clarity, and advanced passive noise cancellation headset",
          path + "blacksharkv2pro.webp",
          categories[3],
          129,
          90,
          callback
        );
      },
      function (callback) {
        itemCreate(
          "The Last Of Us Part 1",
          "The Last of Us Part I is a 2022 action-adventure game developed by Naughty Dog and published by Sony Interactive Entertainment",
          path + "thelastofus.png",
          categories[2],
          70,
          400,
          callback
        );
      },
      function (callback) {
        itemCreate(
          "The Witcher 3: Wild Hunt",
          "The Witcher 3: Wild Hunt is an action role-playing game developed by CD Projekt RED",
          path + "witcher3.jpg",
          categories[2],
          35,
          200,
          callback
        );
      },
    ],
    //optional callback
    cb
  );
}

async.series(
  [createCategories, createItems],
  // Optional callback
  function (err, results) {
    if (err) {
      console.log("FINAL ERR: " + err);
    } else {
      console.log("All Done created successfully");
    }
    // All done, disconnect from database
    mongoose.connection.close();
  }
);
