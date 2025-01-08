//This controller shall validate and sanitize sign up form data
//Once its validated, we will populate the users table in the db
//and redirect user to the sign in page
const bcrypt = require('bcryptjs');

const db = require("../db/queries");
const { body, validationResult } = require("express-validator");


const valdiateUser = [
    body("first_name")
        .notEmpty().withMessage("First name can't be empty")
        .isLength({max: 20})
        .customSanitizer((value) => {
            // Custom sanitization: Remove special characters, reduce spaces, capitalize words
            // and updates new_genre in req.body as per rules below
            return value
                .replace(/[^a-zA-Z0-9\s]/g, "") // Remove special characters
                .replace(/\s+/g, " ")          // Reduce multiple spaces to one
                .trim()                        // Trim leading and trailing spaces
                .replace(/\b\w/g, char => char.toUpperCase()); // Capitalize each word
        })
        // .custom(async (value) => {//custom validator checks if genre already exists in table
        //     //console.log(value)
        //     const games = await db.getAllGames(); 
        //     games.forEach((item)=>{
        //         if(item.game_name == value){
        //             console.log(item.game_name)
        //             throw new Error(`${value} is already an exisiting Game!`);
        //         }
        //     })
                    
        // })
    ,
    body("last_name")
        .notEmpty().withMessage("Last name can't be empty")
        .isLength({max: 20})
        .customSanitizer((value) => {
            // Custom sanitization: Remove special characters, reduce spaces, capitalize words
            // and updates new_genre in req.body as per rules below
            return value
                .replace(/[^a-zA-Z0-9\s]/g, "") // Remove special characters
                .replace(/\s+/g, " ")          // Reduce multiple spaces to one
                .trim()                        // Trim leading and trailing spaces
                .replace(/\b\w/g, char => char.toUpperCase()); // Capitalize each word
        })
    ,

    body("email") //add custom validator to check if this email exists in db
        .notEmpty().withMessage("Please provide an email")
        .isEmail().withMessage("Enter a valid email address")
        .customSanitizer(value => {
            return value.trim() 
        })
        .custom(async (value)=>{
            let emails = await db.getAllEmails();

            console.log(emails)
            emails.forEach(email => {
                if(email.email == value){
                    throw new Error(`${email.email} is already an existing user!`);
                }
            });
        })
        
    ,
    body("password")
        .notEmpty().withMessage("Password can't be empty")
        .custom((value) => {
            const errors = [];
            if (value.length < 8) {
              errors.push('Password must be at least 8 characters long.');
            }
            if (!/[A-Z]/.test(value)) {
              errors.push('Password must include at least one uppercase letter.');
            }
            if (!/[a-z]/.test(value)) {
              errors.push('Password must include at least one lowercase letter.');
            }
            if (!/\d/.test(value)) {
              errors.push('Password must include at least one number.');
            }
            if (!/[@$!%*?&#]/.test(value)) {
              errors.push('Password must include at least one special character.');
            }
        
            // Throw error if any conditions are unmet
            if (errors.length > 0) {
              throw new Error(errors.join(' '));
            }
            return true;
          })
        ,
        
    body("confirm_password")
        .notEmpty().withMessage("Please confirm your password")
        .custom((value, { req }) => {
          if (value !== req.body.password) {
            throw new Error("Passwords do not match");
          }
          return true; 
        })

        
]


let signUp = [
    valdiateUser,
    async (req, res) => {
        //return to sign in page if user cancels sign up
        // console.log('Req body', req.body)
        if(req.body.action == 'cancel'){
           return res.render('welcome', {signIn : 'ok', message: ''}); 
        }
        if(req.body == {}){
            return res.render('welcome', {signIn : 'ok', message: ''}); 
        }
        const errors = validationResult(req);
        
        if (!errors.isEmpty()) {
            return res.render('welcome', 
                              {signUp : 'ok', errors : errors.array(), userData: req.body}); 
        }

        //Now at this point our form for sign up data is validated and sanitized
        //We have to enter this data into the users table of the db 
        //also encrypt password when stored in db
        // and 
        //redirect user to the sign in page with a message saying user
        //was successfully created, sign in now please

        let userData = req.body;
        
        const hashedPassword = await bcrypt.hash(req.body.password, 10); // Hash the password
        userData.password = hashedPassword;
        

        if(userData.isAdmin){
            userData.isAdmin = 'true'
        }
        else{
            userData.isAdmin = 'false'
        }

        //console.log('Final User Data', userData);
        
        await db.insert_user(userData)
        req.body = {}
        return res.render("welcome", {signIn: 'ok', message: 'User created successfully!'});
          
    }
]

module.exports = {
    signUp
}