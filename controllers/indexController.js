const pool = require('../db/pool.js');

function welcomePage(req, res) {
  
    res.render('welcome')

};

async function signIn(req, res){
    await pool.query('DELETE FROM session');
    
    // Clear the cookie from the browser
    res.clearCookie('connect.sid'); // Clear the session cookie
    console.log(req.body.action)
    if(req.body.action == 'sign'){
       
        return res.render('welcome', {signIn : 'ok'})
    }

    if(req.body.action == 'sign-up'){
      
        return res.render('welcome', {signUp : 'ok'})
    }
    if(req.body.action == 'cancel'){
        
        res.redirect('/')
    }
    
}

module.exports = { welcomePage, signIn };