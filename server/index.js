import express from 'express';
import session from 'express-session';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const dataDirectory = path.join(root, 'data');
const dataPath = path.join(dataDirectory, 'store.json');
const isProduction = process.env.NODE_ENV === 'production';
const sessionSecret = process.env.SESSION_SECRET;
if (isProduction && !sessionSecret) throw new Error('SESSION_SECRET must be set in production.');

mkdirSync(dataDirectory, { recursive: true });
if (!existsSync(dataPath)) writeFileSync(dataPath, JSON.stringify({ users: [], moods: [], appointments: [] }, null, 2));

function readStore() {
  return JSON.parse(readFileSync(dataPath, 'utf8'));
}

function updateStore(mutator) {
  const store = readStore();
  const result = mutator(store);
  writeFileSync(dataPath, JSON.stringify(store, null, 2));
  return result;
}

function publicUser(user) {
  return { id: user.id, name: user.name, guest: user.guest, createdAt: user.createdAt };
}

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '20kb' }));
app.use(session({
  name: 'mindbridge.sid',
  secret: sessionSecret || 'local-development-secret-change-before-deploying',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax', secure: isProduction, maxAge: 1000 * 60 * 60 * 24 * 7 },
}));

function requireUser(request, response, next) {
  const user = readStore().users.find((item) => item.id === request.session.userId);
  if (!user) return response.status(401).json({ error: 'Please sign in to continue.' });
  request.user = user;
  next();
}

app.get('/api/health', (_request, response) => response.json({ status: 'ok' }));

app.get('/api/me', (request, response) => {
  const user = readStore().users.find((item) => item.id === request.session.userId);
  response.json({ user: user ? publicUser(user) : null });
});

app.post('/api/auth/guest', (request, response) => {
  const names = ['River', 'Sage', 'Sky', 'Rowan', 'Avery', 'Indigo'];
  const user = { id: randomUUID(), name: names[Math.floor(Math.random() * names.length)], guest: true, createdAt: new Date().toISOString() };
  updateStore((store) => store.users.push(user));
  request.session.userId = user.id;
  response.status(201).json({ user: publicUser(user) });
});

app.post('/api/auth/register', async (request, response) => {
  const name = typeof request.body.name === 'string' ? request.body.name.trim().slice(0, 40) : '';
  const password = typeof request.body.password === 'string' ? request.body.password : '';
  if (name.length < 2 || password.length < 8) return response.status(400).json({ error: 'Choose a name and a password with at least 8 characters.' });
  const store = readStore();
  if (store.users.some((user) => user.name.toLowerCase() === name.toLowerCase() && !user.guest)) {
    return response.status(409).json({ error: 'That name is already in use. Try another one.' });
  }
  const user = { id: randomUUID(), name, passwordHash: await bcrypt.hash(password, 12), guest: false, createdAt: new Date().toISOString() };
  updateStore((next) => next.users.push(user));
  request.session.userId = user.id;
  response.status(201).json({ user: publicUser(user) });
});

app.post('/api/auth/login', async (request, response) => {
  const name = typeof request.body.name === 'string' ? request.body.name.trim() : '';
  const password = typeof request.body.password === 'string' ? request.body.password : '';
  const user = readStore().users.find((item) => !item.guest && item.name.toLowerCase() === name.toLowerCase());
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) return response.status(401).json({ error: 'Those details did not match. Please try again.' });
  request.session.userId = user.id;
  response.json({ user: publicUser(user) });
});

app.post('/api/auth/logout', (request, response) => {
  request.session.destroy(() => response.status(204).end());
});

app.delete('/api/account', requireUser, (request, response) => {
  updateStore((store) => {
    store.users = store.users.filter((item) => item.id !== request.user.id);
    store.moods = store.moods.filter((item) => item.userId !== request.user.id);
    store.appointments = store.appointments.filter((item) => item.userId !== request.user.id);
  });
  request.session.destroy(() => response.status(204).end());
});

