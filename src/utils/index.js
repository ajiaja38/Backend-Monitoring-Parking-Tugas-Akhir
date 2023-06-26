const mapDBDeviceToModel = ({
  guid,
  name,
  latitude,
  longtitude,
  mac,
  type,
  partner,
  isActive,
  owner,
  createdAt,
  updatedAt
}) => ({
  guid,
  name,
  latitude,
  longtitude,
  mac,
  type,
  partner,
  isActive,
  owner,
  createdAt,
  updatedAt
})

const mapDBUsersToModel = ({
  id,
  fullname,
  username,
  password,
  email,
  phoneNumber,
  address,
  avatar,
  avatarUrl,
  role,
  isActive,
  otp
}) => ({
  id,
  fullname,
  username,
  password,
  email,
  phoneNumber,
  address,
  avatar,
  avatarUrl,
  role,
  isActive,
  otp
})

module.exports = { mapDBDeviceToModel, mapDBUsersToModel }
