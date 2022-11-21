const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const CategorySchema = new Schema({
  name: { type: String, required: true },
  desc: { type: String, required: true },
});

//Virtual item's URL
CategorySchema.virtual("url").get(function () {
  return `/categories/${this._id}`;
});

module.exports = mongoose.model("Category", CategorySchema);
