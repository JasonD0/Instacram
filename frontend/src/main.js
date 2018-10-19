// importing named exports we use brackets
import { convertToTime, createPostTile, uploadImage, header, createElement, appendChilds, createLabel, createInputBox, checkStore } from './helpers.js';

// when importing 'default' exports, use below syntax
import API from './api.js';

const api  = new API();

// login 'button' functionality
const login = document.getElementById('login');
login.innerText = 'LOGIN';
login.addEventListener('click', ()=>{
    if (login.innerText === 'LOGIN') {
        formChange('registerForm', 'loginForm');
    } else {
        // LOGOUT
        window.localStorage.clear();
        formChange('feed', 'loginForm');
        formChange('profileForm', 'loginForm');
        register.innerText = 'REGISTER';
        login.innerText = 'LOGIN';
        removeChilds(feed);
    }   
});

// register 'button' functionality
const register = document.getElementById('register');
register.innerText = 'REGISTER';
register.addEventListener('click', ()=>{
    // change page to register
    if (register.innerText === 'REGISTER') {
        formChange('loginForm', 'registerForm');
    // change page to profile
    } else if (register.innerText === 'PROFILE') {
        register.innerText = 'FEED';
        formChange('feed', 'profileForm');
    // change page to feed
    } else {
        register.innerText = 'PROFILE';
        formChange('profileForm', 'feed');
    }
});

/**
 * Remove all child elements of a parent
 * @param {*} element 
 */
function removeChilds(element) {
    let child = element.firstChild;
    while (child) {
        element.removeChild(child);
        child = element.firstChild;
    }
}

const body = document.getElementById('large-feed');
body.style.textAlign = 'center';

// create pages for login, register, user feed and profile 
const loginForm = createFormDiv('loginForm', '400px');
const registerForm = createFormDiv('registerForm', '400px');
registerForm.style.display = 'none';
const feed = createFormDiv('feed', '700px');
feed.style.display = 'none';
const profileForm = createFormDiv('profileForm', '400px');
profileForm.style.display = 'none';

/**
 * Changes page to home page
 * @param {*} data 
 */
function homePage(data) {
    if (data.token) {
        window.localStorage.setItem('user', data.token);
        register.innerText = 'PROFILE';
        login.innerText = 'LOGOUT';
        formChange('loginForm', 'feed');
        formChange('registerForm', 'feed');
        const userToken = data.token;
        api.makeAPIRequest('user/', optionsNoBody({'Content-Type': 'application/json', Authorization: `Token ${userToken}`}, 'GET'))
            .then(data => {
                window.localStorage.setItem('id', data.id);
            });
        loadFeed();
    }
}

// login button
const submitL = createButton('Login', 'submit');
submitL.addEventListener('click', () => {
    const tb = document.getElementsByClassName('input-text-boxes');
    api.makeAPIRequest('auth/login', options({ 'Content-Type': 'application/json' }, 'POST', {username: tb[0].value, password: tb[1].value}))
        .then(data => homePage(data))
        .catch(err => console.log(err));
    });

// signup button
const submitR = createButton('Signup', 'submit');
submitR.addEventListener('click', () => {
    const tb = Array.from(document.getElementsByClassName('input-text-boxes')).slice(2, 6);
    api.makeAPIRequest('auth/signup', options({ 'Content-Type': 'application/json' }, 'POST', {username:  tb[2].value, password: tb[3].value, email: tb[1].value, name: tb[0].value})) 
        .then(data => homePage(data))
        .catch(err => console.log(err));
    });

// create options for api requests
function options(headers, method, body) {
    return {
        headers: headers,
        method: method,
        body: JSON.stringify(body)
    }    
}

// create options for api requests without body
function optionsNoBody(headers, method) {
    return {
        headers: headers,
        method: method
    }
}

