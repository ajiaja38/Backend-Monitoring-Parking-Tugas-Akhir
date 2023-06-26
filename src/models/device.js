const mongoose = require('mongoose')

const deviceSchema = new mongoose.Schema({
  guid: {
    type: String,
    unique: true,
    required: true
  },
  name: {
    type: String,
    required: true,
    unique: true
  },
  latitude: {
    type: Number,
    required: true
  },
  longtitude: {
    type: Number,
    required: true
  },
  mac: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['aktuator', 'sensor']
  },
  partner: [
    {
      guid: {
        type: String,
        default: null
      }
    }
  ],
  isActive: {
    type: Boolean,
    default: true
  },
  owner: {
    id: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

const Device = mongoose.model('Device', deviceSchema)

module.exports = Device
