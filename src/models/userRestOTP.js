const mongoose = require('mongoose')

const userRestOTP = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
    required: true
  },
  fullname: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phoneNumber: {
    type: String,
    required: true,
    unique: true
  },
  address: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  },
  otp: {
    type: String,
    required: true
  }
})

const UsersRestOTP = mongoose.model('UsersRestOTP', userRestOTP)

module.exports = UsersRestOTP