// creates pop-up modal 
function createModal(type) {
    const modal = createElement('div', null, {class: 'modal'});
    const modalHeader = createElement('div', null, {class: 'modal-header'});
    const modalContent = createElement('div', null, {class: 'modal-content'});
    const exit = createElement('a', null, {class: 'exit'});
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
    appendChilds(modal, [modalHeader, modalContent]);
    return modal;
}

/**
 * Adds posts to user feed
 * @param posts 
 */
function appendPosts(posts) {
    var i = 0;
    posts.reduce((parent, post) => {
        parent.appendChild(createPostTile(post, i));
        parent.appendChild(createElement('br'));
        i++;
        return parent;
    }, feed);
}

/**
 * Adds like functionality to all like 'buttons'
 */
function addLike(userToken) {
    const feedP = document.getElementsByClassName('post');
    Array.from(feedP).map((post) => {
        let likeAction = post.getElementsByClassName('likes')[0];
        const postId = parseInt(post.getElementsByClassName('postId')[0].innerText);
        // user clicked like
        likeAction.addEventListener('click', () => {
            api.makeAPIRequest('post/like?id='+postId, optionsNoBody({'Content-Type': 'application/json', Authorization: `Token ${userToken}`}, 'PUT'))
            .then(() => {
                updateLikes(likeAction, postId, userToken);         
            });
        });
    });
}

/**
 * Updates like count for a post
 * @param {*} likeAction 
 * @param {*} postId 
 * @param {*} userToken 
 */
function updateLikes(likeAction, postId, userToken) {
    api.makeAPIRequest('post/?id='+postId, optionsNoBody({'Content-Type': 'application/json', Authorization: `Token ${userToken}`}, 'GET'))
    .then(data => {
        let x = parseInt(likeAction.innerText.replace(/\D+/g, ''));
        // user unliked
        if (data.meta.likes.length <= parseInt(checkStore(postId))) {
            window.localStorage.setItem(postId, x-1);
            api.makeAPIRequest('post/unlike?id='+postId, optionsNoBody({'Content-Type': 'application/json', Authorization: `Token ${userToken}`}, 'PUT'));                                
            if (x > 0) likeAction.innerText = likeAction.innerText.replace(x, `${x-1}`);
        // user liked
        } else {
            window.localStorage.setItem(postId, x+1);
            likeAction.innerText = likeAction.innerText.replace(x, `${x+1}`);
        }                  
    });
}

/**
 * Add viewing users that liked the post functionality
 * @param {*} userToken 
 */
function addViewLikes(userToken) {
    const viewLikes = document.getElementsByClassName('viewLikes');
    for (let j = 0; j < viewLikes.length; j++) {
        const pId = checkStore(j);
        viewLikes[j].addEventListener('click', () => {
            document.getElementsByClassName('modal')[1].style.display = 'block';
            removeChilds(document.getElementsByClassName('modal-content')[1]);
            api.makeAPIRequest('post/?id='+pId, optionsNoBody({'Content-Type': 'application/json', Authorization: `Token ${userToken}`}, 'GET'))
                .then(data => addLikeModalContent(data, userToken));
        });
    }
}

/**
 * Add users that liked the post to pop-up modal
 * @param {*} data 
 * @param {*} userToken 
 */
function addLikeModalContent(data, userToken) {
    const userLikes = data.meta.likes; 
    userLikes.reduce((cs, us) => {
        const u = createElement('a', null, {class: 'user'});
        u.style.fontSize = '15px';
        api.makeAPIRequest('user/?id='+us, optionsNoBody({'Content-Type': 'application/json', Authorization: `Token ${userToken}`}, 'GET'))
            .then(userInfo => {
                u.innerText = userInfo.username;   
            });
        appendChilds(cs, [u, createElement('br'), createElement('br')]);
        return document.getElementsByClassName('modal-content')[1];
    }, document.getElementsByClassName('modal-content')[1]);
}

/**
 * Adds viewing comments for the post functionality
 * @param {*} userToken 
 */
