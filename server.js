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


// const initApp = function() {
//     inquirer.prompt([
//         {
//             type: "list",
//             name: "menu",
//             message: "What would you like to do?",
//             choices: [
//                 "View Departments",
//                 "Exit"
//             ]
//         }
//     ]).then(function(ans) {
//         console.log("Here comes the response")
//         if (ans.menu === "View Departments") {
//             console.log("Response was to view departments")
//             const viewDepartments = () => {
//                 console.log("Running viewDepartments...")
//                 connection.query("SELECT * FROM department", function (err, res) {
//                     if (err) throw err
//                     console.log(res)
//                     connection.end
//                 })
//             }
//         runConnect(viewDepartments)
//         }
//     })
// }




