"use strict";

const logger = require("../utils/logger");
const assessmentStore = require("../models/assessment-store");
const accounts = require("./accounts.js");
const uuid = require("uuid");
const analytics = require("../utils/analytics");
const users = require("../models/user-store");

const trainerdashboard = {
  index(request, response) {
    logger.info("trainerdashboard rendering");
    const viewData = {
      title: "Trainer Dashboard",
      users: users.getAllUsers()
    };
    response.render("trainerdashboard", viewData);
  },

  deleteUser(request, response) {
    const userId = request.params.id;
    logger.info(`Deleting user ${userId}`);
    users.deleteUser(userId);
    response.redirect("/trainerdashboard");
  }
};

module.exports = trainerdashboard;
