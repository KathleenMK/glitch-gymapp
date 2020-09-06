"use strict";

const logger = require("./logger");
const assessmentStore = require("../models/assessment-store");
const goalStore = require("../models/goal-store");
const users = require("../models/user-store");

/*
analytics object created calling BMI and Ideal weight methods for use in the index methods 
in the dashboard and trainerassessments index controllers
*/
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

  /*
  BMI calculation, if no assesssments available, uses starting weight
  */
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

  /*
  Determination of BMI category based on BMI calc above
  */
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

  /*
  Calculates the ideal weight for a user
  */
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

  /*
  Determines whether the current weight is within an acceptable range of the 
  ideal weight as calculated above
  */
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

  /*
  recalcalculates the trend for the assessments display
  for use by the user display
  */
  recalcAssessmentsTrend(user) {
    assessmentStore.calculateUserTrend(user.id, user.startingWeight);
  },

  /*
  calculates the days remaining before the target date
  the status of the goal
  and the percentage target achieved
  for use by the user and trainer display
  */
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
  },

  /*
  determines the starting measurement for use by the trainer or user
  when creating a goal
  */
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

module.exports = analytics;
