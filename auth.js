const AUTH_KEY='opsdesk-auth-session';
const DEMO_EMAIL='admin@opsdesk.demo';
const DEMO_PASSWORD='OpsDesk2026!';

const loginScreen=document.querySelector('#loginScreen');
const appRoot=document.querySelector('#appRoot');
const loginForm=document.querySelector('#loginForm');
const loginError=document.querySelector('#loginError');
const logoutBtn=document.querySelector('#logoutBtn');

function showApp(){
  loginScreen.classList.add('auth-hidden');
  appRoot.classList.remove('app-hidden');
}

function showLogin(){
  appRoot.classList.add('app-hidden');
  loginScreen.classList.remove('auth-hidden');
}

function hasSession(){
  return sessionStorage.getItem(AUTH_KEY)==='authenticated';
}

loginForm.addEventListener('submit',event=>{
  event.preventDefault();
  const email=document.querySelector('#loginEmail').value.trim().toLowerCase();
  const password=document.querySelector('#loginPassword').value;

  if(email===DEMO_EMAIL&&password===DEMO_PASSWORD){
    sessionStorage.setItem(AUTH_KEY,'authenticated');
    loginError.textContent='';
    showApp();
    return;
  }

  loginError.textContent='Incorrect demo email or password.';
});

logoutBtn.addEventListener('click',()=>{
  sessionStorage.removeItem(AUTH_KEY);
  showLogin();
});

if(hasSession())showApp();else showLogin();
