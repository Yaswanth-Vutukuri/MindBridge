import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft, ArrowRight, ArrowUpRight, Check, CircleHelp, Clock3, Compass, Heart, Home,
  Leaf, LockKeyhole, LogOut, MessageCircle, MoreHorizontal, Send, Settings2, ShieldCheck,
  Sparkles, Sun, Trash2, Wind, X,
} from 'lucide-react';

const moods = [
  { label: 'Great', face: '✳', color: 'mood-great' },
  { label: 'Good', face: '☺', color: 'mood-good' },
  { label: 'Okay', face: '◡', color: 'mood-okay' },
  { label: 'Low', face: '⌢', color: 'mood-low' },
  { label: 'Tough', face: '☂', color: 'mood-tough' },
];

const activities = [
  { id: 'breathing', title: 'A softer breath', kind: 'Breathing', duration: '3 min', icon: Wind, tint: 'mint', text: 'Follow a gentle pace and let your shoulders drop.' },
  { id: 'grounding', title: 'Come back to now', kind: 'Grounding', duration: '5 min', icon: Compass, tint: 'peach', text: 'A small 5–4–3–2–1 check-in with your senses.' },
  { id: 'gratitude', title: 'A small good thing', kind: 'Journaling', duration: '4 min', icon: Sun, tint: 'blue', text: 'Notice one thing that made today a little lighter.' },
];

async function api(url, options = {}) {
  const response = await fetch(url, { credentials: 'include', ...options, headers: { 'Content-Type': 'application/json', ...options.headers } });
  if (response.status === 204) return null;
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Something went wrong. Please try again.');
  return data;
}

function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState('welcome');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      const { user } = await api(`/api/auth/${mode}`, { method: 'POST', body: JSON.stringify({ name, password }) });
      onLogin(user);
    } catch (issue) { setError(issue.message); }
    finally { setBusy(false); }
  }

  async function guest() {
    setBusy(true);
    try { onLogin((await api('/api/auth/guest', { method: 'POST', body: '{}' })).user); }
    catch (issue) { setError(issue.message); }
    finally { setBusy(false); }
  }

  return <main className="auth-page">
    <div className="auth-art" aria-hidden="true"><div className="art-ring ring-one" /><div className="art-ring ring-two" /><div className="art-leaf"><Leaf size={72} strokeWidth={1} /></div><div className="art-note">You can take<br />this one moment<br />at a time.</div><span className="art-dot dot-one" /><span className="art-dot dot-two" /></div>
    <section className="auth-panel">
      <a className="brand" href="#home"><span className="brand-mark"><Leaf size={18} /></span><span>mindbridge</span></a>
      <div className="auth-copy">
        <p className="eyebrow">A LITTLE SPACE FOR YOU</p>
        <h1>{mode === 'welcome' ? 'Somewhere to land.' : mode === 'register' ? 'Create your account.' : 'Welcome back.'}</h1>
        <p className="auth-description">A quiet place to check in, find your footing, and take things at your own pace.</p>
      </div>
      {mode === 'welcome' ? <div className="auth-actions">
        <button className="button button-primary button-wide" onClick={() => setMode('register')}>Sign up <ArrowRight size={17} /></button>
        <button className="button button-light button-wide" onClick={() => setMode('login')}>Sign in <ArrowUpRight size={16} /></button>
        <div className="auth-divider"><span>or</span></div>
        <button className="guest-button" onClick={guest} disabled={busy}><span className="guest-icon"><Sparkles size={16} /></span>Explore without an account</button>
        <p className="auth-footnote"><LockKeyhole size={13} /> Guest mode uses a random name. Your data stays on this device.</p>
      </div> : <form className="auth-form" onSubmit={submit}>
        <label>Choose a name<input value={name} onChange={(event) => setName(event.target.value)} placeholder="A name just for you" autoComplete="username" required minLength={2} maxLength={40} /></label>
        <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required minLength={8} /></label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="button button-primary button-wide" disabled={busy}>{busy ? 'One moment…' : mode === 'register' ? 'Sign up' : 'Sign in'} <ArrowRight size={17} /></button>
        <button type="button" className="text-button" onClick={() => { setMode(mode === 'register' ? 'login' : 'register'); setError(''); }}>{mode === 'register' ? 'Already have a space? Sign in' : 'New here? Create a space'}</button>
        <button type="button" className="text-button back-button" onClick={() => setMode('welcome')}><ArrowLeft size={14} /> Back</button>
      </form>}
      <p className="auth-legal">MindBridge is a wellness companion, not a therapist or emergency service.</p>
    </section>
  </main>;
}

