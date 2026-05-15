module.exports = class UserDto {
  id;
  username;
  email;
  firstName;
  lastName;
  image;
  country;
  bio;
  isActivated;
  twoFactorEnabled;
  userSettings;
  roles;

  constructor(model) {
    this.id = model._id;
    this.username = model.username;
    this.email = model.email;
    this.firstName = model.firstName;
    this.lastName = model.lastName;
    this.image = model.image;
    this.country = model.country;
    this.bio = model.bio;
    this.isActivated = model.isActivated;
    this.twoFactorEnabled = model.twoFactorEnabled;
    this.userSettings = model.userSettings;
    this.roles = model.roles;
  }
};
