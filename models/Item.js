const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['lost', 'found'],
    required: true
  },
  contactInfo: {
    name: String,
    email: String,
    phone: String
  },
  image: {
    type: String,
    required: false
  }
});

module.exports = mongoose.model('Item', itemSchema);