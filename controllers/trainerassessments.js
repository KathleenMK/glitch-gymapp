"use strict";

const logger = require("../utils/logger");
const assessmentStore = require("../models/assessment-store");
const accounts = require("./accounts.js");
const uuid = require("uuid");
const analytics = require("../utils/analytics");
const users = require("../models/user-store");

const trainerassessments = {
  index(request, response) {
    logger.info("trainerassessments rendering");
    const userId = request.params.id;
    const user = users.getUserById(userId);
    const viewData = {
      title: "Trainer Dashboard",
      assessments: assessmentStore.getUserAssessments(userId),
      userName: user.name,
      userId: userId,
      BMI: analytics.calculateBMI(user),
      BMICategory: analytics.determineBMICategory(analytics.calculateBMI(user)),
      idealWeight: analytics.getIdealWeight(user),
      idealWeightInd: analytics.getIsIdealBodyWeightInd(user)
    };
    response.render("trainerassessments", viewData);
  },
  
  updateComment(request, response) {
    const userId = request.params.userid;
    logger.info("trainerassessments comment");
    const assessment = assessmentStore.getAssessment(request.params.id);
    const newComment = request.body.comment;
    assessmentStore.updateComment(assessment, newComment);
    response.redirect("/trainerdashboard");
  
  
}
  
};

module.exports = trainerassessments;
