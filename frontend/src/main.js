// importing named exports we use brackets
import { convertToTime, createPostTile, uploadImage, header, createElement, appendChilds, createLabel, createInputBox, checkStore } from './helpers.js';

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
    const tb = document.getElementsByClassName('input-text-boxes');
    api.makeAPIRequest('auth/login', options({ 'Content-Type': 'application/json' }, 'POST', {username: tb[0].value, password: tb[1].value}))
        .then(data => {
            if (data.token) {
                window.localStorage.setItem('user', data.token);
                register.innerText = 'UPLOAD';
                login.innerText = 'LOGOUT';
                formChange('loginForm', 'feed');
                const userToken = data.token;
                api.makeAPIRequest('user/', optionsNoBody({'Content-Type': 'application/json', Authorization: `Token ${userToken}`}, 'GET'))
                    .then(data => {
                        window.localStorage.setItem('id', data.id);
                        checkStore('id');
                    });
                loadFeed();
            }
        })
        .catch(err => console.log(err));
    });
    
const submitR = createButton('Signup', 'submit');
submitR.addEventListener('click', () => {
    const tb = Array.from(document.getElementsByClassName('input-text-boxes')).slice(2, 6);
    api.makeAPIRequest('auth/signup', options({ 'Content-Type': 'application/json' }, 'POST', {username:  tb[2].value, password: tb[3].value, email: tb[1].value, name: tb[0].value})) 
    .then(data => {
        if (data.token) {
            window.localStorage.setItem('user', data.token);
                register.innerText = 'UPLOAD';
                login.innerText = 'LOGOUT';
                formChange('registerForm', 'feed');
                const userToken = data.token;
                api.makeAPIRequest('user/', optionsNoBody({'Content-Type': 'application/json', Authorization: `Token ${userToken}`}, 'GET'))
                    .then(data => {
                        window.localStorage.setItem('id', data.id);
                    });
                //loadFeed();   new users wont have feed 
            }
        })
        .catch(err => console.log(err));
    });
    
function options(headers, method, body) {
    return {
        headers: headers,
        method: method,
        body: JSON.stringify(body)
    }    
}

function optionsNoBody(headers, method) {
    return {
        headers: headers,
        method: method
    }
}

function createModal(type) {
    const modal = createElement('div', null, {class: 'modal'});
    const exit = createElement('a', null, {class: 'exit'});
    const modalHeader = createElement('div', null, {class: 'modal-header'});
    exit.innerText = '×';
    exit.addEventListener('click', () => {
        Array.from(document.getElementsByClassName('modal')).map(m => {
            m.style.display = 'none';
        });
        body.style.float = 'none';
    });
    const header = createElement('h2');
    header.innerText = type;
    header.style.paddingLeft = '15px';
    appendChilds(modalHeader, [exit, header]);
    const modalContent = createElement('div', null, {class: 'modal-content'});
    appendChilds(modal, [modalHeader, modalContent]);
    return modal;
}

