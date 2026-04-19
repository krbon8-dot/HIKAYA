import fs from 'fs/promises';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DB_PATH, 'users.json');
const PROJECTS_FILE = path.join(DB_PATH, 'projects.json');

// Ensure data directory exists
async function ensureDb() {
  try {
    await fs.mkdir(DB_PATH, { recursive: true });
    try {
      await fs.access(USERS_FILE);
    } catch {
      await fs.writeFile(USERS_FILE, '[]');
    }
    try {
      await fs.access(PROJECTS_FILE);
    } catch {
      await fs.writeFile(PROJECTS_FILE, '[]');
    }
  } catch (err) {
    console.error('Error ensuring DB directory:', err);
  }
}

export async function readUsers() {
  await ensureDb();
  const data = await fs.readFile(USERS_FILE, 'utf-8');
  return JSON.parse(data);
}

export async function writeUsers(users: any[]) {
  await ensureDb();
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
}

export async function readProjects() {
  await ensureDb();
  const data = await fs.readFile(PROJECTS_FILE, 'utf-8');
  return JSON.parse(data);
}

export async function writeProjects(projects: any[]) {
  await ensureDb();
  await fs.writeFile(PROJECTS_FILE, JSON.stringify(projects, null, 2));
}
