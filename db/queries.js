const pool = require('./pool.js');

async function getAllEmails(){
    let {rows} = await pool.query('SELECT email FROM users');
    return rows;
}

async function getAllMessages(){
    let {rows} = await pool.query('SELECT * FROM messages');
    return rows;
}

async function insertMessage(message, user_id){
    await pool.query('INSERT INTO messages(user_id, message) VALUES ($1, $2)', [user_id, message])
}

async function insert_user(data){
    await pool.query(`INSERT INTO users(first_name, last_name, email, is_admin, password, is_member)
                      VALUES ($1, $2, $3, $4, $5, $6)`, [
                        data.first_name,
                        data.last_name,
                        data.email,
                        data.isAdmin,
                        data.password,
                        'false'
                      ])
}

async function deleteMessage(id){
    await pool.query(`DELETE FROM messages WHERE mess_id=($1)`, [id])
}

async function updateUserToMember(id){
    await pool.query(`UPDATE users SET is_member = true WHERE user_id = ($1)`, [id])
}

async function getNames(){
    let { rows } = await pool.query(`SELECT 
                               CONCAT(users.first_name, ' ', users.last_name) AS full_name
                               FROM
                               messages
                               LEFT JOIN
                               users
                               ON messages.user_id = users.user_id;`)
    
    return rows;
    }

module.exports = {
    getAllEmails,
    insert_user,
    getAllMessages,
    insertMessage,
    deleteMessage,
    updateUserToMember,
    getNames
}