function Sidebar({ active, setActive, user, onLogout, openMenu, setOpenMenu }) {
  const links = [
    { id: 'home', title: 'Your space', icon: Sun },
    { id: 'support', title: 'Talk it out', icon: MessageCircle },
    { id: 'activities', title: 'Small practices', icon: Wind },
    { id: 'people', title: 'Find a person', icon: Heart },
  ];
  return <aside className="sidebar">
    <a className="brand" href="#home" onClick={(event) => { event.preventDefault(); setActive('home'); }}><span className="brand-mark"><Leaf size={18} /></span><span>mindbridge</span></a>
    <p className="nav-caption">YOUR SPACE</p>
    <nav className="primary-nav" aria-label="Main navigation">{links.map(({ id, title, icon: Icon }) => <button key={id} className={`nav-link ${active === id ? 'selected' : ''}`} onClick={() => setActive(id)}><Icon size={18} strokeWidth={1.8} /><span>{title}</span>{id === 'support' && <span className="nav-new" />}</button>)}</nav>
    <div className="sidebar-note"><div className="note-icon"><ShieldCheck size={18} /></div><p>Your space is private</p><span>Your check-ins are only for you.</span><button onClick={() => setActive('privacy')}>Privacy settings <ArrowRight size={13} /></button></div>
    <div className="sidebar-bottom">
      <div className="profile-row"><div className="avatar avatar-small">{user.name.slice(0, 1).toUpperCase()}</div><div className="profile-names"><strong>{user.name}</strong><span>{user.guest ? 'Guest space' : 'Personal space'}</span></div><button className="icon-button profile-menu-button" aria-label="Profile options" onClick={() => setOpenMenu(!openMenu)}><MoreHorizontal size={19} /></button></div>
      {openMenu && <div className="profile-menu"><button onClick={() => setActive('privacy')}><Settings2 size={15} /> Settings</button><button onClick={onLogout}><LogOut size={15} /> Sign out</button></div>}
    </div>
  </aside>;
}

function MoodCard({ savedMood, onSave }) {
  const [selected, setSelected] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  async function save() {
    if (!selected) return;
    setBusy(true);
    try { await onSave(selected, note); setNote(''); setSelected(''); }
    finally { setBusy(false); }
  }
  return <section className="panel mood-panel">
    <div className="panel-heading"><div><p className="eyebrow">A MOMENT FOR YOU</p><h2>How are you, really?</h2></div><span className="heading-sparkle"><Sparkles size={17} /></span></div>
    {savedMood ? <div className="mood-saved"><span className={`saved-face ${moods.find((mood) => mood.label === savedMood)?.color}`}>{moods.find((mood) => mood.label === savedMood)?.face}</span><div><strong>Today, you feel {savedMood.toLowerCase()}.</strong><span>Thank you for checking in with yourself.</span></div><Check size={18} /></div> : <>
      <div className="mood-options" role="group" aria-label="Choose today's mood">{moods.map((mood) => <button key={mood.label} onClick={() => setSelected(mood.label)} className={`mood-choice ${selected === mood.label ? 'active' : ''}`} aria-pressed={selected === mood.label}><span className={`mood-face ${mood.color}`}>{mood.face}</span><span>{mood.label}</span></button>)}</div>
      {selected && <div className="mood-note-row"><input aria-label="Optional note" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Anything you want to remember? (optional)" maxLength={500} /><button className="button button-primary button-compact" onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Save check-in'} <ArrowRight size={15} /></button></div>}
      <p className="quiet-hint"><LockKeyhole size={12} /> Just for you. You can leave a note, or not.</p>
    </>}
  </section>;
}

function WeekCard({ history }) {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const now = new Date();
  const day = (now.getDay() + 6) % 7;
  const entries = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(now);
    date.setDate(now.getDate() - day + index);
    const entry = history.find((item) => new Date(item.createdAt).toDateString() === date.toDateString());
    return { day: days[index], date: date.getDate(), today: index === day, mood: entry?.mood };
  });
  return <section className="panel week-panel">
    <div className="panel-heading"><div><p className="eyebrow">YOUR RHYTHM</p><h2>A week at a glance</h2></div><button className="icon-button" aria-label="Mood history"><ArrowUpRight size={17} /></button></div>
    <div className="week-dots">{entries.map((entry, index) => <div className="week-day" key={`${entry.day}-${index}`}><span>{entry.day}</span><div className={`day-dot ${entry.mood ? 'checked-in' : ''} ${entry.today ? 'today' : ''}`}>{entry.mood ? moods.find((mood) => mood.label === entry.mood)?.face : entry.date}</div><span className="day-date">{entry.date === now.getDate() ? 'Today' : ''}</span></div>)}</div>
    <p className="week-caption">{history.length ? `${history.length} check-in${history.length === 1 ? '' : 's'} so far. Every feeling belongs here.` : 'No patterns to chase. Just noticing, when you feel like it.'}</p>
  </section>;
}

