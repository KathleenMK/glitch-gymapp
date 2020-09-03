"use strict";

const logger = require("../utils/logger");
const assessmentStore = require("../models/assessment-store");
const goalStore = require("../models/goal-store");
const accounts = require("./accounts.js");
const uuid = require("uuid");
const analytics = require("../utils/analytics");
const users = require("../models/user-store");

const trainerassessments = {
  index(request, response) {
    logger.info("trainerassessments rendering");
    const userId = request.params.id;
    const user = users.getUserById(userId);
    const date = new Date();
    const viewData = {
      title: "Trainer Dashboard",
      assessments: assessmentStore.getUserAssessments(userId).reverse(),
      userName: user.name,
      userId: userId,
      BMI: analytics.calculateBMI(user),
      BMICategory: analytics.determineBMICategory(analytics.calculateBMI(user)),
      idealWeight: analytics.getIdealWeight(user),
      idealWeightInd: analytics.getIsIdealBodyWeightInd(user),
      goals: goalStore.getUserGoals(userId), //same as dashboard index
      openGoals: goalStore.getUserOpenGoals(userId), //same as dashboard index
      closedGoals: goalStore.getUserClosedGoals(userId), //same as dashboard index
      todaysDate: date
    };
    //goal method same as dashboard
    goalStore.daysRemaining(userId);
    if (assessmentStore.getUserCountAssessments(userId) > 0) {
      goalStore.calcPercentTargetAchieved(
        userId,
        assessmentStore.getUserLatestAssessment(userId)
      );
      goalStore.calcStatus(
        userId,
        assessmentStore.getUserLatestAssessment(userId)
      );
    }
    response.render("trainerassessments", viewData);
  },

  updateComment(request, response) {
    const userId = request.params.userid;
    logger.info("trainerassessments comment");
    const assessment = assessmentStore.getAssessment(request.params.id);
    const newComment = request.body.comment;
    assessmentStore.updateComment(assessment, newComment);
    response.redirect("/trainerdashboard");
  },

  //same as dashboard
  addGoal(request, response) {
    logger.info("adding goal");
    const userId = request.params.userid;
    const lastAssessment = assessmentStore.getUserLatestAssessment(userId);
    //const measurement = request.body.measurement;
    //assessmentStore.calculateUserTrend(loggedInUser.id);
    const date = new Date();
    const newGoal = {
      id: uuid.v1(),
      userid: userId,
      date: date.toDateString(),
      measurement: request.body.measurement,
      target: request.body.target,
      targetDate: request.body.targetDate,
      //lastAssessment : assessmentStore.getUserLatestAssessment(loggedInUser.id),
      startingMeasurement: trainerassessments.startingMeasurement(
        userId,
        request.body.measurement
      ),
      daysRemaining: "",
      percentTargetAchieved: "",
      status: "open",
      comment: ""
    };
    goalStore.addGoal(newGoal);

    response.redirect("/trainerassessments/" + userId);
  },

  startingMeasurement(userid, measurement) {
    if (assessmentStore.getUserCountAssessments(userid) > 0) {
      return assessmentStore.getUserLatestMeasurement(userid, measurement);
    } else if (measurement === "weight") {
      return users.getUserById(userid).startingWeight;
    } else {
      return 0;
    }
  }
};

module.exports = trainerassessments;
