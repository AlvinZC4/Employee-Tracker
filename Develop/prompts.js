const inquirer = require("inquirer")


const initApp = function(connection) {
    inquirer.prompt([
        {
            type: "list",
            name: "menu",
            message: "What would you like to do?",
            choices: [
                "View Departments",
                "Exit"
            ]
        }
    ]).then(function(ans) {
        console.log("Here comes the response")
        if (ans.menu === "View Departments") {
            console.log("Response was to view departments")
            
            connection.query("SELECT * FROM department", function (err, res) {
                if (err) throw err
                console.log(res)
            })
        }
    })
}



module.exports = initApp
