const mysql = require("mysql")
const pwd = require("./Assets/pwd.js")
const initApp = require("./Develop/prompts")
// const initApp = require("./Develop/prompts")
// const inquirer = require("inquirer")

const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: pwd,
    database: "employees_db"
})



connection.connect(function(err) {
    if (err) throw err
    initApp(connection)
})


