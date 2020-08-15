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
                    "View Roles",
                    "View Employees",
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
            else if (ans.menu === "Exit") {
                connection.end()
                return
            }
        })
    }
    topMenu()
}



module.exports = initApp
