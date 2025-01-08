const { Router } = require("express");
const postMessage = Router();

const { displayForm, submitForm } = require('../controllers/messageController');

postMessage.get("/", displayForm)

postMessage.post("/", submitForm) 

module.exports = postMessage;