function loadFeed() {
    const userToken = checkStore('user');
    api.makeAPIRequest('user/feed', optionsNoBody({ 'Content-Type': 'application/json', Authorization: `Token ${userToken}`}, 'GET'))
        .then(data => {
            let posts = data.posts;
            var i = 0;
            posts.reduce((parent, post) => {
                parent.appendChild(createPostTile(post, i));
                parent.appendChild(createElement('br'));
                i++;
                return parent;
            }, feed);
        })
        .then(() => {
            const feedP = document.getElementsByClassName('post');
            Array.from(feedP).map((post) => {
                let likeAction = post.getElementsByClassName('likes')[0];
                const postId = parseInt(post.getElementsByClassName('postId')[0].innerText);
                likeAction.addEventListener('click', () => {
                    api.makeAPIRequest('post/like?id='+postId, optionsNoBody({'Content-Type': 'application/json', Authorization: `Token ${userToken}`}, 'PUT'))
                    .then(() => {
                        api.makeAPIRequest('post/?id='+postId, optionsNoBody({'Content-Type': 'application/json', Authorization: `Token ${userToken}`}, 'GET'))
                        .then(data => {
                            let x = parseInt(likeAction.innerText.replace(/\D+/g, ''));
                            // user already liked
                            if (data.meta.likes.length <= parseInt(checkStore(postId))) {
                                window.localStorage.setItem(postId, x-1);
                                api.makeAPIRequest('post/unlike?id='+postId, optionsNoBody({'Content-Type': 'application/json', Authorization: `Token ${userToken}`}, 'PUT'));                                
                                if (x > 0) likeAction.innerText = likeAction.innerText.replace(x, `${x-1}`);
                            } else {
                                window.localStorage.setItem(postId, x+1);
                                likeAction.innerText = likeAction.innerText.replace(x, `${x+1}`);
                            }                  
                        });
                    });
                });
            });
        })
        .then(() => {
            const viewLikes = document.getElementsByClassName('viewLikes');
            for (let j = 0; j < viewLikes.length; j++) {
                const pId = checkStore(j);
                viewLikes[j].addEventListener('click', () => {
                    document.getElementsByClassName('modal')[1].style.display = 'block';
                    removeChilds(document.getElementsByClassName('modal-content')[1]);
                    api.makeAPIRequest('post/?id='+pId, optionsNoBody({'Content-Type': 'application/json', Authorization: `Token ${userToken}`}, 'GET'))
                        .then(data => {
                            const userLikes = data.meta.likes; 
                            userLikes.reduce((cs, us) => {
                                const u = createElement('a', null, {class: 'user'});
                                u.innerText = us;
                                cs.appendChild(u);
                                cs.appendChild(createElement('br'));
                                return document.getElementsByClassName('modal-content')[1];
                            }, document.getElementsByClassName('modal-content')[1]);
                        });
                });
            }
        })
        .then(() => {
            const comments = Array.from(document.getElementsByClassName('comments'));
            for (let j = 0; j < comments.length; j++) {
                const pId = checkStore(j);
                comments[j].addEventListener('click', () => {
                    document.getElementsByClassName('modal')[0].style.display = 'block';
                    removeChilds(document.getElementsByClassName('modal-content')[0]);
                    api.makeAPIRequest('post/?id='+pId, optionsNoBody({'Content-Type': 'application/json', Authorization: `Token ${userToken}`}, 'GET'))
                        .then(data => {
                            const userComments = data.comments;
                            userComments.reduce((cs, us) => {
                                const c = createElement('i', null, {class: 'comment'});
                                c.innerText = us.comment;
                                const u = createElement('a', null, {class: 'user'});
                                u.innerText = us.author;
                                cs.appendChild(u);
                                cs.appendChild(createElement('br'));
                                cs.appendChild(createElement('br'));
                                cs.appendChild(c);
                                cs.appendChild(createElement('br'));
                                const date = createElement('i');
                                date.className = 'date';
                                date.innerText = convertToTime(us.published);
                                date.style.fontSize = '10px';
                                cs.appendChild(date);
                                cs.appendChild(createElement('br'));
                                return document.getElementsByClassName('modal-content')[0];
                            }, document.getElementsByClassName('modal-content')[0]);
                        });
                });
            }
        });
}

function createButton(text, id) {
    const b = createElement('button');
    b.className = 'submit-buttons';
    b.innerText = text;
    b.id = id;
    return b;
}

function formChange(formA, formB) {
    const x = document.getElementById(formA);
    const y = document.getElementById(formB);
    
    x.style.display = 'none';
    y.style.display = 'inline-block';
    for (var box of document.getElementsByClassName('input-text-boxes')) {
        box.value = '';
    }
}

function createFormDiv(id, width) {
    const div = createElement('div');
    div.className = 'main-content-box';
    div.id = id;
    div.style.width = width;
    return div;
}


const newLine = createElement('br');
const a = createElement('br');
const b = createElement('br');
const c = createElement('br');
appendChilds(loginForm, [header('LOGIN'), userLabel1, username.cloneNode(), passLabel1, password.cloneNode(), a.cloneNode(), b.cloneNode(), c.cloneNode(), submitL])
appendChilds(registerForm, [header('SIGNUP'), nameLabel, name, newLine, emailLabel, email, userLabel, username, passLabel, password, a, b, c, submitR])
body.appendChild(createModal('COMMENTS')); // comments
body.appendChild(createModal('LIKED BY')); // likes
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
