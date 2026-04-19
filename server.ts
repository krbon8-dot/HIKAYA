import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { readUsers, writeUsers, readProjects, writeProjects } from './src/lib/serverDb.js';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-dev-only';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '3gb' }));

  // Middleware to verify JWT
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Access token required' });

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.status(403).json({ error: 'Invalid or expired token' });
      req.user = user;
      next();
    });
  };

  // --- Auth APIs ---

  app.post('/api/auth/signup', async (req, res) => {
    try {
      const { email, password, name } = req.body;
      const users = await readUsers();

      if (users.find((u: any) => u.email === email)) {
        return res.status(400).json({ error: 'هذا البريد الإلكتروني مسجل بالفعل' });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const newUser = { id: Date.now().toString(), email, passwordHash, name };
      users.push(newUser);
      await writeUsers(users);

      const token = jwt.sign({ id: newUser.id, email: newUser.email, name: newUser.name }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ token, user: { id: newUser.id, email: newUser.email, name: newUser.name } });
    } catch (err) {
      res.status(500).json({ error: 'فشل في إنشاء الحساب' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      const users = await readUsers();
      const user = users.find((u: any) => u.email === email);

      if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
        return res.status(401).json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
      }

      const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
    } catch (err) {
      res.status(500).json({ error: 'فشل في تسجيل الدخول' });
    }
  });

  // --- Projects APIs ---

  app.get('/api/projects', authenticateToken, async (req: any, res) => {
    try {
      const projects = await readProjects();
      const userProjects = projects.filter((p: any) => p.userId === req.user.id);
      res.json(userProjects);
    } catch (err) {
      res.status(500).json({ error: 'فشل في تحميل المشاريع' });
    }
  });

  app.post('/api/projects', authenticateToken, async (req: any, res) => {
    try {
      const { name, data } = req.body;
      const projects = await readProjects();
      const newProject = {
        id: data.id || Date.now().toString(),
        userId: req.user.id,
        name,
        data,
        updatedAt: new Date().toISOString()
      };
      
      const existingIdx = projects.findIndex((p: any) => p.id === newProject.id && p.userId === req.user.id);
      if (existingIdx >= 0) {
        projects[existingIdx] = newProject;
      } else {
        projects.push(newProject);
      }
      
      await writeProjects(projects);
      res.json(newProject);
    } catch (err) {
      res.status(500).json({ error: 'فشل في حفظ المشروع' });
    }
  });

  app.delete('/api/projects/:id', authenticateToken, async (req: any, res) => {
    try {
      const { id } = req.params;
      let projects = await readProjects();
      projects = projects.filter((p: any) => !(p.id === id && p.userId === req.user.id));
      await writeProjects(projects);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'فشل في حذف المشروع' });
    }
  });

  // --- Vite Middleware ---

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
