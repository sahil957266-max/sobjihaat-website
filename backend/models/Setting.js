const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  deliveryFee: {
    type: Number,
    default: 20,
    min: 0
  },
  freeDeliveryMin: {
    type: Number,
    default: 999,
    min: 0
  },
  servicePincodes: [{
    type: String,
    trim: true
  }],
  pincodeCharges: {
    type: Map,
    of: Number,
    default: {}
  }
});

module.exports = mongoose.model('Setting', settingSchema);
