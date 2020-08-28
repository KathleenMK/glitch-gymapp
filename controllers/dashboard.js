"use strict";

const logger = require("../utils/logger");
const assessmentStore = require("../models/assessment-store");
const accounts = require("./accounts.js");
const uuid = require("uuid");
const analytics = require("../utils/analytics");

const dashboard = {
  index(request, response) {
    logger.info("dashboard rendering");
    const loggedInUser = accounts.getCurrentUser(request);
    const viewData = {
      title: "Template 1 Dashboard",
      assessments: assessmentStore.getUserAssessments(loggedInUser.id),
      userName: loggedInUser.name,
      BMI: analytics.calculateBMI(loggedInUser),
      BMICategory: analytics.determineBMICategory(analytics.calculateBMI(loggedInUser)),
      idealWeight: analytics.getIdealWeight(loggedInUser),
      idealWeightInd: analytics.getIsIdealBodyWeightInd(loggedInUser)
           
      //currentWeight: loggedInUser.startingWeight
    };
    response.render("dashboard", viewData);
  },

  addAssessment(request, response) {
    logger.info("adding assessment");
    const loggedInUser = accounts.getCurrentUser(request);
    const newAssessment = {
      id: uuid.v1(),
      userid: loggedInUser.id,
      weight: request.body.weight,
      chest: request.body.chest,
      thigh: request.body.thigh,
      upperArm: request.body.upperArm,
      waist: request.body.waist,
      hips: request.body.hips,
      comment:""
    };
    assessmentStore.addAssessment(newAssessment);
    response.redirect("/dashboard");
  },

  deleteAssessment(request, response) {
    const assessmentId = request.params.id;
    logger.info(`Deleting assessment ${assessmentId}`);
    assessmentStore.removeAssessment(assessmentId);
    response.redirect("/dashboard");
  }
};

module.exports = dashboard;
