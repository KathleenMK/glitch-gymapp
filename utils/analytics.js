"use strict";

const logger = require("./logger");
const assessmentStore = require("../models/assessment-store");
const goalStore = require("../models/goal-store");
//const accounts = require("../controllers/accounts.js");

const analytics = {
  getAnalytics(user) {
    const userAnalytics = {
      BMI: analytics.calculateBMI(user),
      BMICategory: analytics.determineBMICategory(analytics.calculateBMI(user)),
      idealWeight: analytics.getIdealWeight(user),
      idealWeightInd: analytics.getIsIdealBodyWeightInd(user)
    };
    return userAnalytics;
  },

  calculateBMI(user) {
    let BMI = 0;
    if (user.height > 0) {
      if (assessmentStore.getUserCountAssessments(user.id) > 0) {
        const currentWeight = assessmentStore.getUserLatestAssessment(user.id)
          .weight;
        BMI =
          Math.round((100 * currentWeight) / Math.pow(user.height, 2)) / 100;
      } else {
        BMI =
          Math.round((100 * user.startingWeight) / Math.pow(user.height, 2)) /
          100;
      }
      return BMI;
    } else {
      return 0;
    }
  },

  determineBMICategory(bmiValue) {
    if (bmiValue == 0 || bmiValue < 0) {
      return "BMI Category not found";
    } else if ((bmiValue < 16) & (bmiValue > 0)) {
      return "SEVERELY UNDERWEIGHT";
    } else if (bmiValue < 18.5) {
      return "UNDERWEIGHT";
    } else if (bmiValue < 25) {
      return "NORMAL";
    } else if (bmiValue < 30) {
      return "OVERWEIGHT";
    } else if (bmiValue < 35) {
      return "MODERATELY OBESE";
    } else if (bmiValue > 35 || bmiValue == 35) {
      return "SEVERELY OBESE";
    }
    return "BMI Category not found";
  },

  getIsIdealBodyWeightInd(user) {
    let BMI = 0;
    if (user.height > 0) {
      if (assessmentStore.getUserCountAssessments(user.id) > 0) {
        const currentWeight = assessmentStore.getUserLatestAssessment(user.id)
          .weight;
        BMI =
          Math.round((100 * currentWeight) / Math.pow(user.height, 2)) / 100;
      } else {
        BMI =
          Math.round((100 * user.startingWeight) / Math.pow(user.height, 2)) /
          100;
      }
      return BMI;
    } else {
      return 0;
    }
  },

  getIdealWeight(user) {
    const convertMtrsToInchesFactor = 39.37;
    const heightCheckMtrs = 60 / convertMtrsToInchesFactor;
    const genderLc = user.gender.toLowerCase().charAt(0);

    if (user.height > heightCheckMtrs) {
      if (genderLc == "m") {
        return (
          50 +
          2.3 * ((user.height - heightCheckMtrs) * convertMtrsToInchesFactor)
        );
      } else {
        return (
          45.5 +
          2.3 * ((user.height - heightCheckMtrs) * convertMtrsToInchesFactor)
        );
      }
    } else {
      if (genderLc == "m") {
        return 50.0;
      } else {
        return 45.5;
      }
    }
  },

  getIsIdealBodyWeightInd(user) {
    if (assessmentStore.getUserCountAssessments(user.id) > 0) {
      if (user.height > 0) {
        if (
          Math.abs(
            assessmentStore.getUserLatestAssessment(user.id).weight -
              analytics.getIdealWeight(user)
          ) <= 0.2
        ) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    } else {
      if (
        user.height > 0 &&
        Math.abs(user.startingWeight - analytics.getIdealWeight(user)) <= 0.2
      ) {
        return true;
      } else {
        return false;
      }
    }
  },

  //recalcalculates the trend for the assessments display
  recalcAssessmentsTrend(user) {
    assessmentStore.calculateUserTrend(user.id, user.startingWeight);
  },

  //calculates the days remaining before the target date
  //the status of the goal
  //and the percentage target achieved
  recalcGoalStats(user) {
    goalStore.daysRemaining(user.id);
    if (assessmentStore.getUserCountAssessments(user.id) > 0) {
      goalStore.calcPercentTargetAchieved(
        user.id,
        assessmentStore.getUserLatestAssessment(user.id)
      );
      goalStore.calcStatus(
        user.id,
        assessmentStore.getUserLatestAssessment(user.id)
      );
    }
  }
};

module.exports = analytics;
