const mongoose = require('mongoose')

const authenticationsSchema = new mongoose.Schema({
  token: {
    type: String,
    require: true
  },
  userId: {
    type: String
  }
})

const Authentications = mongoose.model('authentications', authenticationsSchema)

module.exports = Authentications
