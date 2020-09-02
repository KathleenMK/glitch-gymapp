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

  updateComment(goal, newComment) {
    logger.info("updating the comment from store");
    goal.comment = newComment;
    this.store.save();
  },

  daysRemaining(userid) {
    const goals = goalListStore.getUserGoals(userid);
    const date = new Date();
    for (let i = 0; i < goals.length; i++) {
      if (goals[i].status === "open") {
        goals[i].daysRemaining = Math.ceil(
          (Date.parse(goals[i].targetDate) - Date.parse(date)) /
            (1000 * 24 * 60 * 60)
        );
        //goals[i].daysRemaining = goals[i].targetDate-date;
      }
    }
  },

  calcStatus(userid) {
    const goals = goalListStore.getUserGoals(userid);

    for (let i = 0; i < goals.length; i++) {
      if (goals[i].daysRemaining < 0) {
        goals[i].status = "closed";
      } else {
        goals[i].status = "open";
      }
    }
  },

  //need to calculate for all measurements, not just weight
  calcStatus(userid, latestAssessment) {
    const goals = goalListStore.getUserGoals(userid);

    for (let i = 0; i < goals.length; i++) {
      if (goals[i].status === "open" && goals[i].measurement === "weight") {
        if (
          goals[i].percentTargetAchieved >= 100 ||
          goals[i].target === latestAssessment.weight
        ) {
          goals[i].status = "achieved";
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
        } else if (goals[i].daysRemaining < 0) {
          goals[i].status = "missed";
        }
      }
    }
  },

  clearPercentTargetAchieved(userid) {
    const goals = goalListStore.getUserGoals(userid);
    //const date = new Date();

    for (let i = 0; i < goals.length; i++) {
      goals[i].percentTargetAchieved = 0;
    }
  },

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
        //= parseFloat(goals[i].startingMeasurement)-parseFloat(latestAssessment.weight);
        ///
        ///(parseFloat(goals[i].startingMeasurement)-parseFloat(goals[i].target));
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

  //   calculateUserTrend(userid, userStartingWeight) {
  //     logger.info("calculating user assessment trends");
  //     const assessments = assessmentListStore.getUserAssessments(userid);
  //     if (assessments.length > 0) {
  //       if (parseFloat(assessments[0].weight) <= parseFloat(userStartingWeight)) {
  //         assessments[0].trend = true;
  //       } else {
  //         assessments[0].trend = false;
  //       }

  //       for (let i = 1; i < assessments.length; i++) {
  //         if (
  //           parseFloat(assessments[i].weight) <=
  //           parseFloat(assessments[i - 1].weight)
  //         ) {
  //           assessments[i].trend = true;
  //         } else {
  //           assessments[i].trend = false;
  //         }
  //       }
  //       this.store.save();
  //     }
  //   }
};

module.exports = goalListStore;
