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
    //const loggedInUser = accounts.getCurrentUser(request);
    const viewData = {
      title: "Trainer Dashboard",
      users: users.getAllUsers()
      //assessments: assessmentStore.getUserAssessments(loggedInUser.id),
      //userName: loggedInUser.name,
      //BMI: analytics.calculateBMI(loggedInUser),
      //BMICategory: analytics.determineBMICategory(analytics.calculateBMI(loggedInUser)),
      //idealWeight: analytics.getIdealWeight(loggedInUser),
      //idealWeightInd: analytics.getIsIdealBodyWeightInd(loggedInUser)

      //currentWeight: loggedInUser.startingWeight
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
