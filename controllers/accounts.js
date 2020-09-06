"use strict";

const userstore = require("../models/user-store");
const trainerstore = require("../models/trainer-store");
const logger = require("../utils/logger");
const uuid = require("uuid");

const accounts = {
  index(request, response) {
    const viewData = {
      title: "Login or Signup"
    };
    response.render("index", viewData);
  },

  login(request, response) {
    const viewData = {
      title: "Login to the Service"
    };
    response.render("login", viewData);
  },

  logout(request, response) {
    response.cookie("playlist", "");
    response.redirect("/");
  },

  signup(request, response) {
    const viewData = {
      title: "Login to the Service"
    };
    response.render("signup", viewData);
  },

  register(request, response) {
    const user = request.body;
    user.id = uuid.v1();
    user.countAssessments = 0;
    userstore.addUser(user);
    logger.info(`registering ${user.email}`);
    response.redirect("/");
  },

  authenticate(request, response) {
    const user = userstore.getUserByEmail(request.body.email);
    const trainer = trainerstore.getTrainerByEmail(request.body.email);
    if (user) {
      if (user.password === request.body.password) {
        //password=== required so that null is not deemed a match
        response.cookie("playlist", user.email);
        logger.info(`logging in ${user.email}`);
        response.redirect("/dashboard");
      } else {
        logger.info(`password incorrect for ${user.email}`);
        response.redirect("/login");
      }
    } else if (trainer) {
      if (trainer.password === request.body.password) {
        response.cookie("playlist", trainer.email);
        logger.info(`logging in ${trainer.email}`);
        response.redirect("/trainerdashboard");
      } else {
        logger.info(`password incorrect for ${trainer.email}`);
        response.redirect("/login");
      }
    } else {
      logger.info(`user ${request.body.email} does not exist`);
      response.redirect("/login");
    }
  },

  getCurrentUser(request) {
    const userEmail = request.cookies.playlist;
    return userstore.getUserByEmail(userEmail);
  }
};

module.exports = accounts;
