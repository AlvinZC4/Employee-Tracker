const mysql = require("mysql")
const pwd = require("./Assets/pwd.js")

const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: pwd,
    database: "employees_db"
})

connection.connect(function(err) {
    if (err) throw err
    console.log("connected as id: " + connection.threadId)
    connection.end()
})