app.get('/api/moods', requireUser, (request, response) => {
  const moods = readStore().moods.filter((item) => item.userId === request.user.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  response.json({ moods });
});

app.post('/api/moods', requireUser, (request, response) => {
  const allowed = ['Great', 'Good', 'Okay', 'Low', 'Tough'];
  const { mood, note } = request.body;
  if (!allowed.includes(mood) || (note !== undefined && typeof note !== 'string')) return response.status(400).json({ error: 'Please choose a mood to save your check-in.' });
  const entry = { id: randomUUID(), userId: request.user.id, mood, note: (note || '').trim().slice(0, 500), createdAt: new Date().toISOString() };
  updateStore((store) => store.moods.push(entry));
  response.status(201).json({ mood: entry });
});

app.get('/api/psychologists', (_request, response) => response.json({ psychologists: [
  { id: 'dr-mehta', name: 'Dr. Ananya Mehta', title: 'Clinical Psychologist', focus: 'Stress, anxiety, life transitions', languages: 'English, Hindi', format: 'Online', fee: 900, initials: 'AM', color: 'sage' },
  { id: 'dr-rao', name: 'Dr. Kiran Rao', title: 'Counselling Psychologist', focus: 'Relationships, self-esteem, burnout', languages: 'English, Telugu', format: 'Online', fee: 750, initials: 'KR', color: 'coral' },
  { id: 'dr-kapoor', name: 'Dr. Neel Kapoor', title: 'Clinical Psychologist', focus: 'Academic pressure, coping skills', languages: 'English, Hindi, Punjabi', format: 'Online', fee: 1000, initials: 'NK', color: 'blue' },
]}));

app.post('/api/appointments', requireUser, (request, response) => {
  const { psychologistId, date, consent } = request.body;
  const providers = ['dr-mehta', 'dr-rao', 'dr-kapoor'];
  if (!providers.includes(psychologistId) || typeof date !== 'string' || Number.isNaN(Date.parse(date))) return response.status(400).json({ error: 'Choose a provider and a valid date.' });
  if (consent !== true) return response.status(400).json({ error: 'Please confirm before sharing your chosen name and appointment request.' });
  const appointment = { id: randomUUID(), userId: request.user.id, psychologistId, date, createdAt: new Date().toISOString(), status: 'requested' };
  updateStore((store) => store.appointments.push(appointment));
  response.status(201).json({ appointment });
});

app.post('/api/support', requireUser, (request, response) => {
  const message = typeof request.body.message === 'string' ? request.body.message.trim().slice(0, 2000) : '';
  if (!message) return response.status(400).json({ error: 'Write a little about what is on your mind first.' });
  const urgent = /\b(kill myself|suicid(e|al)|end my life|hurt myself|self[- ]harm|can't go on|cannot go on)\b/i.test(message);
  const replies = [
    'Thank you for putting that into words. It sounds like there is a lot to hold right now. What feels most present for you in this moment?',
    'That makes sense. You do not have to solve it all at once. Would it help to name one small thing that might make the next hour gentler?',
    'I hear you. Sometimes just noticing what we are feeling can be a first step. Is there someone you trust who you might feel okay reaching out to?',
  ];
  response.json({ reply: urgent
    ? 'I’m really sorry this feels so heavy. I’m an AI support tool, not an emergency service. If you may be in immediate danger, call 112 in India or your local emergency number now, and try to stay with someone you trust. In India, Tele-MANAS is available at 14416. A qualified professional can help you through this.'
    : replies[Math.floor(Math.random() * replies.length)], urgent });
});

const clientPath = path.resolve(root, '../dist');
if (existsSync(clientPath)) {
  app.use(express.static(clientPath));
  app.get('/{*path}', (_request, response) => response.sendFile(path.join(clientPath, 'index.html')));
}

const port = Number(process.env.PORT) || 4000;
app.listen(port, () => console.log(`MindBridge API listening on http://localhost:${port}`));