// importing named exports we use brackets
import { createPostTile, uploadImage, header, appendChilds, createLabel, createElement_, createInputBox, checkStore } from './helpers.js';

// when importing 'default' exports, use below syntax
import API from './api.js';

const api  = new API();


const login = document.getElementById('login');
login.innerText = 'LOGIN';
login.addEventListener('click', ()=>{
    if (login.innerText === 'LOGIN') {
        formChange('registerForm', 'loginForm');
    } else {
        // LOGOUT
        window.localStorage.clear();
        formChange('feed', 'loginForm');
        register.innerText = 'REGISTER';
        login.innerText = 'LOGIN';
        removeChilds(feed);
    }   
});

function removeChilds(element) {
    let child = element.firstChild;
    while (child) {
        element.removeChild(child);
        child = element.firstChild;
    }
}

const register = document.getElementById('register');
register.innerText = 'REGISTER';
register.addEventListener('click', ()=>{
    if (register.innerText === 'REGISTER') {
        formChange('loginForm', 'registerForm');
    } else {
        // UPLOAD
    }
});


const body = document.getElementById('large-feed');
body.style.textAlign = 'center';

const loginForm = createFormDiv('loginForm', '400px');
const registerForm = createFormDiv('registerForm', '400px');
registerForm.style.display = 'none';
const feed = createFormDiv('feed', '700px');
feed.style.display = 'none';


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

const submitL = createButton('Login', 'submit');
submitL.addEventListener('click', () => {
    const tb = document.getElementsByClassName('textBox');
    api.makeAPIRequest('auth/login', optionsPost({ 'Content-Type': 'application/json' }, 'POST', {username: tb[0].value, password: tb[1].value}))
        .then(data => {
            if (data.token) {
                window.localStorage.setItem('user', data.token);
                register.innerText = 'UPLOAD';
                login.innerText = 'LOGOUT';
                formChange('loginForm', 'feed');
                loadFeed();
            }
        })
        .catch(err => console.log(err));
    });
    
const submitR = createButton('Signup', 'submit');
submitR.addEventListener('click', () => {
    const tb = Array.from(document.getElementsByClassName('textBox')).slice(2, 6);
    api.makeAPIRequest('auth/signup', optionsPost({ 'Content-Type': 'application/json' }, 'POST', {username:  tb[2].value, password: tb[3].value, email: tb[1].value, name: tb[0].value})) 
    .then(data => {
        console.log(data);
        if (data.token) {
            window.localStorage.setItem('user', data.token);
                document.getElementById('register').innerText = 'UPLOAD';
                document.getElementById('login').innerText = 'LOGOUT';
                formChange('registerForm', 'feed');
            }
        })
        .catch(err => console.log(err));
    });
    
function optionsPost(headers, method, body) {
    return {
        headers: headers,
        method: method,
        body: JSON.stringify(body)
    }    
}

function optionsGet(headers, method) {
    return {
        headers: headers,
        method: method
    }
}

function loadFeed() {
    const token = checkStore('user');
    api.makeAPIRequest('user/feed', optionsGet({ 'Content-Type': 'application/json', Authorization: `Token ${token}`}, 'GET'))
        .then(data => {
            let posts = data.posts;
            posts.reduce((parent, post) => {
                parent.appendChild(createPostTile(post));
                return parent;
            }, feed)
        });
}

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

function formChange(formA, formB) {
    const x = document.getElementById(formA);
    const y = document.getElementById(formB);
    
    x.style.display = 'none';
    y.style.display = 'inline-block';
    for (var box of document.getElementsByClassName('textBox')) {
        box.value = '';
    }
}

function createFormDiv(id, width) {
    const div = createElement_('div');
    div.style.background = '#2D2D2D';
    div.id = id;
    div.style.padding = '50px';
    div.style.width = width;
    div.style.borderRadius = '20px';
    div.style.display = 'inline-block';
    return div;
}

const newLine = createElement_('br');
const a = createElement_('br');
const b = createElement_('br');
const c = createElement_('br');
appendChilds(loginForm, [header('LOGIN'), userLabel1, username.cloneNode(), passLabel1, password.cloneNode(), a.cloneNode(), b.cloneNode(), c.cloneNode(), submitL])
appendChilds(registerForm, [header('SIGNUP'), nameLabel, name, newLine, emailLabel, email, userLabel, username, passLabel, password, a, b, c, submitR])

body.appendChild(feed);
body.appendChild(loginForm);
body.appendChild(registerForm);

if (checkStore('user')) {
    login.innerText = 'LOGOUT';
    register.innerText = 'UPLOAD';
    formChange('loginForm', 'feed');
    loadFeed();
}

/*
// Potential example to upload an image
/*const input = document.querySelector('input[type="file"]');

input.addEventListener('change', uploadImage);*/
