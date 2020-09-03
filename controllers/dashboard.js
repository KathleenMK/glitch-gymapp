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
    const viewData = {
      title: "Dashboard",
      assessments: assessmentStore
        .getUserAssessments(loggedInUser.id)
        .reverse(),
      userName: loggedInUser.name,
      BMI: analytics.calculateBMI(loggedInUser),
      BMICategory: analytics.determineBMICategory(
        analytics.calculateBMI(loggedInUser)
      ),
      idealWeight: analytics.getIdealWeight(loggedInUser),
      idealWeightInd: analytics.getIsIdealBodyWeightInd(loggedInUser),
      goals: goalStore.getUserGoals(loggedInUser.id),
      openGoals: goalStore.getUserOpenGoals(loggedInUser.id),
      closedGoals: goalStore.getUserClosedGoals(loggedInUser.id),
      todaysDate: date

      //currentWeight: loggedInUser.startingWeight
    };
    assessmentStore.calculateUserTrend(
      loggedInUser.id,
      loggedInUser.startingWeight
    );
    goalStore.daysRemaining(loggedInUser.id);
    if (assessmentStore.getUserCountAssessments(loggedInUser.id) > 0) {
      goalStore.calcPercentTargetAchieved(
        loggedInUser.id,
        assessmentStore.getUserLatestAssessment(loggedInUser.id)
      );
      goalStore.calcStatus(
        loggedInUser.id,
        assessmentStore.getUserLatestAssessment(loggedInUser.id)
      );
    }
    //else{goalStore.clearPercentTargetAchieved(loggedInUser.id)}

    response.render("dashboard", viewData);
  },

  addAssessment(request, response) {
    logger.info("adding assessment");
    const loggedInUser = accounts.getCurrentUser(request);
    //assessmentStore.calculateUserTrend(loggedInUser.id);
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

  deleteAssessment(request, response) {
    const loggedInUser = accounts.getCurrentUser(request);
    //assessmentStore.calculateUserTrend(loggedInUser.id);
    const assessmentId = request.params.id;
    logger.info(`Deleting assessment ${assessmentId}`);
    assessmentStore.removeAssessment(assessmentId);
    users.updateCountAssessments(
      loggedInUser,
      assessmentStore.getUserCountAssessments(loggedInUser.id)
    );
    //assessmentStore.calculateUserTrend(loggedInUser.id, loggedInUser.startingWeight);
    response.redirect("/dashboard");
  },

  addGoal(request, response) {
    logger.info("adding goal");
    const loggedInUser = accounts.getCurrentUser(request);
    const lastAssessment = assessmentStore.getUserLatestAssessment(
      loggedInUser.id
    );
    //const measurement = request.body.measurement;
    //assessmentStore.calculateUserTrend(loggedInUser.id);
    const date = new Date();
    const newGoal = {
      id: uuid.v1(),
      userid: loggedInUser.id,
      date: date.toDateString(),
      measurement: request.body.measurement,
      target: request.body.target,
      targetDate: request.body.targetDate,
      //lastAssessment : assessmentStore.getUserLatestAssessment(loggedInUser.id),
      startingMeasurement: dashboard.startingMeasurement(
        loggedInUser.id,
        request.body.measurement
      ),
      daysRemaining: "",
      percentTargetAchieved: "",
      status: "open",
      comment: ""
    };
    goalStore.addGoal(newGoal);

    response.redirect("/dashboard");
  },

  deleteGoal(request, response) {
    const loggedInUser = accounts.getCurrentUser(request);
    //assessmentStore.calculateUserTrend(loggedInUser.id);
    const goalId = request.params.id;
    logger.info(`Deleting goal ${goalId}`);
    goalStore.removeGoal(goalId);
    //assessmentStore.calculateUserTrend(loggedInUser.id, loggedInUser.startingWeight);
    response.redirect("/dashboard");
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

module.exports = dashboard;
