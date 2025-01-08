const { Router } = require("express");
const signInRouter = Router();

const { signIn } = require('../controllers/indexController');


signInRouter.post("/", signIn)

module.exports = signInRouter;