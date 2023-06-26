require('dotenv').config()
const fs = require('fs')
const mongoose = require('mongoose')

mongoose.set('strictQuery', true)

const credentials = {
  pfx: fs.readFileSync(process.env.PFX_FILE),
  passphrase: process.env.PFX_PASSPHRASE,
  ca: fs.readFileSync(process.env.INTERCERT_FILE)
}

const databases = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL)
    console.log('berhasil connect ke database')
  } catch (error) {
    console.log(error.message)
  }
}

const jwt = {
  accessTokenKey: process.env.ACCESS_TOKEN_KEY,
  refreshTokenKey: process.env.REFRESH_TOKEN_KEY,
  accessTokenAge: process.env.ACCESS_TOKEN_AGE
}

const notification = {
  email: {
    username: process.env.EMAIL,
    password: process.env.PASSWORD_EMAIL
  },
  whatsApp: {
    host: process.env.WA_HOST,
    token: process.env.WA_TOKEN
  }
}

module.exports = {
  credentials,
  databases,
  jwt,
  notification
}
