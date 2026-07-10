import { FormEvent, useEffect, useMemo, useState } from 'react';
import { BarChart3, Boxes, LayoutDashboard, LogOut, Moon, Plus, Search, Sun, TicketCheck } from 'lucide-react';

type View = 'dashboard' | 'tickets' | 'assets' | 'reports';
type Priority = 'Critical' | 'High' | 'Medium' | 'Low';
type Status = 'Open' | 'In Progress' | 'Resolved';

type Ticket = {
  id: number;
  title: string;
  requester: string;
  department: string;
  category: string;
  priority: Priority;
  status: Status;
  description: string;
};

type Asset = {
  id: string;
  name: string;
  owner: string;
  department: string;
  status: 'Healthy' | 'Needs attention' | 'Retiring soon';
};

const demoTickets: Ticket[] = [
  { id: 1048, title: 'VPN access fails after password reset', requester: 'Jordan Lee', department: 'Finance', category: 'Access', priority: 'High', status: 'Open', description: 'User cannot reconnect to the corporate VPN.' },
  { id: 1047, title: 'Laptop slows down during video calls', requester: 'Maya Patel', department: 'Sales', category: 'Hardware', priority: 'Medium', status: 'In Progress', description: 'High CPU usage during meetings.' },
  { id: 1046, title: 'Shared drive permissions needed', requester: 'Chris Morgan', department: 'Operations', category: 'Access', priority: 'Low', status: 'Resolved', description: 'Add employee to shared-drive group.' },
  { id: 1045, title: 'Suspicious sign-in notification', requester: 'Taylor Smith', department: 'Human Resources', category: 'Security', priority: 'Critical', status: 'In Progress', description: 'User received an unfamiliar sign-in alert.' },
  { id: 1044, title: 'Printer unavailable on third floor', requester: 'Avery Johnson', department: 'Operations', category: 'Hardware', priority: 'Medium', status: 'Open', description: 'Network printer is offline.' },
];

const demoAssets: Asset[] = [
  { id: 'LT-2041', name: 'Dell Latitude 7440', owner: 'Jordan Lee', department: 'Finance', status: 'Healthy' },
  { id: 'LT-1988', name: 'MacBook Pro 14', owner: 'Maya Patel', department: 'Sales', status: 'Healthy' },
  { id: 'WS-1142', name: 'Dell Precision 3660', owner: 'Chris Morgan', department: 'Operations', status: 'Needs attention' },
  { id: 'PH-0821', name: 'iPhone 15', owner: 'Taylor Smith', department: 'Human Resources', status: 'Healthy' },
  { id: 'PR-0312', name: 'HP LaserJet Enterprise', owner: 'Shared Device', department: 'Operations', status: 'Retiring soon' },
];

const ticketStorageKey = 'opsdesk-react-tickets';
const authStorageKey = 'opsdesk-react-auth';
const themeStorageKey = 'opsdesk-react-theme';

