"use strict";

const express = require("express");
const router = express.Router();

const dashboard = require("./controllers/dashboard.js");
const about = require("./controllers/about.js");
const accounts = require("./controllers/accounts.js");
const settings = require("./controllers/settings.js");
const trainerdashboard = require("./controllers/trainerdashboard.js");
const trainerassessments = require("./controllers/trainerassessments.js");

router.get("/", accounts.index);
router.get("/login", accounts.login);
router.get("/signup", accounts.signup);
router.get("/logout", accounts.logout);
router.post("/register", accounts.register);
router.post("/authenticate", accounts.authenticate);

router.get("/dashboard", dashboard.index);
router.get("/trainerdashboard", trainerdashboard.index);
router.get("/trainerdashboard/deleteuser/:id", trainerdashboard.deleteUser);
router.get("/trainerassessments/:id", trainerassessments.index);
router.post("/trainerassessments/assessmentupdate/:id", trainerassessments.updateComment);
router.post("/trainerassessments/:userid/addgoal", trainerassessments.addGoal);
router.get("/about", about.index);

router.get("/settings", settings.index);
router.post("/updateuser/:userid", settings.update);

router.post("/dashboard/addassessment", dashboard.addAssessment);
router.get("/dashboard/deleteassessment/:id", dashboard.deleteAssessment);
router.post("/dashboard/addgoal", dashboard.addGoal);
router.get("/dashboard/deletegoal/:id", dashboard.deleteGoal);


module.exports = router;
