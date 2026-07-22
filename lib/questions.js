import inquirer from "inquirer";

export default async function questions() {
  return await inquirer.prompt([
    {
      type: "input",
      name: "projectName",
      message: "Project name:",
      default: "my-gbit-app",
    },
    {
      type: "list",
      name: "backend",
      message: "Choose your backend:",
      choices: [
        { name: "Node.js — Express + Prisma + Docker (default)", value: "node" },
        { name: "Go — Fiber + GORM + Docker", value: "go" },
      ],
    },
  ]);
}
