import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import chalk from "chalk";
import questions from "./questions.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function createProject() {
  const answers = await questions();
  const root = path.join(process.cwd(), answers.projectName);
  const templatesRoot = path.join(__dirname, "..", "templates");

  if (fs.existsSync(root)) {
    console.log(chalk.red(`✖ A pasta "${answers.projectName}" já existe.`));
    return;
  }

  try {
    fs.mkdirSync(root, { recursive: true });

    // 1. Cria o frontend com Vite (React + TypeScript)
    // --no-interactive evita que o create-vite fique esperando respostas
    // (inclusive a pergunta "start now?", que travaria o script para sempre)
    console.log(chalk.cyan("\n→ Creating frontend (React + Vite + TypeScript)...\n"));
    execSync(
      `npm create vite@latest frontend -- --template react-ts --no-interactive`,
      { cwd: root, stdio: "inherit" }
    );

    const frontendPath = path.join(root, "frontend");

    // Aplica o App.tsx, App.css e services/ por cima do scaffold do Vite
    fs.copyFileSync(
      path.join(templatesRoot, "frontend", "src", "App.tsx"),
      path.join(frontendPath, "src", "App.tsx")
    );
    fs.copyFileSync(
      path.join(templatesRoot, "frontend", "src", "App.css"),
      path.join(frontendPath, "src", "App.css")
    );
    fs.mkdirSync(path.join(frontendPath, "src", "services"), { recursive: true });
    fs.cpSync(
      path.join(templatesRoot, "frontend", "src", "services"),
      path.join(frontendPath, "src", "services"),
      { recursive: true }
    );

    console.log(chalk.cyan("→ Installing frontend dependencies...\n"));
    execSync("npm install", { cwd: frontendPath, stdio: "inherit" });
    execSync("npm install axios", { cwd: frontendPath, stdio: "inherit" });

    // 2. Backend — escolhe o template certo conforme a resposta
    const backendTemplate = answers.backend === "go" ? "backend-go" : "backend-node";
    const backendLabel = answers.backend === "go" ? "Go + Fiber + GORM" : "Node.js + Express + Prisma";

    console.log(chalk.cyan(`→ Creating backend (${backendLabel} + Docker)...\n`));
    const backendPath = path.join(root, "backend");
    fs.cpSync(path.join(templatesRoot, backendTemplate), backendPath, {
      recursive: true,
    });

    // 3. docker-compose na raiz do projeto, orquestrando frontend + backend juntos
    const composeContent = fs
      .readFileSync(path.join(backendPath, "docker-compose.yml"), "utf-8")
      .replace("build: .", "build: ./backend");
    fs.writeFileSync(path.join(root, "docker-compose.yml"), composeContent);
    fs.rmSync(path.join(backendPath, "docker-compose.yml"));

    console.log("");
    console.log(chalk.green("✔ Project created!"));
    console.log("");
    console.log(chalk.green("Project:"), answers.projectName);
    console.log(chalk.cyan("Backend:"), backendLabel);
    console.log("");
    console.log(chalk.yellow("Next steps"));
    console.log("");
    console.log(`cd ${answers.projectName}`);
    console.log(`cp backend/.env.example backend/.env   # configure suas chaves`);
    console.log(`docker compose up --build              # sobe backend + banco de dados`);
    console.log(`cd frontend && npm run dev              # roda o frontend`);
    console.log("");
  } catch (error) {
    console.log("");
    console.log(chalk.red("✖ Error creating project."));
    console.log(error.message || error);
  }
}
