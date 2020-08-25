"use strict";

const logger = require("../utils/logger");
const todoListStore = require("../models/todo-list-store");
const accounts = require("./accounts.js");
const uuid = require("uuid");

const dashboard = {
  index(request, response) {
    logger.info("dashboard rendering");
    const loggedInUser = accounts.getCurrentUser(request);
    const viewData = {
      title: "Template 1 Dashboard",
      todolist: todoListStore.getUserTodos(loggedInUser.id),
    };
    response.render("dashboard", viewData);
  },

  addTodo(request, response) {
    const loggedInUser = accounts.getCurrentUser(request);
    const todo = {
      id: uuid.v1(),
      userid: loggedInUser.id,
      title: request.body.title,
    };
    todoListStore.addTodo(todo);
    response.redirect("/dashboard");
  },

  deleteTodo(request, response) {
    const todoId = request.params.id;
    logger.info(`Deleting todo ${todoId}`);
    todoListStore.removeTodo(todoId);
    response.redirect("/dashboard");
  },
};

module.exports = dashboard;
