const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  title: {type: String, required: true},
  review: {type: String, required: true},
  date: {type: Date, required: true},
  reviewer: {type: String},
  rating: {type: Number, min:0, max:5},
  source: {type: String}
}, {timestamps:true});

module.exports = mongoose.model('Review', ReviewSchema);
