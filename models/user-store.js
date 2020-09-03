"use strict";

const _ = require("lodash");
const JsonStore = require("./json-store");
const logger = require("../utils/logger");

const userStore = {
  store: new JsonStore("./models/user-store.json", { users: [] }),
  collection: "users",

  getAllUsers() {
    return this.store.findAll(this.collection);
  },

  addUser(user) {
    this.store.add(this.collection, user);
    this.store.save();
  },

  updateUser(user, updatedUser) {
    user.name = updatedUser.name;
    user.gender = updatedUser.gender;
    user.email = updatedUser.email;
    user.password = updatedUser.password;
    user.address = updatedUser.address;
    user.height = updatedUser.height;
    user.startingWeight = updatedUser.startingWeight;
    this.store.save();
  },

  getUserById(id) {
    return this.store.findOneBy(this.collection, { id: id });
  },

  getUserByEmail(email) {
    return this.store.findOneBy(this.collection, { email: email });
  },

  deleteUser(id) {
    const user = this.getUserById(id);
    this.store.remove(this.collection, user);
    this.store.save();
  },

  updateCountAssessments(user, newCountAssessments) {
    logger.info("updating the count of assessments for this user from store");
    user.countAssessments = newCountAssessments;
    this.store.save();
  }
};

module.exports = userStore;
