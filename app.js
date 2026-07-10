const STORAGE_KEY='opsdesk-tickets-v1';
const THEME_KEY='opsdesk-theme';
const defaultTickets=[
{id:1048,title:'VPN access fails after password reset',requester:'Jordan Lee',department:'Finance',category:'Access',priority:'High',status:'Open',description:'User cannot reconnect to corporate VPN after password reset.',createdAt:'2026-07-10T01:15:00'},
{id:1047,title:'Laptop running slowly during video calls',requester:'Maya Patel',department:'Sales',category:'Hardware',priority:'Medium',status:'In Progress',description:'High CPU usage during Teams meetings.',createdAt:'2026-07-09T22:40:00'},
{id:1046,title:'Shared drive permissions needed',requester:'Chris Morgan',department:'Operations',category:'Access',priority:'Low',status:'Resolved',description:'Add user to operations shared drive group.',createdAt:'2026-07-09T18:20:00'},
{id:1045,title:'Suspicious sign-in notification',requester:'Taylor Smith',department:'Human Resources',category:'Security',priority:'Critical',status:'In Progress',description:'User received an unfamiliar sign-in alert.',createdAt:'2026-07-09T16:05:00'},
{id:1044,title:'Printer unavailable on third floor',requester:'Avery Johnson',department:'Operations',category:'Hardware',priority:'Medium',status:'Open',description:'Network printer is offline for multiple employees.',createdAt:'2026-07-09T14:30:00'}
];
const assets=[
{name:'LT-2041 · Dell Latitude 7440',owner:'Jordan Lee',department:'Finance',health:'Healthy'},
{name:'LT-1988 · MacBook Pro 14',owner:'Maya Patel',department:'Sales',health:'Healthy'},
{name:'WS-1142 · Dell Precision 3660',owner:'Chris Morgan',department:'Operations',health:'Needs patching'},
{name:'PH-0821 · iPhone 15',owner:'Taylor Smith',department:'Human Resources',health:'Healthy'},
{name:'PR-0312 · HP LaserJet Enterprise',owner:'Shared Device',department:'Operations',health:'Needs attention'}
];
let tickets=loadTickets();
let searchTerm='';
function loadTickets(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY))||defaultTickets}catch{return defaultTickets}}
function saveTickets(){localStorage.setItem(STORAGE_KEY,JSON.stringify(tickets))}
function esc(v){return String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
function badge(v,type){return `<span class="badge ${type}-${v.replaceAll(' ','-')}">${esc(v)}</span>`}
function rowHtml(t,actions=false){return `<tr><td>#${t.id}</td><td><strong>${esc(t.title)}</strong></td><td>${esc(t.requester)}</td>${actions?`<td>${esc(t.department)}</td>`:''}<td>${badge(t.priority,'priority')}</td><td>${badge(t.status,'status')}</td>${actions?`<td><div class="action-row"><button data-action="advance" data-id="${t.id}">Advance</button><button data-action="delete" data-id="${t.id}">Delete</button></div></td>`:''}</tr>`}
function filtered(){const s=document.querySelector('#statusFilter')?.value||'all';const p=document.querySelector('#priorityFilter')?.value||'all';return tickets.filter(t=>[t.title,t.requester,t.department,t.category,String(t.id)].join(' ').toLowerCase().includes(searchTerm.toLowerCase())&&(s==='all'||t.status===s)&&(p==='all'||t.priority===p))}
function renderMetrics(){document.querySelector('#total').textContent=tickets.length;document.querySelector('#open').textContent=tickets.filter(t=>t.status==='Open').length;document.querySelector('#progress').textContent=tickets.filter(t=>t.status==='In Progress').length;document.querySelector('#resolved').textContent=tickets.filter(t=>t.status==='Resolved').length}
function renderRecent(){document.querySelector('#recentBody').innerHTML=tickets.slice(0,5).map(t=>rowHtml(t)).join('')||'<tr><td colspan="5">No tickets yet.</td></tr>'}
function renderTickets(){document.querySelector('#ticketBody').innerHTML=filtered().map(t=>rowHtml(t,true)).join('')||'<tr><td colspan="7">No tickets match your filters.</td></tr>'}
function renderAssets(){document.querySelector('#assetList').innerHTML=assets.map(a=>`<div class="asset-row"><strong>${esc(a.name)}</strong><span>${esc(a.owner)}</span><span>${esc(a.department)}</span><span>${esc(a.health)}</span></div>`).join('')}
function countsBy(field,values){return values.map(v=>({label:v,value:tickets.filter(t=>t[field]===v).length}))}
function chartHtml(items){const max=Math.max(1,...items.map(i=>i.value));return items.map(i=>`<div class="bar-row"><span>${esc(i.label)}</span><div class="bar-track"><div class="bar-fill" style="width:${(i.value/max)*100}%"></div></div><strong>${i.value}</strong></div>`).join('')}
function renderReports(){document.querySelector('#priorityChart').innerHTML=chartHtml(countsBy('priority',['Critical','High','Medium','Low']));document.querySelector('#statusChart').innerHTML=chartHtml(countsBy('status',['Open','In Progress','Resolved']))}
function render(){renderMetrics();renderRecent();renderTickets();renderAssets();renderReports()}
function switchView(view){document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));document.querySelector(`#${view}`).classList.add('active');document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('active',b.dataset.view===view));const titles={dashboard:'Operations Dashboard',tickets:'Ticket Management',assets:'Asset Inventory',reports:'Service Reports'};document.querySelector('#pageTitle').textContent=titles[view]}
document.querySelectorAll('nav button').forEach(b=>b.addEventListener('click',()=>switchView(b.dataset.view)));
const dialog=document.querySelector('#dialog');
document.querySelector('#newTicket').addEventListener('click',()=>dialog.showModal());
document.querySelector('#cancelBtn').addEventListener('click',()=>dialog.close());
document.querySelector('#ticketForm').addEventListener('submit',e=>{e.preventDefault();const data=Object.fromEntries(new FormData(e.currentTarget));const nextId=Math.max(1048,...tickets.map(t=>t.id))+1;tickets.unshift({...data,id:nextId,createdAt:new Date().toISOString()});saveTickets();e.currentTarget.reset();dialog.close();render();switchView('tickets')});
document.querySelector('#ticketBody').addEventListener('click',e=>{const btn=e.target.closest('button[data-action]');if(!btn)return;const id=Number(btn.dataset.id);const ticket=tickets.find(t=>t.id===id);if(!ticket)return;if(btn.dataset.action==='delete'){if(confirm(`Delete ticket #${id}?`))tickets=tickets.filter(t=>t.id!==id)}if(btn.dataset.action==='advance'){ticket.status=ticket.status==='Open'?'In Progress':ticket.status==='In Progress'?'Resolved':'Open'}saveTickets();render()});
document.querySelector('#search').addEventListener('input',e=>{searchTerm=e.target.value;renderTickets()});
document.querySelector('#statusFilter').addEventListener('change',renderTickets);
document.querySelector('#priorityFilter').addEventListener('change',renderTickets);
document.querySelector('#themeBtn').addEventListener('click',()=>{document.body.classList.toggle('dark');localStorage.setItem(THEME_KEY,document.body.classList.contains('dark')?'dark':'light')});
document.querySelector('#exportBtn').addEventListener('click',()=>{const headers=['ID','Title','Requester','Department','Category','Priority','Status','Created At'];const rows=tickets.map(t=>[t.id,t.title,t.requester,t.department,t.category,t.priority,t.status,t.createdAt]);const csv=[headers,...rows].map(r=>r.map(v=>`"${String(v).replaceAll('"','""')}"`).join(',')).join('\n');const blob=new Blob([csv],{type:'text/csv'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='opsdesk-tickets.csv';a.click();URL.revokeObjectURL(url)});
if(localStorage.getItem(THEME_KEY)==='dark')document.body.classList.add('dark');
if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js'));
render();