const mongoose = require('mongoose');

const GolfCourseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true
  },
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  },
  image: {
    type: String,
    required: false
  },
  dateFetched: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('GolfCourse', GolfCourseSchema);
