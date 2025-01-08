const { Router } = require("express");
const memberForm = Router();

const { displayForm, submitForm } = require('../controllers/memberController');

memberForm.get("/", displayForm)

memberForm.post("/", submitForm) 

module.exports = memberForm;