const db = require("../db/queries");
const { body, validationResult } = require("express-validator");

function displayForm(req, res){
    res.render('message-form')
}

const valdiateMessage = [
    body("message")
        .notEmpty().withMessage("Message can't be empty")
        .isLength({min: 10}).withMessage("Message needs to be minmum 10 characters in length")
]

let submitForm = [
    valdiateMessage,
    async (req,res)=>{

        // let messages = await db.getAllMessages();
    
        if(req.body.action == 'cancel'){
            return res.redirect('/dashboard')
        }

        const errors = validationResult(req);
        
        if (!errors.isEmpty()) {
            return res.render('message-form', 
                              {errors : errors.array()}); 
        }
    
    
        //else get user data and populate message table with req.user.user_id 
    
        let message = req.body.message;
        let user_id = req.user.user_id

        await db.insertMessage(message, user_id)

        let newMessages = await db.getAllMessages();

        return res.redirect('/dashboard')
    
    }
]


module.exports = {
    displayForm,
    submitForm
}