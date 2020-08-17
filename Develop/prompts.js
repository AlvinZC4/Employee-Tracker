const inquirer = require("inquirer")
const cTable = require("console.table")

const initApp = function(connection) {
    
    const topMenu = () => {
        inquirer.prompt([
            {
                type: "list",
                name: "menu",
                message: "What would you like to do?",
                choices: [
                    "View Departments",
                    "Add Department",
                    "View Roles",
                    "Add Role",
                    "View Employees",
                    "Add Employee",
                    "Exit"
                ]
            }
        ]).then(function(ans) {
            // console.log("Here comes the response")
            if (ans.menu === "View Departments") {
                connection.query("SELECT * FROM department", function (err, res) {
                    if (err) throw err
                    console.table(res)
                    topMenu()
                })
            }
            else if (ans.menu === "View Roles") {
                connection.query("SELECT * FROM role", function (err, res) {
                    if (err) throw err
                    console.table(res)
                    topMenu()
                })
            }
            else if (ans.menu === "View Employees") {
                connection.query("SELECT * FROM employee", function (err, res) {
                    if (err) throw err
                    console.table(res)
                    topMenu()
                })
            }
            else if (ans.menu === "Add Department") {
                addDept()
            }
            else if (ans.menu === "Add Role") {
                addRole()
            }
            else if (ans.menu === "Add Employee") {
                addEmployee()
            }
            else if (ans.menu === "Exit") {
                return
            }
        })
    }
    const addDept = () => {
        console.log("Add a department")
        inquirer.prompt([
            {
                type: "input",
                name: "createDept",
                message: "What is the name of the department you want to add?"
            }
        ]).then(function(ans) {
            connection.query("INSERT INTO department SET ?", {name: ans.createDept}, function(err, res) {
                if (err) throw err
                console.log(res.affectedRows + " roles inserted! \n")
                topMenu()
            })
        })
    }


    topMenu()
}



module.exports = initApp
