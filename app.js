const express = require("express");
const app = express();
const path = require('node:path');
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const PgSession = require("connect-pg-simple")(session);
const pool = require('./db/pool.js');
let cookieParser = require('cookie-parser');
const db = require("./db/queries");

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

const assetsPath = path.join(__dirname, "public");
app.use(express.static(assetsPath));

const indexRouter = require("./routes/indexRouter");
const signInRouter = require("./routes/signInRouter");
const signUpRouter = require("./routes/signUpRouter");
const postMessage = require("./routes/messagePostRouter");
const memberForm = require("./routes/memberFormRouter");


// Middleware setup (correct order)
app.use(
  session({
    store: new PgSession({
      pool: pool, // Use the pool created above
      tableName: "session", // Optional: Default is 'session'
      createTableIfMissing: true, 
    }),
    secret: "your_secret_key", // Replace with a secure secret key
    resave: false, // Do not save session if it wasn't modified
    saveUninitialized: false, // Do not create a session until something is stored
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 24 hours expiry for cookie
    },
  })
);
//gets the cookie with sid if there is one else sets up a session with sid
//and sends it as a cookie to the broswer
app.use(passport.initialize()); //initializes the passport for handling
app.use(passport.session()); //sends the sid to deserialize if there is one
                             //if there is no cookie then serialize is called to set a cookie
app.use(express.urlencoded({ extended: true }));

// app.use((req, res, next) => {
//     console.log('Session:', req.session);
//     next();
// });

passport.use(
  new LocalStrategy({
        usernameField: 'email', // Maps 'email' from req.body
        passwordField: 'password' // Maps 'password' from req.body
    },
    async (username, password, done) => {
    
        try {
        console.log('okkkkkk')
        const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [username]);
        const user = rows[0];
        
        console.log('User from local strategy' ,user);
        
        if (!user) {
            return done(null, false, { message: "Email does not exist. Sign up!" });
        }
        const match = await bcrypt.compare(password, user.password);
        // console.log(match)
        if (!match) {
            // passwords do not match!
            // console.log('Password match failure while authenticating')
            return done(null, false, { message: "Incorrect password" })
        }
        return done(null, user);
        } catch(err) {
        return done(err);
        }
    })
);

//req.session is basically the row in sessions table for that sid
//on failed login attempt, messages : ['Error message from localstrategy'] is set in that sid row in db and req.session.messages
//on successfull login, that user id is set in req.session and session table in db like passport:{user:userID}
passport.serializeUser((user, done) => { // attaches passport: {user : user.id} to sid and also attaches user to req.user on first login
    // console.log('User in serialize', user.user_id)
    done(null, user.user_id);
});

passport.deserializeUser(async (id, done) => { //populates req.user once subsequent requests are sent from broswer containing cookie with sid
  try {
    const { rows } = await pool.query("SELECT * FROM users WHERE user_id = $1", [id]);
    const user = rows[0];
    done(null, user);
  } catch(err) {
    done(err);
  }
});



app.use('/', indexRouter)

app.use('/sign-in', signInRouter)

app.post('/sign-in-display', async (req, res)=>{
    await pool.query('DELETE FROM session');
    // Clear the cookie from the browser
    res.clearCookie('connect.sid'); // Clear the session cookie
    res.render('welcome', {signIn : 'ok', message: ''});
})

app.get('/sign-in-display',async (req, res)=>{
    await pool.query('DELETE FROM session');
    // Clear the cookie from the browser
    res.clearCookie('connect.sid'); // Clear the session cookie
    res.render('welcome', {signIn : 'ok', message: ''});
})

app.get('/login-fail', (req, res)=>{
    error_message = req.session.messages[req.session.messages.length - 1];
    console.log(error_message)
    res.render('welcome', {signIn : 'ok', errorMessage: error_message , message: '', userData: req.body})
})



//This is where app comes when user signs in or hits cancel in sign in page
app.post('/sign-in-request', (req, res, next)=>{

    //render sign up form is user wants to sign up
    if(req.body.action == 'sign-up'){
       return res.render('welcome', {signUp : 'ok', userData : {}}); 
    }
    //return to home if user cancels at sign in page
    if(req.body.action == 'cancel'){
        return res.render('welcome'); 
    }
    next();

})

app.post(
    '/sign-in-request',
    passport.authenticate('local', {
      failureRedirect: '/login-fail',
      failureMessage: true, // Stores failure messages in `req.session.messages`
    }),

    //Now we have authenticated user available in req.user if we reach here
    //we will have to generate a dashboard
    (req, res) => {
    
      res.redirect('/dashboard')
    }
);

app.get(
    '/dashboard',
    isAuthenticated,
    //Now we have authenticated user available in req.user if we reach here
    //we will have to generate a dashboard
    async (req, res) => {
      console.log(req.user);

      let messages = await db.getAllMessages();

      //Now we have to join the messages and users table and
      //send the rows to the dashboard and dsiplay them only if user is member
      let names = await db.getNames()
      console.log(names);
      res.render('dashboard', {userData: req.user, messages: messages, names: names})
    }
);

function isAuthenticated(req, res, next){
    if (req.isAuthenticated()) return next();
    res.render('welcome', {signIn : 'ok', message: 'Please sign in to post your messages.'});
}
    
app.use('/message-post-form', isAuthenticated ,postMessage)
//This is where app comes when user submits sign-up form
app.use('/sign-up-request', signUpRouter)

app.get('/delete-message', async (req, res)=>{
    const id = req.query.id; // Get the value from the query parameter
    //delete message from db messages table
    await db.deleteMessage(id)

    res.redirect('/dashboard')
})

app.use('/membership-form', isAuthenticated ,memberForm)

app.get('/log-out', (req, res)=>{

    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/sign-in-display');
    });
})




app.listen(4000, () => {
    console.log(`Example app listening on port 3000`)
})