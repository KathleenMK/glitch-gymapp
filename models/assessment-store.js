"use strict";

const _ = require("lodash");
const JsonStore = require("./json-store");
const logger = require("../utils/logger");

const assessmentListStore = {
  store: new JsonStore("./models/assessment-store.json", {
    assessmentCollection: []
  }),
  collection: "assessmentCollection",

  getAllAssessments() {
    return this.store.findAll(this.collection);
  },

  addAssessment(assessment) {
    logger.info("adding assessment from store");
    this.store.add(this.collection, assessment);
    this.store.save();
  },

  getAssessment(id) {
    return this.store.findOneBy(this.collection, { id: id });
  },

  removeAssessment(id) {
    const assessment = this.getAssessment(id);
    this.store.remove(this.collection, assessment);
    this.store.save();
  },

  getUserAssessments(userid) {
    return this.store.findBy(this.collection, { userid: userid });
  },

  getUserCountAssessments(userid) {
    return assessmentListStore.getUserAssessments(userid).length;
  },

  getUserLatestAssessment(userid) {
    return assessmentListStore.getUserAssessments(userid)[
      assessmentListStore.getUserCountAssessments(userid) - 1
    ];
  },

  getUserLatestMeasurement(userid, measurement) {
    const latestAssessment = assessmentListStore.getUserLatestAssessment(
      userid
    );
    if (measurement === "weight") {
      return latestAssessment.weight;
    } else if (measurement === "chest") {
      return latestAssessment.chest;
    } else if (measurement === "thigh") {
      return latestAssessment.thigh;
    } else if (measurement === "upperArm") {
      return latestAssessment.upperArm;
    } else if (measurement === "waist") {
      return latestAssessment.waist;
    } else if (measurement === "hips") {
      return latestAssessment.hips;
    }
  },

  updateComment(assessment, newComment) {
    logger.info("updating the comment from store");
    assessment.comment = newComment;
    this.store.save();
  },

  calculateUserTrend(userid, userStartingWeight) {
    logger.info("calculating user assessment trends");
    const assessments = assessmentListStore.getUserAssessments(userid);
    if (assessments.length > 0) {
      if (parseFloat(assessments[0].weight) <= parseFloat(userStartingWeight)) {
        assessments[0].trend = true;
      } else {
        assessments[0].trend = false;
      }

      for (let i = 1; i < assessments.length; i++) {
        if (
          parseFloat(assessments[i].weight) <=
          parseFloat(assessments[i - 1].weight)
        ) {
          assessments[i].trend = true;
        } else {
          assessments[i].trend = false;
        }
      }
      this.store.save();
    }
  }
};

module.exports = assessmentListStore;
