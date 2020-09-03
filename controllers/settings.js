"use strict";

const logger = require("../utils/logger");
const accounts = require("./accounts.js");
const userstore = require("../models/user-store");

const settings = {
  index(request, response) {
    logger.info("settings rendering");
    const loggedInUser = accounts.getCurrentUser(request);
    const viewData = {
      title: "Settings",
      user: loggedInUser
    };
    response.render("settings", viewData);
  },

  update(request, response) {
    const userId = request.params.userid;
    const loggedInUser = accounts.getCurrentUser(request);
    const updatedUser = {
      name: request.body.name,
      gender: request.body.gender,
      email: request.body.email,
      password: request.body.password,
      address: request.body.address,
      height: request.body.height,
      startingWeight: request.body.startingWeight
    };
    logger.debug(`Updating User ${userId}`);
    userstore.updateUser(loggedInUser, updatedUser);

    response.redirect("/dashboard");
  }
};

module.exports = settings;