function App() {
  const [authenticated, setAuthenticated] = useState(() => sessionStorage.getItem(authStorageKey) === 'true');
  const [view, setView] = useState<View>('dashboard');
  const [dark, setDark] = useState(() => localStorage.getItem(themeStorageKey) === 'dark');
  const [tickets, setTickets] = useState<Ticket[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(ticketStorageKey) || 'null') || demoTickets;
    } catch {
      return demoTickets;
    }
  });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | Status>('All');
  const [priorityFilter, setPriorityFilter] = useState<'All' | Priority>('All');
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    localStorage.setItem(themeStorageKey, dark ? 'dark' : 'light');
  }, [dark]);

  useEffect(() => {
    localStorage.setItem(ticketStorageKey, JSON.stringify(tickets));
  }, [tickets]);

  const metrics = useMemo(() => ({
    total: tickets.length,
    open: tickets.filter(ticket => ticket.status === 'Open').length,
    progress: tickets.filter(ticket => ticket.status === 'In Progress').length,
    resolved: tickets.filter(ticket => ticket.status === 'Resolved').length,
  }), [tickets]);

  const filteredTickets = useMemo(() => {
    const query = search.toLowerCase();
    return tickets.filter(ticket => {
      const textMatch = [ticket.title, ticket.requester, ticket.department, ticket.category, ticket.id].join(' ').toLowerCase().includes(query);
      const statusMatch = statusFilter === 'All' || ticket.status === statusFilter;
      const priorityMatch = priorityFilter === 'All' || ticket.priority === priorityFilter;
      return textMatch && statusMatch && priorityMatch;
    });
  }, [tickets, search, statusFilter, priorityFilter]);

  const login = (email: string, password: string) => {
    if (email.toLowerCase() === 'admin@opsdesk.demo' && password === 'OpsDesk2026!') {
      sessionStorage.setItem(authStorageKey, 'true');
      setAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    sessionStorage.removeItem(authStorageKey);
    setAuthenticated(false);
  };

  const createTicket = (ticket: Omit<Ticket, 'id'>) => {
    const nextId = Math.max(1048, ...tickets.map(item => item.id)) + 1;
    setTickets(current => [{ ...ticket, id: nextId }, ...current]);
    setModalOpen(false);
    setView('tickets');
  };

  const advanceTicket = (id: number) => {
    setTickets(current => current.map(ticket => ticket.id === id ? {
      ...ticket,
      status: ticket.status === 'Open' ? 'In Progress' : ticket.status === 'In Progress' ? 'Resolved' : 'Open',
    } : ticket));
  };

  const deleteTicket = (id: number) => {
    if (window.confirm(`Delete ticket #${id}?`)) {
      setTickets(current => current.filter(ticket => ticket.id !== id));
    }
  };

  const exportCsv = () => {
    const rows = [['ID','Title','Requester','Department','Category','Priority','Status'], ...tickets.map(ticket => [ticket.id, ticket.title, ticket.requester, ticket.department, ticket.category, ticket.priority, ticket.status])];
    const csv = rows.map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'opsdesk-tickets.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!authenticated) return <Login onLogin={login} />;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><div className="brand-mark">OD</div><div><strong>OpsDesk</strong><span>IT Operations</span></div></div>
        <nav>
          <NavButton active={view === 'dashboard'} onClick={() => setView('dashboard')} icon={<LayoutDashboard size={18} />} label="Dashboard" />
          <NavButton active={view === 'tickets'} onClick={() => setView('tickets')} icon={<TicketCheck size={18} />} label="Tickets" />
          <NavButton active={view === 'assets'} onClick={() => setView('assets')} icon={<Boxes size={18} />} label="Assets" />
          <NavButton active={view === 'reports'} onClick={() => setView('reports')} icon={<BarChart3 size={18} />} label="Reports" />
        </nav>
        <div className="sidebar-bottom">
          <button className="secondary-button full" onClick={() => setDark(value => !value)}>{dark ? <Sun size={17}/> : <Moon size={17}/>} {dark ? 'Light mode' : 'Dark mode'}</button>
          <div className="profile-card"><div><strong>Abdiaziz Mire</strong><span>IT Operations Admin</span></div><button onClick={logout} aria-label="Sign out"><LogOut size={17}/></button></div>
        </div>
      </aside>

      <main className="content">
        <header className="topbar">
          <div><p className="eyebrow">Corporate Service Management</p><h1>{pageTitle(view)}</h1></div>
          <div className="top-actions"><div className="search-box"><Search size={17}/><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search tickets" /></div><button className="primary-button" onClick={() => setModalOpen(true)}><Plus size={17}/> New Ticket</button></div>
        </header>

        {view === 'dashboard' && <Dashboard metrics={metrics} tickets={tickets} />}
        {view === 'tickets' && <TicketsPage tickets={filteredTickets} statusFilter={statusFilter} priorityFilter={priorityFilter} setStatusFilter={setStatusFilter} setPriorityFilter={setPriorityFilter} onAdvance={advanceTicket} onDelete={deleteTicket} onExport={exportCsv} />}
        {view === 'assets' && <AssetsPage assets={demoAssets} />}
        {view === 'reports' && <ReportsPage tickets={tickets} />}
      </main>

      {modalOpen && <TicketModal onClose={() => setModalOpen(false)} onCreate={createTicket} />}
    </div>
  );
}

