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
            // console.log(res[0].name)
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

    // Use ansychronus function to create an array containing department names to use as a list of possible choices in inquirer
    let depts = await getDept();
    let deptNames = [];
    for (let i = 0; i < depts.length; i++) {
      deptNames.push(depts[i].name);
    }

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

    // Use a for loop to create an array that contains only role titles by looping through the roles array
    let roleNames = [];
    for (let i = 0; i < roles.length; i++) {
      roleNames.push(roles[i].title);
    }

    // Create an array using an ansynchronus function that will contain all employee objects
    let allEmployees = await getEmployee();

    // Loop through roles array and find any role object where "manager" is in the title and push those roles into the managerRoles array. The managerRoles array only contains management roles.
    let managerRoles = [];
    for (let i = 0; i < roles.length; i++) {
      if (roles[i].title.toLowerCase().includes("manager")) {
        managerRoles.push(roles[i]);
      }
    }

    // Nested for loop; if the role_id property of an employee object is equal to the id property of any role object in the managerRoles array then push the employee object into the allManagers array. The allManagers array will only contain employees who are managers.
    let allManagers = [];
    for (let i = 0; i < allEmployees.length; i++) {
      for (let j = 0; j < managerRoles.length; j++) {
        if (allEmployees[i].role_id === managerRoles[j].id) {
          allManagers.push(allEmployees[i]);
        }
      }
    }

    // For loop that concatenates the first_name and last_name property of each employee object and pushes them into an array. This will be used to generate list of choices for the manager of the new employee that is being created.
    let managerNames = [];
    for (let i = 0; i < allManagers.length; i++) {
      let fullName = allManagers[i].first_name + " " + allManagers[i].last_name;
      managerNames.push(fullName);
    }

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

        // Use the user response from inquirer to find the index of the string in the roleNames array that was used to generate the list of choices in inquirer
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
  const updateEmployee = () => {
    inquirer
      .prompt([
        {
          type: "input",
          name: "employeeId",
          message: "Enter the ID of the employee whose role you wish to update",
        },
        {
          type: "input",
          name: "roleId",
          message:
            "Please enter the ID for the role you wish to move the employee to",
        },
        {
          type: "input",
          name: "managerId",
          message: "Please enter the ID of the employee's new manager",
        },
      ])
      .then(function (ans) {
        if (ans.managerId === "") {
          ans.managerId = undefined;
        }
        connection.query(
          "UPDATE employee SET ? WHERE ?",
          [
            {
              role_id: ans.roleId,
              manager_id: ans.managerId,
            },
            {
              id: ans.employeeId,
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
