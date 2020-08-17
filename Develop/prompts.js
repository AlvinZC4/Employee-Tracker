const inquirer = require("inquirer")
const cTable = require("console.table")
const { indexOf } = require("../Assets/pwd")



const initApp = function(connection) {

    const getDept = () => {
        return new Promise((resolve, reject) => {
            connection.query("SELECT * FROM department", function (err, res) {
                if (err) reject(err)
                resolve(res)
            })
        })

        
    }
    
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
                    "Update employee role",
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
                    // console.log(res[0].name)
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
            else if (ans.menu === "Update employee role") {
                updateEmployee()
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
                console.log(res.affectedRows + " departments inserted! \n")
                topMenu()
            })
        })
    }
    const addRole = async() => {
        console.log("Add a role")

        let depts = await getDept()
        let deptNames = []
        for (let i = 0; i < depts.length; i++) {
            deptNames.push(depts[i].name)
        }
        // console.log("Getting Dept Names", deptNames)

        inquirer.prompt([
            {
                type: "input",
                name: "roleTitle",
                message: "What is the title of the role you want to add?"
            },
            {
                type: "input",
                name: "roleSalary",
                message: "What will the salary of the new role be?"
            },
            {
                type: "list",
                name: "roleDept",
                message: "Select a department for this role",
                choices: deptNames
            }
        ]).then(function(ans) {
            let arryIndex = deptNames.indexOf(ans.roleDept)
            connection.query("INSERT INTO role SET ?", {title: ans.roleTitle, salary: ans.roleSalary, department_id: depts[arryIndex].id}, function(err, res) {
                if (err) throw err
                console.log(res.affectedRows + " roles inserted! \n")
                topMenu()
            })
        })
    }
    const addEmployee = () => {
        console.log("Add an employee")
        inquirer.prompt([
            {
                type: "input",
                name: "firstName",
                message: "What is the first name of the new employee?"
            },
            {
                type: "input",
                name: "lastName",
                message: "What is the last name of the new employee?"
            },
            {
                type: "input",
                name: "roleId",
                message: "Please provide the Role ID of the role the new employee will be assigned to"
            },
            {
                type: "input",
                name: "managerId",
                message: "Please provide the Employee ID of the new employee's manager"
            }
        ]).then(function(ans) {
            if (ans.managerId === "") {
                ans.managerId = undefined
            }
            connection.query("INSERT INTO employee SET ?", {
                first_name: ans.firstName, 
                last_name: ans.lastName, 
                role_id: ans.roleId, 
                manager_id: ans.managerId
            }, 
            function(err, res) {
                if (err) throw err
                console.log(res.affectedRows + " employees inserted! \n")
                topMenu()
            })
        })
    }
    const updateEmployee = () => {
        inquirer.prompt([
            {
                type: "input",
                name: "employeeId",
                message: "Enter the ID of the employee whose role you wish to update"
            },
            {
                type: "input",
                name: "roleId",
                message: "Please enter the ID for the role you wish to move the employee to"
            },
            {
                type: "input",
                name: "managerId",
                message: "Please enter the ID of the employee's new manager"
            }
        ]).then(function(ans) {
            if (ans.managerId === "") {
                ans.managerId = undefined
            }
            connection.query("UPDATE employee SET ? WHERE ?", [
                    {
                        role_id: ans.roleId,
                        manager_id: ans.managerId
                    },
                    {
                        id: ans.employeeId
                    }
                ], function(err, res) {
                    if (err) throw err
                    console.log(res.affectedRows + " employee updated! \n")
                    topMenu()
            })
        })
    }
    
    topMenu()
}



module.exports = initApp
