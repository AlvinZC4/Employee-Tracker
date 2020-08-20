const inquirer = require("inquirer");
const cTable = require("console.table");

const initApp = function (connection) {
  const getDept = () => {
    return new Promise((resolve, reject) => {
      connection.query("SELECT * FROM department", function (err, res) {
        if (err) reject(err);
        resolve(res);
      });
    });
  };
  const getRole = () => {
    return new Promise((resolve, reject) => {
      connection.query("SELECT * FROM role", function (err, res) {
        if (err) reject(err);
        resolve(res);
      });
    });
  };
  const getEmployee = () => {
    return new Promise((resolve, reject) => {
      connection.query("SELECT * FROM employee", function (err, res) {
        if (err) reject(err);
        resolve(res);
      });
    });
  };
  const topMenu = () => {
    inquirer
      .prompt([
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
            "Exit",
          ],
        },
      ])
      .then(function (ans) {
        // console.log("Here comes the response")
        if (ans.menu === "View Departments") {
          connection.query("SELECT * FROM department", function (err, res) {
            if (err) throw err;
            console.table(res);
            topMenu();
          });
        } else if (ans.menu === "View Roles") {
          connection.query("SELECT * FROM role", function (err, res) {
            if (err) throw err;
            console.table(res);
            topMenu();
          });
        } else if (ans.menu === "View Employees") {
          connection.query("SELECT * FROM employee", function (err, res) {
            if (err) throw err;
            console.table(res);
            topMenu();
          });
        } else if (ans.menu === "Add Department") {
          addDept();
        } else if (ans.menu === "Add Role") {
          addRole();
        } else if (ans.menu === "Add Employee") {
          addEmployee();
        } else if (ans.menu === "Update employee role") {
          updateEmployee();
        } else if (ans.menu === "Exit") {
          return;
        }
      });
  };
  const addDept = () => {
    console.log("Add a department");

    inquirer
      .prompt([
        {
          type: "input",
          name: "createDept",
          message: "What is the name of the department you want to add?",
        },
      ])
      .then(function (ans) {
        connection.query(
          "INSERT INTO department SET ?",
          { name: ans.createDept },
          function (err, res) {
            if (err) throw err;
            console.log(res.affectedRows + " departments inserted! \n");
            topMenu();
          }
        );
      });
  };
  const addRole = async () => {
    console.log("Add a role");

    // Use ansychronus function to create an array containing all department objects

    let depts = await getDept();

    // Map depts array to return an array containing only department names

    let deptNames = [];
    deptNames = depts.map((dept) => dept.name) 
    
    inquirer
      .prompt([
        {
          type: "input",
          name: "roleTitle",
          message: "What is the title of the role you want to add?",
        },
        {
          type: "input",
          name: "roleSalary",
          message: "What will the salary of the new role be?",
        },
        {
          type: "list",
          name: "roleDept",
          message: "Select a department for this role",
          choices: deptNames,
        },
      ])
      .then(function (ans) {
        let arryIndex = deptNames.indexOf(ans.roleDept);
        connection.query(
          "INSERT INTO role SET ?",
          {
            title: ans.roleTitle,
            salary: ans.roleSalary,
            department_id: depts[arryIndex].id,
          },
          function (err, res) {
            if (err) throw err;
            console.log(res.affectedRows + " roles inserted! \n");
            topMenu();
          }
        );
      });
  };
  const addEmployee = async () => {
    console.log("Add an employee");

    // Create an array using an asynchronus function that will contain all role objects

    let roles = await getRole();

    // Map roles array to create the roleNames array containing only role tiles

    let roleNames = [];
    roleNames = roles.map((role) => role.title)

    // Create an array using an ansynchronus function that will contain all employee objects

    let allEmployees = await getEmployee();

    // Filter roles array to return only manager roles into the managerRoles array

    let managerRoles = [];
    managerRoles = roles.filter((role) => role.title.toLowerCase().includes("manager"))

    // Filter through allEmployees array to return only employees who are managers; accomplished by using for loop to check if
    // role_id property of each employee matches the id property of any of the roles in the managerRoles array.

    let allManagers = [];
    allManagers = allEmployees.filter((employee => {
      for (let j = 0; j < managerRoles.length; j++) {
        if (employee.role_id === managerRoles[j].id) {
          return employee
        }
      }
    }))

    // Map allManagers array to return an array that contains first and last name of each manager.

    let managerNames = [];
    managerNames = allManagers.map((manager) => manager.first_name + " " + manager.last_name)

    // Push an additional option that allows for the new employee not to have a manager.

    managerNames.push("This employee will not have a manager");

    inquirer
      .prompt([
        {
          type: "input",
          name: "firstName",
          message: "What is the first name of the new employee?",
        },
        {
          type: "input",
          name: "lastName",
          message: "What is the last name of the new employee?",
        },
        {
          type: "list",
          name: "roleId",
          message: "Select a role for the new employee will be assigned to",
          choices: roleNames,
        },
        {
          type: "list",
          name: "managerId",
          message: "Select a manager for this employee",
          choices: managerNames,
        },
      ])
      .then(function (ans) {

        // Use the user response from inquirer to find the index of the string in the roleNames array that was used to
        // generate the list of choices in inquirer

        let roleIndex = roleNames.indexOf(ans.roleId);

        // Same as above, but from the managerId response in inquirer for the managerNames array

        let managerIndex = managerNames.indexOf(ans.managerId);

        // If the user selected for the new employee to not have a manager then the value we return to mysql needs to be undefined

        let managerIdAnswer;
        if (ans.managerId === "This employee will not have a manager") {
          managerIdAnswer = undefined;
        } else {
          managerIdAnswer = allManagers[managerIndex].id;
        }

        connection.query(
          "INSERT INTO employee SET ?",
          {
            first_name: ans.firstName,
            last_name: ans.lastName,
            role_id: roles[roleIndex].id,
            manager_id: managerIdAnswer,
          },
          function (err, res) {
            if (err) throw err;
            console.log(res.affectedRows + " employees inserted! \n");
            topMenu();
          }
        );
      });
  };
  const updateEmployee = async () => {
    console.log("update an employee")

    // Create an array using an asynchronus function that will contain all role objects

    let roles = await getRole();

    // Map roles array to create the roleNames array containing only role tiles

    let roleNames = [];
    roleNames = roles.map((role) => role.title)

    // Create an array using an ansynchronus function that will contain all employee objects

    let allEmployees = await getEmployee();

    // Map allEmployees array to create an array containing first and last name of all employees

    let allEmployeeNames = []
    allEmployeeNames = allEmployees.map((employee) => employee.first_name + " " + employee.last_name)

    // Filter roles array to return only manager roles into the managerRoles array

    let managerRoles = [];
    managerRoles = roles.filter((role) => role.title.toLowerCase().includes("manager"))

    // Filter through allEmployees array to return only employees who are managers; accomplished by using for loop to check if
    // role_id property of each employee matches the id property of any of the roles in the managerRoles array.

    let allManagers = [];
    allManagers = allEmployees.filter((employee => {
      for (let j = 0; j < managerRoles.length; j++) {
        if (employee.role_id === managerRoles[j].id) {
          return employee
        }
      }
    }))

    // Map allManagers array to return an array that contains first and last name of each manager.

    let managerNames = [];
    managerNames = allManagers.map((manager) => manager.first_name + " " + manager.last_name)

    // Push an additional option that allows for the new employee not to have a manager.

    managerNames.push("This employee will not have a manager");
    

    inquirer
      .prompt([
        {
          type: "list",
          name: "employeeId",
          message: "Select the employee whose role you wish to update",
          choices: allEmployeeNames
        },
        {
          type: "list",
          name: "roleId",
          message: "Select this employee's new role",
          choices: roleNames
        },
        {
          type: "list",
          name: "managerId",
          message: "Select the employee's new manager",
          choices: managerNames
        },
      ])
      .then(function (ans) {

        employeeIndex = allEmployeeNames.indexOf(ans.employeeId)
        roleIndex = roleNames.indexOf(ans.roleId)
        managerIndex = managerNames.indexOf(ans.managerId)

        // If the user selected for the new employee to not have a manager then the value we return to mysql needs to be undefined

        let managerIdAnswer;
        if (ans.managerId === "This employee will not have a manager") {
          managerIdAnswer = undefined;
        } else {
          managerIdAnswer = allManagers[managerIndex].id;
        }
        connection.query(
          "UPDATE employee SET ? WHERE ?",
          [
            {
              role_id: roles[roleIndex].id,
              manager_id: managerIdAnswer,
            },
            {
              id: allEmployees[employeeIndex].id,
            },
          ],
          function (err, res) {
            if (err) throw err;
            console.log(res.affectedRows + " employee updated! \n");
            topMenu();
          }
        );
      });
  };

  topMenu();
};

module.exports = initApp;


