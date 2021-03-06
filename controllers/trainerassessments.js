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
    analytics.recalcGoalStats(user); //goal stats impact on display, therefore calculated prior to viewData being created
    const viewData = {
      title: "Trainer Dashboard",
      assessments: assessmentStore.getUserAssessments(userId).reverse(),
      userName: user.name,
      userId: userId,
      userAnalytics: analytics.getAnalytics(user), //object of all stats returned, replacing a call for each
      //goals: goalStore.getUserGoals(userId), //same as dashboard index
      openGoals: goalStore.getUserOpenGoals(userId).reverse(),
      //splitting out the open goals to display differently
      closedGoals: goalStore.getUserClosedGoals(userId).reverse(), //same as dashboard index
      todaysDate: date
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
  },

  addGoal(request, response) {
    logger.info("trainer adding goal");
    const userId = request.params.userid;
    const lastAssessment = assessmentStore.getUserLatestAssessment(userId);
    const date = new Date();
    const newGoal = {
      id: uuid.v1(),
      userid: userId,
      date: date.toDateString(),
      measurement: request.body.measurement,
      target: request.body.target,
      targetDate: request.body.targetDate,
      startingMeasurement: analytics.startingMeasurement(
        userId,
        request.body.measurement
      ),
      daysRemaining: "",
      percentTargetAchieved: "",
      status: "open",
      addedBy: "trainer",
      achieved: false
    };
    goalStore.addGoal(newGoal);

    response.redirect("/trainerassessments/" + userId);
  }
};

module.exports = trainerassessments;
