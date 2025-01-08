const { Router } = require("express");
const signUpRouter = Router();

const { signUp } = require('../controllers/signUpController');


signUpRouter.post("/", signUp)

module.exports = signUpRouter;



