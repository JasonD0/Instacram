// importing named exports we use brackets
import { createPostTile, uploadImage, header, appendChilds, createLabel, createElement_, createInputBox } from './helpers.js';

// when importing 'default' exports, use below syntax
import API from './api.js';

const api  = new API();

const login = document.getElementById('login');
login.addEventListener('click', ()=>{
    const x = document.getElementById('registerForm');
    const y = document.getElementById('loginForm');
    x.style.display = 'none';
    y.style.display = 'inline-block';
    for (var box of document.getElementsByClassName('textBox')) {
        box.value = '';
    }
});

const register = document.getElementById('register');
register.addEventListener('click', ()=>{
    const x = document.getElementById('loginForm');
    const y = document.getElementById('registerForm');
    x.style.display = 'none';
    y.style.display = 'inline-block';
    for (var box of document.getElementsByClassName('textBox')) {
        box.value = '';
    }
});

const body = document.getElementById('large-feed');
body.style.textAlign = 'center';

const loginForm = createFormDiv('loginForm');
const registerForm = createFormDiv('registerForm');
registerForm.style.display = 'none';

const username = createInputBox('text', 'Enter username');
const password = createInputBox('password', 'Enter password');
const name = createInputBox('text', 'Enter name');
const email = createInputBox('text', 'Enter email');

const userLabel = createLabel('Username:');
const userLabel1 = createLabel('Username:');
const passLabel = createLabel('Password:');
const passLabel1 = createLabel('Password:');
const nameLabel = createLabel('Name:');
const emailLabel = createLabel('Email:');

function createButton(text, id) {
    const b = createElement_('button');
    b.innerText = text;
    b.style.fontSize = '20px';
    b.style.fontWeight = 'bold';
    b.style.outline = 'none';
    b.style.padding = '10px 0px 10px 10px';
    b.style.paddingLeft = '40px';
    b.style.paddingRight = '40px';
    b.id = id;
    return b;
}

function createFormDiv(id) {
    const div = createElement_('div');
    div.style.background = '#2D2D2D';
    div.id = id;
    div.style.padding = '50px';
    div.style.width = '400px';
    div.style.borderRadius = '20px';
    div.style.display = 'inline-block';
    return div;
}

const newLine = createElement_('br');
const a = createElement_('br');
const b = createElement_('br');
const c = createElement_('br');
appendChilds(loginForm, [header('LOGIN'), userLabel1, username.cloneNode(), passLabel1, password.cloneNode(), a.cloneNode(), b.cloneNode(), c.cloneNode(), createButton('Login', 'submit')])
appendChilds(registerForm, [header('REGISTER'), nameLabel, name, newLine, emailLabel, email, userLabel, username, passLabel, password, a, b, c, createButton('Login', 'submit')])
body.appendChild(loginForm);
body.appendChild(registerForm);



/*
// GET AUTHORISATION TOKEN   -> USE TO GET FEED FOLLOW OTHERS ETC   -> STORE AUTH IN LOCALSTORAGE -> WHEN LOGOUT -> clear
let option = {
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
    body: JSON.stringify({ username: 'Sophia', password: 'cluttered' })
};
const r = api.makeAPIRequest('auth/login', option); 
r.then(data => {console.log(data);});
*/

// we can use this single api request multiple times
/*const feed = api.getFeed();

feed
.then(posts => {
    posts.reduce((parent, post) => {

        parent.appendChild(createPostTile(post));

        return parent;

    }, document.getElementById('large-feed'))
});*/

// Potential example to upload an image
/*const input = document.querySelector('input[type="file"]');

input.addEventListener('change', uploadImage);*/