function addViewComments(userToken) {
    const comments = Array.from(document.getElementsByClassName('comments'));
    for (let j = 0; j < comments.length; j++) {
        const pId = checkStore(j);
        comments[j].addEventListener('click', () => {
            document.getElementsByClassName('modal')[0].style.display = 'block';
            removeChilds(document.getElementsByClassName('modal-content')[0]);
            api.makeAPIRequest('post/?id='+pId, optionsNoBody({'Content-Type': 'application/json', Authorization: `Token ${userToken}`}, 'GET'))
                .then(data => addCommentModalContents(data));
        });
    }
}

/**
 * Adds comments of the post to the pop-up modal
 * @param {*} data 
 */
function addCommentModalContents(data) {
    const userComments = data.comments;
    userComments.reduce((cs, us) => {
        const c = createElement('i', null, {class: 'comment'});
        c.innerText = us.comment;
        const u = createElement('a', null, {class: 'user'});
        u.innerText = us.author;
        const date = createElement('i', null, {class: 'date'});
        date.innerText = convertToTime(us.published);
        date.style.fontSize = '10px';
        appendChilds(cs, [u, createElement('br'), createElement('br'), c, createElement('br'), date, createElement('br')]);
        return document.getElementsByClassName('modal-content')[0];
    }, document.getElementsByClassName('modal-content')[0]);
}

/**
 * Loads user feed
 */
function loadFeed() {
    const userToken = checkStore('user');
    api.makeAPIRequest('user/feed', optionsNoBody({ 'Content-Type': 'application/json', Authorization: `Token ${userToken}`}, 'GET'))
        .then(data => appendPosts(data.posts))
        .then(() => addLike(userToken))
        .then(() => addViewLikes(userToken))
        .then(() => addViewComments(userToken));
}

function createButton(text, id) {
    const b = createElement('button');
    b.className = 'submit-buttons';
    b.innerText = text;
    b.id = id;
    return b;
}

/**
 * Changes page from formA to formB
 * @param {*} formA 
 * @param {*} formB 
 */
function formChange(formA, formB) {
    const x = document.getElementById(formA);
    const y = document.getElementById(formB);
    
    x.style.display = 'none';
    y.style.display = 'inline-block';
    for (var box of document.getElementsByClassName('input-text-boxes')) {
        box.value = '';
    }
}

/**
 * Creates div element
 * @param {*} id 
 * @param {*} width 
 */
function createFormDiv(id, width) {
    const div = createElement('div');
    div.className = 'main-content-box';
    div.id = id;
    div.style.width = width;
    return div;
}

function initProfile() {
    const userToken = checkStore('user');
    const pId = checkStore('id');
    api.makeAPIRequest('post/?id='+pId, optionsNoBody({'Content-Type': 'application/json', Authorization: `Token ${userToken}`}, 'GET'))    
        .then(info => {
            const username = info.username;
            const name = info.name;
            const email = info.email;
        });
}

// create pages
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
appendChilds(loginForm, [header('LOGIN'), userLabel1, username.cloneNode(), passLabel1, password.cloneNode(), createElement('br'), createElement('br'), createElement('br'), submitL]);
appendChilds(registerForm, [header('SIGNUP'), nameLabel, name, createElement('br'), emailLabel, email, userLabel, username, passLabel, password, createElement('br'), createElement('br'), createElement('br'), submitR]);
appendChilds(body, [createModal('COMMENTS'), createModal('LIKED BY'), feed, loginForm, registerForm, profileForm]);

// reload feed page when user refreshes
if (checkStore('user')) {
    login.innerText = 'LOGOUT';
    register.innerText = 'PROFILE';
    formChange('registerForm', 'feed');
    formChange('profileForm', 'feed');
    formChange('loginForm', 'feed');
    loadFeed();
}

/*
// Potential example to upload an image
/*const input = document.querySelector('input[type="file"]');

input.addEventListener('change', uploadImage);*/