function Login({ onLogin }: { onLogin: (email: string, password: string) => boolean }) {
  const [email, setEmail] = useState('admin@opsdesk.demo');
  const [password, setPassword] = useState('OpsDesk2026!');
  const [error, setError] = useState('');
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!onLogin(email, password)) setError('Incorrect demo email or password.');
  };
  return <div className="login-page"><form className="login-card" onSubmit={submit}><div className="brand large"><div className="brand-mark">OD</div><div><strong>OpsDesk</strong><span>Corporate IT Operations</span></div></div><p className="eyebrow">Secure workspace</p><h1>Welcome back</h1><p className="muted">Sign in to manage tickets, assets, and service performance.</p><label>Email<input type="email" value={email} onChange={e => setEmail(e.target.value)} required /></label><label>Password<input type="password" value={password} onChange={e => setPassword(e.target.value)} required /></label><button className="primary-button full" type="submit">Sign in</button><p className="error">{error}</p><div className="demo-credentials"><strong>Demo access</strong><span>admin@opsdesk.demo</span><span>OpsDesk2026!</span></div></form></div>;
}

function NavButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return <button className={active ? 'nav-button active' : 'nav-button'} onClick={onClick}>{icon}<span>{label}</span></button>;
}

function Dashboard({ metrics, tickets }: { metrics: { total: number; open: number; progress: number; resolved: number }; tickets: Ticket[] }) {
  return <><section className="metric-grid"><Metric label="Total Tickets" value={metrics.total} note="All service requests"/><Metric label="Open" value={metrics.open} note="Awaiting action"/><Metric label="In Progress" value={metrics.progress} note="Assigned to technicians"/><Metric label="Resolved" value={metrics.resolved} note="Completed requests"/></section><section className="dashboard-grid"><div className="panel"><div className="panel-heading"><div><p className="eyebrow">Service queue</p><h2>Recent Tickets</h2></div></div><TicketTable tickets={tickets.slice(0,5)} compact /></div><div className="panel"><p className="eyebrow">SLA health</p><h2>Performance</h2><Progress label="First response" value={94}/><Progress label="Resolution target" value={88}/><Progress label="Customer satisfaction" value={96}/></div></section></>;
}

function Metric({ label, value, note }: { label: string; value: number; note: string }) { return <article className="metric-card"><span>{label}</span><strong>{value}</strong><small>{note}</small></article>; }
function Progress({ label, value }: { label: string; value: number }) { return <div className="progress-block"><div><span>{label}</span><strong>{value}%</strong></div><progress max="100" value={value}/></div>; }

function TicketsPage({ tickets, statusFilter, priorityFilter, setStatusFilter, setPriorityFilter, onAdvance, onDelete, onExport }: { tickets: Ticket[]; statusFilter: 'All' | Status; priorityFilter: 'All' | Priority; setStatusFilter: (value: 'All' | Status) => void; setPriorityFilter: (value: 'All' | Priority) => void; onAdvance: (id: number) => void; onDelete: (id: number) => void; onExport: () => void; }) {
  return <div className="panel"><div className="panel-heading responsive"><div><p className="eyebrow">Support workflow</p><h2>Ticket Queue</h2></div><div className="filters"><select value={statusFilter} onChange={e => setStatusFilter(e.target.value as 'All' | Status)}><option>All</option><option>Open</option><option>In Progress</option><option>Resolved</option></select><select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value as 'All' | Priority)}><option>All</option><option>Critical</option><option>High</option><option>Medium</option><option>Low</option></select><button className="secondary-button" onClick={onExport}>Export CSV</button></div></div><TicketTable tickets={tickets} onAdvance={onAdvance} onDelete={onDelete}/></div>;
}