function ChatView() {
  const [messages, setMessages] = useState([{ role: 'assistant', text: 'Hi, I’m here with you. You can share as much or as little as you like. What’s on your mind today?' }]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef(null);
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  async function send(event) {
    event.preventDefault();
    const message = text.trim();
    if (!message || busy) return;
    setText('');
    setMessages((items) => [...items, { role: 'user', text: message }]);
    setBusy(true);
    try {
      const result = await api('/api/support', { method: 'POST', body: JSON.stringify({ message }) });
      setMessages((items) => [...items, { role: 'assistant', text: result.reply, urgent: result.urgent }]);
    } catch (error) { setMessages((items) => [...items, { role: 'assistant', text: error.message }]); }
    finally { setBusy(false); }
  }
  return <div className="content-view chat-view">
    <div className="page-heading"><div><p className="eyebrow">A NON-JUDGMENTAL SPACE</p><h1>Talk it out</h1><p>You don’t need the perfect words. Start wherever you are.</p></div><div className="ai-label"><span className="ai-live" /> AI companion</div></div>
    <div className="chat-shell"><div className="chat-topline"><div className="assistant-avatar"><Sparkles size={18} /></div><div><strong>A gentle check-in</strong><span>Here to listen, not to diagnose</span></div><button className="icon-button" aria-label="More chat options" onClick={() => setMessages([{ role: 'assistant', text: 'Hi, I’m here with you. You can share as much or as little as you like. What’s on your mind today?' }])}><MoreHorizontal size={20} /></button></div>
      <div className="message-list">{messages.map((message, index) => <div className={`message-row ${message.role}`} key={index}><div className="message-avatar">{message.role === 'assistant' ? <Sparkles size={14} /> : 'Y'}</div><div className={`message-bubble ${message.urgent ? 'urgent-message' : ''}`}>{message.text}{message.urgent && <p className="urgent-callout">India emergency services: <a href="tel:112">112</a> · Tele-MANAS: <a href="tel:14416">14416</a></p>}</div></div>)}{busy && <div className="typing-indicator">Finding a thoughtful response…</div>}<div ref={scrollRef} /></div>
      <form className="chat-composer" onSubmit={send}><input aria-label="Your message" placeholder="Write what’s on your mind…" value={text} onChange={(event) => setText(event.target.value)} maxLength={2000} /><button className="send-button" aria-label="Send message" disabled={!text.trim() || busy}><Send size={17} /></button></form>
      <p className="chat-disclaimer"><ShieldCheck size={13} /> This demo uses scripted responses. It isn’t a therapist or emergency service.</p>
    </div>
  </div>;
}

function ActivityView() {
  const [active, setActive] = useState(null);
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  useEffect(() => {
    if (!running) return undefined;
    const timer = window.setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [running]);
  function start(activity) { setActive(activity); setSeconds(0); setRunning(true); }
  return <div className="content-view">
    <div className="page-heading"><div><p className="eyebrow">GENTLE, NOT GRADED</p><h1>Small practices</h1><p>Pick something that feels doable. Stop whenever you like.</p></div><span className="heading-illustration"><Wind size={25} /></span></div>
    {active && <section className="practice-active"><div className="practice-breath"><div className="breath-orbit"><div className="breath-core"><Wind size={27} /></div></div></div><div className="practice-details"><p className="eyebrow">YOUR PRACTICE · {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}</p><h2>{active.title}</h2><p>{active.id === 'breathing' ? 'Breathe in slowly. Pause if it feels comfortable. Let your exhale be a little longer.' : active.text}</p><div className="practice-controls"><button className="button button-light" onClick={() => setRunning(!running)}>{running ? 'Pause' : 'Continue'}</button><button className="text-button" onClick={() => { setActive(null); setRunning(false); }}>Stop practice</button></div></div></section>}
    <div className="activity-grid">{activities.map(({ id, title, kind, duration, icon: Icon, tint, text }) => <article className="activity-card" key={id}><div className={`activity-icon ${tint}`}><Icon size={21} /></div><span className="activity-kind">{kind} <span>·</span> {duration}</span><h2>{title}</h2><p>{text}</p><button className="activity-start" onClick={() => start({ id, title, text })}>Begin gently <ArrowRight size={15} /></button></article>)}</div>
    <div className="activity-footnote"><CircleHelp size={15} /><span>These are optional self-care practices, not treatment. Skip anything that doesn’t feel right.</span></div>
  </div>;
}

function PeopleView() {
  const [people, setPeople] = useState([]);
  const [requested, setRequested] = useState('');
  const [error, setError] = useState('');
  const [consent, setConsent] = useState(false);
  useEffect(() => { api('/api/psychologists').then((data) => setPeople(data.psychologists)).catch((issue) => setError(issue.message)); }, []);
  async function requestSession(id) {
    setError('');
    if (!consent) { setError('Please check the consent box before requesting.'); return; }
    try {
      await api('/api/appointments', { method: 'POST', body: JSON.stringify({ psychologistId: id, date: new Date(Date.now() + 86400000).toISOString(), consent: true }) });
      setRequested(id);
    } catch (issue) { setError(issue.message); }
  }
  return <div className="content-view">
    <div className="page-heading"><div><p className="eyebrow">SUPPORT, AT YOUR PACE</p><h1>Find a person</h1><p>Looking for professional support is a brave, ordinary thing.</p></div><div className="verified-note"><ShieldCheck size={17} /><span>Profiles are illustrative<br />for this demo</span></div></div>
    <div className="directory-notice"><LockKeyhole size={17} /><p><strong>Your conversations stay yours.</strong> Nothing from your AI chat is shared with a provider. We only send your chosen profile name and appointment request after you give consent.</p></div>
    <label className="consent-line"><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} /><span>I consent to share my chosen profile name and this appointment request with the selected provider.</span></label>
    {error && <p className="form-error" role="alert">{error}</p>}
    <div className="people-list">{people.map((person) => <article className="person-row" key={person.id}><div className={`person-avatar ${person.color}`}>{person.initials}</div><div className="person-info"><div className="person-title"><h2>{person.name}</h2><span className="verification-label"><ShieldCheck size={13} /> Demo profile</span></div><p>{person.title}</p><span className="person-focus">{person.focus}</span><div className="person-meta"><span><MessageCircle size={13} /> {person.languages}</span><span><Clock3 size={13} /> {person.format}</span></div></div><div className="person-action"><span>₹{person.fee}<small> / session</small></span><button className={`button ${requested === person.id ? 'button-success' : 'button-light'}`} onClick={() => requestSession(person.id)}>{requested === person.id ? <><Check size={15} /> Requested</> : <>Request a session <ArrowRight size={15} /></>}</button></div></article>)}</div>
    <p className="directory-disclaimer">Provider profiles and prices shown here are sample data and have not been independently verified. Confirm credentials and availability before seeking care.</p>
  </div>;
}

function PrivacyView({ user, onDelete }) {
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  async function erase() {
    setBusy(true);
    try { await api('/api/account', { method: 'DELETE' }); onDelete(); }
    catch { setBusy(false); }
  }
  return <div className="content-view">
    <div className="page-heading"><div><p className="eyebrow">YOUR DATA, YOUR CALL</p><h1>Privacy & settings</h1><p>A few clear choices about what stays in your space.</p></div><span className="heading-illustration"><LockKeyhole size={24} /></span></div>
    <section className="settings-section"><div className="settings-icon"><ShieldCheck size={19} /></div><div className="settings-copy"><h2>Your private space</h2><p>{user.guest ? 'You’re using a guest identity. Your data is stored locally for this demo and is not shared with a provider.' : 'Your profile uses a name you chose. Your mood notes and appointment requests are stored in the local demo database.'}</p></div><span className="settings-status"><span /> Private</span></section>
    <section className="settings-section"><div className="settings-icon"><MessageCircle size={19} /></div><div className="settings-copy"><h2>AI conversation history</h2><p>Chat messages are not saved to your account. Refreshing or leaving this page clears the conversation.</p></div><span className="settings-status">Not stored</span></section>
    <section className="settings-section danger-section"><div className="settings-icon danger-icon"><Trash2 size={18} /></div><div className="settings-copy"><h2>Delete your space</h2><p>This permanently removes your profile, mood check-ins, and appointment requests from the local database.</p></div>{!confirm ? <button className="button button-danger" onClick={() => setConfirm(true)}>Delete data</button> : <div className="confirm-actions"><button className="text-button" onClick={() => setConfirm(false)}>Cancel</button><button className="button button-danger" onClick={erase} disabled={busy}>{busy ? 'Deleting…' : 'Confirm delete'}</button></div>}</section>
    <p className="settings-caveat">This is a local demonstration, not a production health service. Before real-world use, configure encrypted hosting, durable session storage, a documented retention policy, and a professionally reviewed safety workflow.</p>
  </div>;
}

function HomeView({ user, history, onMood, setActive }) {
  const todayMood = history.find((item) => new Date(item.createdAt).toDateString() === new Date().toDateString());
  const firstName = user.name.split(' ')[0];
  return <div className="content-view home-view">
    <div className="welcome-row"><div><p className="date-line">{new Intl.DateTimeFormat('en', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date()).toUpperCase()}</p><h1>Good to have you here, <span>{firstName}.</span></h1><p>There’s no right way to feel today. Just start where you are.</p></div><div className="welcome-art" aria-hidden="true"><div className="sun-disc" /><div className="hill hill-back" /><div className="hill hill-front" /><span className="welcome-star star-a">✳</span><span className="welcome-star star-b">·</span></div></div>
    <div className="home-grid"><div className="home-main"><MoodCard savedMood={todayMood?.mood} onSave={onMood} /><WeekCard history={history} /></div><div className="home-side"><section className="support-card"><div className="support-art"><div className="support-blob"><MessageCircle size={25} /></div><span>✳</span></div><p className="eyebrow">WHEN WORDS ARE HARD</p><h2>Say a little.<br />Or say nothing yet.</h2><p>Your AI companion can help you untangle what’s on your mind.</p><button className="button button-on-dark" onClick={() => setActive('support')}>Start a conversation <ArrowRight size={15} /></button><span className="support-private"><LockKeyhole size={12} /> Private by default</span></section><section className="suggestion-card"><div className="suggestion-icon"><Wind size={17} /></div><div><p className="eyebrow">A SMALL SUGGESTION</p><strong>Take one slower breath.</strong><span>No need to change anything else.</span></div><button className="icon-button" aria-label="Explore breathing practice" onClick={() => setActive('activities')}><ArrowRight size={17} /></button></section></div></div>
    <div className="home-bottom"><button onClick={() => setActive('activities')}><span><Wind size={17} /></span><div><strong>Make a little room</strong><small>Explore guided practices</small></div><ArrowRight size={16} /></button><button onClick={() => setActive('people')}><span><Heart size={17} /></span><div><strong>Talk to a person</strong><small>Find professional support</small></div><ArrowRight size={16} /></button><div className="emergency-note"><ShieldCheck size={16} /><span>If you’re in immediate danger, call 112 or your local emergency number.</span></div></div>
  </div>;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [active, setActive] = useState('home');
  const [history, setHistory] = useState([]);
  const [profileMenu, setProfileMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    api('/api/me').then(({ user: current }) => setUser(current)).catch(() => {}).finally(() => setLoading(false));
  }, []);
  useEffect(() => {
    if (!user) return;
    api('/api/moods').then(({ moods: entries }) => setHistory(entries)).catch(() => {});
  }, [user]);

  async function saveMood(mood, note) {
    try {
      const { mood: entry } = await api('/api/moods', { method: 'POST', body: JSON.stringify({ mood, note }) });
      setHistory((items) => [entry, ...items]);
    } catch (error) { setNotice(error.message); }
  }
  async function logout() {
    await api('/api/auth/logout', { method: 'POST', body: '{}' });
    setUser(null); setHistory([]); setActive('home'); setProfileMenu(false);
  }
  function deleted() { setUser(null); setHistory([]); setActive('home'); }

  if (loading) return <div className="loading-screen"><span className="loading-mark"><Leaf size={19} /></span><span>Making a little space…</span></div>;
  if (!user) return <AuthScreen onLogin={setUser} />;

  const pageTitles = { home: 'Your space', support: 'Talk it out', activities: 'Small practices', people: 'Find a person', privacy: 'Privacy & settings' };
  return <div className="app-shell" onClick={() => profileMenu && setProfileMenu(false)}>
    <Sidebar active={active} setActive={setActive} user={user} onLogout={logout} openMenu={profileMenu} setOpenMenu={(value) => { setProfileMenu(value); }} />
    <main className="main-area"><header className="topbar"><div className="mobile-brand"><span className="brand-mark"><Leaf size={17} /></span>mindbridge</div><div className="breadcrumb"><span>Your space</span><ArrowRight size={13} /><strong>{pageTitles[active]}</strong></div><div className="topbar-right"><span className="privacy-pill"><LockKeyhole size={13} /> Your space is private</span><button className="top-avatar" aria-label="Open privacy settings" onClick={() => setActive('privacy')}>{user.name.slice(0, 1).toUpperCase()}</button></div></header>
      {notice && <div className="toast" role="status">{notice}<button onClick={() => setNotice('')} aria-label="Dismiss"><X size={15} /></button></div>}
      {active === 'home' && <HomeView user={user} history={history} onMood={saveMood} setActive={setActive} />}
      {active === 'support' && <ChatView />}
      {active === 'activities' && <ActivityView />}
      {active === 'people' && <PeopleView />}
      {active === 'privacy' && <PrivacyView user={user} onDelete={deleted} />}
      <footer className="app-footer"><span>MindBridge is here to support your wellbeing, not replace professional care.</span><button onClick={() => setActive('privacy')}>Privacy & safety <ArrowUpRight size={12} /></button></footer>
    </main>
    <nav className="mobile-nav" aria-label="Main navigation">{[
      { id: 'home', title: 'Home', icon: Home },
      { id: 'support', title: 'Support', icon: MessageCircle },
      { id: 'activities', title: 'Practices', icon: Wind },
      { id: 'people', title: 'People', icon: Heart },
      { id: 'privacy', title: 'Privacy', icon: LockKeyhole },
    ].map(({ id, title, icon: Icon }) => <button key={id} className={active === id ? 'active' : ''} aria-current={active === id ? 'page' : undefined} onClick={() => setActive(id)}><Icon size={17} /><span>{title}</span></button>)}</nav>
  </div>;
}