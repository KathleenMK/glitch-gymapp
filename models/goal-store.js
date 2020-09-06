"use strict";

const _ = require("lodash");
const JsonStore = require("./json-store");
const logger = require("../utils/logger");

const goalListStore = {
  store: new JsonStore("./models/goal-store.json", {
    goalCollection: []
  }),
  collection: "goalCollection",

  getAllGoals() {
    return this.store.findAll(this.collection);
  },

  addGoal(assessment) {
    logger.info("adding goal from store");
    this.store.add(this.collection, assessment);
    this.store.save();
  },

  getGoal(id) {
    return this.store.findOneBy(this.collection, { id: id });
  },

  removeGoal(id) {
    const goal = this.getGoal(id);
    this.store.remove(this.collection, goal);
    this.store.save();
  },

  getUserGoals(userid) {
    return this.store.findBy(this.collection, { userid: userid });
  },

  /*
  Iterates through the user goals and if open is added to
  an array of open goals, determines how the goal is displayed
  */
  getUserOpenGoals(userid) {
    const goals = goalListStore.getUserGoals(userid);
    const openGoals = [];
    for (let i = 0; i < goals.length; i++) {
      if (goals[i].status === "open") {
        openGoals.push(goals[i]);
      }
    }
    return openGoals;
  },

  /*
  Iterates through the user goals and if not open(missed or achieved)
  is added to an array of closed goals, determines how the goal is displayed
  */
  getUserClosedGoals(userid) {
    const goals = goalListStore.getUserGoals(userid);
    const closedGoals = [];
    for (let i = 0; i < goals.length; i++) {
      if (goals[i].status !== "open") {
        closedGoals.push(goals[i]);
      }
    }
    return closedGoals;
  },

  getUserCountGoals(userid) {
    return goalListStore.getUserGoals(userid).length;
  },

  /*
  if the goal status is open recalculates the diff between the
  target date and todays date as days remaining
  */
  daysRemaining(userid) {
    const goals = goalListStore.getUserGoals(userid);
    const date = new Date();
    for (let i = 0; i < goals.length; i++) {
      if (goals[i].status === "open") {
        goals[i].daysRemaining = Math.ceil(
          (Date.parse(goals[i].targetDate) - Date.parse(date)) /
            (1000 * 24 * 60 * 60) //converts difference in dates from seconds to days
        );
      }
    }
  },

  /*
  Iterates through the goals for a given user to calculate the status (open, missed 
  or achieved) of that goal based on the latest assessment
  Only considers goals that are still open
  If the percent target achieved is >=100 or the target measurement is
  exactly the latest measurement the goal is deemed achieved, if not
  achieved and the days remaining are less than zero the goal is deeemed
  missed, otherwise it remains open
 */
  calcStatus(userid, latestAssessment) {
    const goals = goalListStore.getUserGoals(userid);

    for (let i = 0; i < goals.length; i++) {
      if (goals[i].status === "open" && goals[i].measurement === "weight") {
        if (
          goals[i].percentTargetAchieved >= 100 ||
          goals[i].target === latestAssessment.weight
        ) {
          goals[i].status = "achieved";
          goals[i].achieved = true;
        } else if (goals[i].daysRemaining < 0) {
          goals[i].status = "missed";
        }
      } else if (
        goals[i].status === "open" &&
        goals[i].measurement === "chest"
      ) {
        if (
          goals[i].percentTargetAchieved >= 100 ||
          goals[i].target === latestAssessment.chest
        ) {
          goals[i].status = "achieved";
          goals[i].achieved = true;
        } else if (goals[i].daysRemaining < 0) {
          goals[i].status = "missed";
        }
      } else if (
        goals[i].status === "open" &&
        goals[i].measurement === "thigh"
      ) {
        if (
          goals[i].percentTargetAchieved >= 100 ||
          goals[i].target === latestAssessment.thigh
        ) {
          goals[i].status = "achieved";
          goals[i].achieved = true;
        } else if (goals[i].daysRemaining < 0) {
          goals[i].status = "missed";
        }
      } else if (
        goals[i].status === "open" &&
        goals[i].measurement === "upperArm"
      ) {
        if (
          goals[i].percentTargetAchieved >= 100 ||
          goals[i].target === latestAssessment.upperArm
        ) {
          goals[i].status = "achieved";
          goals[i].achieved = true;
        } else if (goals[i].daysRemaining < 0) {
          goals[i].status = "missed";
        }
      } else if (
        goals[i].status === "open" &&
        goals[i].measurement === "waist"
      ) {
        if (
          goals[i].percentTargetAchieved >= 100 ||
          goals[i].target === latestAssessment.waist
        ) {
          goals[i].status = "achieved";
          goals[i].achieved = true;
        } else if (goals[i].daysRemaining < 0) {
          goals[i].status = "missed";
        }
      } else if (
        goals[i].status === "open" &&
        goals[i].measurement === "hips"
      ) {
        if (
          goals[i].percentTargetAchieved >= 100 ||
          goals[i].target === latestAssessment.hips
        ) {
          goals[i].status = "achieved";
          goals[i].achieved = true;
        } else if (goals[i].daysRemaining < 0) {
          goals[i].status = "missed";
        }
      }
    }
  },

    /*
  Iterates through the user goals and if open and the starting 
  measurment is greater than zero, the starting measurement minus
  the latest over the starting minus the target is the % achieved
  */
  calcPercentTargetAchieved(userid, latestAssessment) {
    const goals = goalListStore.getUserGoals(userid);
    //const date = new Date();

    for (let i = 0; i < goals.length; i++) {
      if (
        goals[i].measurement === "weight" &&
        goals[i].startingMeasurement > 0 &&
        goals[i].status === "open"
      ) {
        goals[i].percentTargetAchieved = Math.round(
          100 *
            ((parseFloat(goals[i].startingMeasurement) -
              parseFloat(latestAssessment.weight)) /
              (parseFloat(goals[i].startingMeasurement) -
                parseFloat(goals[i].target)))
        );
      } else if (
        goals[i].measurement === "chest" &&
        goals[i].startingMeasurement > 0 &&
        goals[i].status === "open"
      ) {
        goals[i].percentTargetAchieved = Math.round(
          100 *
            ((parseFloat(goals[i].startingMeasurement) -
              parseFloat(latestAssessment.chest)) /
              (parseFloat(goals[i].startingMeasurement) -
                parseFloat(goals[i].target)))
        );
      } else if (
        goals[i].measurement === "thigh" &&
        goals[i].startingMeasurement > 0 &&
        goals[i].status === "open"
      ) {
        goals[i].percentTargetAchieved = Math.round(
          100 *
            ((parseFloat(goals[i].startingMeasurement) -
              parseFloat(latestAssessment.thigh)) /
              (parseFloat(goals[i].startingMeasurement) -
                parseFloat(goals[i].target)))
        );
      } else if (
        goals[i].measurement === "upperArm" &&
        goals[i].startingMeasurement > 0 &&
        goals[i].status === "open"
      ) {
        goals[i].percentTargetAchieved = Math.round(
          100 *
            ((parseFloat(goals[i].startingMeasurement) -
              parseFloat(latestAssessment.upperArm)) /
              (parseFloat(goals[i].startingMeasurement) -
                parseFloat(goals[i].target)))
        );
      } else if (
        goals[i].measurement === "waist" &&
        goals[i].startingMeasurement > 0 &&
        goals[i].status === "open"
      ) {
        goals[i].percentTargetAchieved = Math.round(
          100 *
            ((parseFloat(goals[i].startingMeasurement) -
              parseFloat(latestAssessment.waist)) /
              (parseFloat(goals[i].startingMeasurement) -
                parseFloat(goals[i].target)))
        );
      } else if (
        goals[i].measurement === "hips" &&
        goals[i].startingMeasurement > 0 &&
        goals[i].status === "open"
      ) {
        goals[i].percentTargetAchieved = Math.round(
          100 *
            ((parseFloat(goals[i].startingMeasurement) -
              parseFloat(latestAssessment.hips)) /
              (parseFloat(goals[i].startingMeasurement) -
                parseFloat(goals[i].target)))
        );
      }
    }
  }
};

module.exports = goalListStore;
