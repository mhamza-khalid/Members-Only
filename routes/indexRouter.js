const { Router } = require("express");
const indexRouter = Router();

const { welcomePage, signIn } = require('../controllers/indexController');

indexRouter.get("/", welcomePage);


module.exports = indexRouter;