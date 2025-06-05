// src/models/Album.js
const mongoose = require("mongoose");

const AlbumSchema = new mongoose.Schema({
  year: {
    type: String,
    required: true,
  },
  album: {
    type: String,
    required: true,
  },
  artist: {
    type: String,
    required: true,
  },
  selected: {
    type: Boolean,
    default: false,
  },
  selectedAt: {
    type: Date,
    default: null,
  }
});

module.exports = mongoose.model("Album", AlbumSchema);