function TicketTable({ tickets, compact, onAdvance, onDelete }: { tickets: Ticket[]; compact?: boolean; onAdvance?: (id: number) => void; onDelete?: (id: number) => void }) {
  return <div className="table-wrap"><table><thead><tr><th>ID</th><th>Issue</th><th>Requester</th>{!compact && <th>Department</th>}<th>Priority</th><th>Status</th>{!compact && <th>Actions</th>}</tr></thead><tbody>{tickets.length ? tickets.map(ticket => <tr key={ticket.id}><td>#{ticket.id}</td><td><strong>{ticket.title}</strong><small>{ticket.category}</small></td><td>{ticket.requester}</td>{!compact && <td>{ticket.department}</td>}<td><span className={`badge priority-${ticket.priority.toLowerCase()}`}>{ticket.priority}</span></td><td><span className={`badge status-${ticket.status.toLowerCase().replace(' ','-')}`}>{ticket.status}</span></td>{!compact && <td><div className="row-actions"><button onClick={() => onAdvance?.(ticket.id)}>Advance</button><button onClick={() => onDelete?.(ticket.id)}>Delete</button></div></td>}</tr>) : <tr><td colSpan={7} className="empty">No tickets match your filters.</td></tr>}</tbody></table></div>;
}

function AssetsPage({ assets }: { assets: Asset[] }) { return <div className="panel"><p className="eyebrow">Asset inventory</p><h2>Corporate Devices</h2><div className="asset-list">{assets.map(asset => <div className="asset-row" key={asset.id}><div><strong>{asset.id}</strong><span>{asset.name}</span></div><span>{asset.owner}</span><span>{asset.department}</span><span className={`asset-status ${asset.status.toLowerCase().replaceAll(' ','-')}`}>{asset.status}</span></div>)}</div></div>; }

function ReportsPage({ tickets }: { tickets: Ticket[] }) {
  const priority = ['Critical','High','Medium','Low'].map(label => ({ label, value: tickets.filter(ticket => ticket.priority === label).length }));
  const status = ['Open','In Progress','Resolved'].map(label => ({ label, value: tickets.filter(ticket => ticket.status === label).length }));
  return <div className="report-grid"><Chart title="Tickets by Priority" items={priority}/><Chart title="Tickets by Status" items={status}/></div>;
}

function Chart({ title, items }: { title: string; items: { label: string; value: number }[] }) { const max = Math.max(1, ...items.map(item => item.value)); return <div className="panel"><p className="eyebrow">Analytics</p><h2>{title}</h2><div className="bar-chart">{items.map(item => <div className="bar-row" key={item.label}><span>{item.label}</span><div className="bar-track"><div className="bar-fill" style={{ width: `${item.value / max * 100}%` }}/></div><strong>{item.value}</strong></div>)}</div></div>; }

function TicketModal({ onClose, onCreate }: { onClose: () => void; onCreate: (ticket: Omit<Ticket,'id'>) => void }) {
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    onCreate({ title: String(data.title), requester: String(data.requester), department: String(data.department), category: String(data.category), priority: data.priority as Priority, status: data.status as Status, description: String(data.description) });
  };
  return <div className="modal-backdrop" onMouseDown={event => event.target === event.currentTarget && onClose()}><form className="modal-card" onSubmit={submit}><div className="panel-heading"><div><p className="eyebrow">New service request</p><h2>Create Ticket</h2></div><button type="button" className="icon-button" onClick={onClose}>×</button></div><div className="form-grid"><label>Issue title<input name="title" required /></label><label>Requester<input name="requester" required /></label><label>Department<select name="department"><option>Finance</option><option>Human Resources</option><option>Operations</option><option>Sales</option><option>Technology</option></select></label><label>Category<select name="category"><option>Hardware</option><option>Software</option><option>Access</option><option>Network</option><option>Security</option></select></label><label>Priority<select name="priority"><option>Low</option><option selected>Medium</option><option>High</option><option>Critical</option></select></label><label>Status<select name="status"><option>Open</option><option>In Progress</option><option>Resolved</option></select></label><label className="full-span">Description<textarea name="description" rows={4}/></label></div><div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>Cancel</button><button className="primary-button" type="submit">Create Ticket</button></div></form></div>;
}

function pageTitle(view: View) { return ({ dashboard: 'Operations Dashboard', tickets: 'Ticket Management', assets: 'Asset Inventory', reports: 'Service Reports' } as const)[view]; }

export default App;
