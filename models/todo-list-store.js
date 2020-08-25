"use strict";

const _ = require("lodash");
const JsonStore = require("./json-store");

const todoListStore = {
  store: new JsonStore("./models/todo-list-store.json", {
    todoListCollection: [],
  }),
  collection: "todoListCollection",

  getAllTodos() {
    return this.store.findAll(this.collection);
  },

  addTodo(todo) {
    this.store.add(this.collection, todo);
    this.store.save();
  },

  getTodo(id) {
    return this.store.findOneBy(this.collection, { id: id });
  },

  removeTodo(id) {
    const todo = this.getTodo(id);
    this.store.remove(this.collection, todo);
    this.store.save();
  },

  getUserTodos(userid) {
    return this.store.findBy(this.collection, { userid: userid });
  },
};

module.exports = todoListStore;
