const db = require("../db/queries");
const { body, validationResult } = require("express-validator");

function displayForm(req, res){
    return res.render("membership-form", {userData: req.user})
}

const valdiatePassword = [
    body("memberPassword")
        .custom(value=>{
            if(value != 'pochinki'){
                throw new Error(`Incorrect Password`);
            }
            return true
        })
]

let submitForm = [
    valdiatePassword,
    async (req, res)=>{
        console.log(req.user)
        if(req.body.action == 'cancel'){
            return res.redirect('/dashboard')
        }
    
        const errors = validationResult(req);
    
        if (!errors.isEmpty()) {
            return res.render('membership-form', 
                            {errors : errors.array(), userData: req.user}); 
        }
        //now if req.body.memberPassword equals 'pochinki' we have to
        //update that users membership status in the database
        await db.updateUserToMember(req.user.user_id)

        
        return res.redirect('/dashboard')
    }
]

module.exports = {
    displayForm,
    submitForm
}