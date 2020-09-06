"use strict";

const logger = require("../utils/logger");
const assessmentStore = require("../models/assessment-store");
const goalStore = require("../models/goal-store");
const accounts = require("./accounts.js");
const uuid = require("uuid");
const analytics = require("../utils/analytics");
const users = require("../models/user-store");

const dashboard = {
  index(request, response) {
    logger.info("dashboard rendering");
    const loggedInUser = accounts.getCurrentUser(request);
    const date = new Date();
    analytics.recalcGoalStats(loggedInUser); //goal stats impact on display, therefore calculated prior to viewData being created
    analytics.recalcAssessmentsTrend(loggedInUser); //trend impacted by settings, adding or removing an assessment, included in index once instead of repeating
    const viewData = {
      title: "Dashboard",
      assessments: assessmentStore
        .getUserAssessments(loggedInUser.id)
        .reverse(), //showing latest assessment first
      userName: loggedInUser.name,
      userAnalytics: analytics.getAnalytics(loggedInUser), //object of all stats returned
      openGoals: goalStore.getUserOpenGoals(loggedInUser.id).reverse(), //splitting out the open goals to display differently
      closedGoals: goalStore.getUserClosedGoals(loggedInUser.id).reverse(),
      todaysDate: date
    };
    response.render("dashboard", viewData);
  },

  //adds an assessment using the inputs from the add assessment form
  //also updates the users count of assessments for use in the trainer dashboard
  addAssessment(request, response) {
    logger.info("adding assessment");
    const loggedInUser = accounts.getCurrentUser(request);
    const date = new Date();
    const newAssessment = {
      id: uuid.v1(),
      userid: loggedInUser.id,
      date: date.toUTCString(),
      weight: request.body.weight,
      chest: request.body.chest,
      thigh: request.body.thigh,
      upperArm: request.body.upperArm,
      waist: request.body.waist,
      hips: request.body.hips,
      trend: "",
      comment: ""
    };
    assessmentStore.addAssessment(newAssessment);
    users.updateCountAssessments(
      loggedInUser,
      assessmentStore.getUserCountAssessments(loggedInUser.id)
    );
    response.redirect("/dashboard");
  },

  //deletes an assessment
  //also updates the users count of assessments for use in the trainer dashboard
  deleteAssessment(request, response) {
    const loggedInUser = accounts.getCurrentUser(request);
    const assessmentId = request.params.id;
    logger.info(`Deleting assessment ${assessmentId}`);
    assessmentStore.removeAssessment(assessmentId);
    users.updateCountAssessments(
      loggedInUser,
      assessmentStore.getUserCountAssessments(loggedInUser.id)
    );
    response.redirect("/dashboard");
  },

  addGoal(request, response) {
    logger.info("adding goal");
    const loggedInUser = accounts.getCurrentUser(request);
    const lastAssessment = assessmentStore.getUserLatestAssessment(
      loggedInUser.id
    );
    const date = new Date();
    const newGoal = {
      id: uuid.v1(),
      userid: loggedInUser.id,
      date: date.toDateString(),
      measurement: request.body.measurement,
      target: request.body.target,
      targetDate: request.body.targetDate,
      startingMeasurement: analytics.startingMeasurement(
        loggedInUser.id,
        request.body.measurement
      ), //starting measurement required for adding a goal, used to measure progress, if not available no % progress is shown
      daysRemaining: "",
      percentTargetAchieved: "",
      status: "open",
      addedBy: "",
      achieved: false
    };
    goalStore.addGoal(newGoal);

    response.redirect("/dashboard");
  },

  deleteGoal(request, response) {
    const loggedInUser = accounts.getCurrentUser(request);
    const goalId = request.params.id;
    logger.info(`Deleting goal ${goalId}`);
    goalStore.removeGoal(goalId);
    response.redirect("/dashboard");
  }
};

module.exports = dashboard;
