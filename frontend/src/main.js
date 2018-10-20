// importing named exports we use brackets
import { convertToTime, options, optionsNoBody, removeChilds, createPostTile, uploadImage, header, createElement, appendChilds, createLabel, createInputBox, checkStore } from './helpers.js';

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
        formChange(checkStore('currentPage'), 'loginForm');
        formChange('userPosts', 'loginForm');
        register.innerText = 'REGISTER';
        login.innerText = 'LOGIN';
        removeChilds(feed);
        removeChilds(profileForm);
        removeChilds(userPosts);
        window.localStorage.clear();
    }   
    window.localStorage.setItem('currentPage', 'loginForm');
});

// register 'button' functionality
const register = document.getElementById('register');
register.innerText = 'REGISTER';
register.addEventListener('click', ()=>{
    // change page to register
    if (register.innerText === 'REGISTER') {
        formChange('loginForm', 'registerForm');
        window.localStorage.setItem('currentPage', 'registerForm');
        // change page to profile
    } else if (register.innerText === 'PROFILE') {
        register.innerText = 'FEED';
        if (checkStore('logged') == 1) initProfile();
        formChange(checkStore('currentPage'), 'profileForm');
        formChange(checkStore('currentPage'), 'userPosts');
        window.localStorage.setItem('currentPage', 'profileForm');
    // change page to feed
    } else {
        register.innerText = 'PROFILE';
        formChange(checkStore('currentPage'), 'feed');
        formChange('userPosts', 'feed');
        window.localStorage.setItem('currentPage', 'feed');
    }
});


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
const userPosts = createFormDiv('userPosts', '700px');
userPosts.style.display = 'none';

/**
 * Changes page to home page
 * @param {*} data 
 */
function homePage(data) {
    window.localStorage.setItem('logged', 1);
    if (data.token) {
        formChange(checkStore('currentPage'), 'feed');
        window.localStorage.setItem('currentPage', 'feed');
        window.localStorage.setItem('user', data.token);
        register.innerText = 'PROFILE';
        login.innerText = 'LOGOUT';
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
        .then(data => {
            if (data.message) {
                error.innerText = data.message;
                error.style.display = 'block';
            } else {
                homePage(data);
                error.style.display = 'none';
            }
        });
    });

// signup button
const submitR = createButton('Signup', 'submit');
submitR.addEventListener('click', () => {
    const tb = Array.from(document.getElementsByClassName('input-text-boxes')).slice(2, 6);
    api.makeAPIRequest('auth/signup', options({ 'Content-Type': 'application/json' }, 'POST', {username:  tb[2].value, password: tb[3].value, email: tb[1].value, name: tb[0].value})) 
        .then(data => {
            if (data.message) {
                error1.innerText = data.message;
                error1.style.display = 'block';
            } else {
                homePage(data);
                error1.style.display = 'none';
            }
        });
    });


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
function appendPosts(parentElement, posts) {
    posts.reduce((parent, post) => {
        parent.appendChild(createPostTile(post, api));
        parent.appendChild(createElement('br'));
        return parent;
    }, parentElement);
}

function addLabelAndText(parent, labelText, text, id) {
    const label = createLabel(labelText, 'p');
    label.style.fontSize = '20px';
    label.style.fontWeight = 'bold';
    const text_ = createElement('i');
    text_.id = id;
    text_.style.color = 'white';
    text_.innerText = text;
    if (labelText === 'Following: ') appendChilds(parent, [label, createElement('br'), text_, createElement('br')]);
    else appendChilds(parent, [label, text_, createElement('br')]);
}

function initProfile() {
    window.localStorage.setItem('logged', 2);
    const userToken = checkStore('user');
    const id = checkStore('id');
    api.makeAPIRequest('user/?id='+id, optionsNoBody({'Content-Type': 'application/json', Authorization: `Token ${userToken}`}, 'GET'))    
        .then(info => {
                const profile = document.getElementById('profileForm');
                const header = createElement('h1');
                header.style.color = 'white';
                header.style.textAlign = 'center';
                header.innerText = 'PROFILE';
                profile.appendChild(header);
                addLabelAndText(profile, 'Username: ', info.username);
                addLabelAndText(profile, 'Name: ', info.name);
                addLabelAndText(profile, 'Email: ', info.email);
                addLabelAndText(profile, 'Followers: ', info.followed_num);
                addLabelAndText(profile, 'Following: ', '', 'following');
                const followingInfo = info.following;
                followingInfo.map(user => {
                    api.makeAPIRequest('user/?id='+user, optionsNoBody({'Content-Type': 'application/json', Authorization: `Token ${userToken}`}, 'GET'))
                    .then(userInfo => {
                        const following = document.getElementById('following');
                        if (following) following.innerText += userInfo.name + ',\u00A0';
                    });
                });
                const userPostsLabel = createLabel('YOUR POSTS', 'h1');
                userPosts.appendChild(userPostsLabel);
                addUserPosts(profile, info.posts, userToken);
            });
    }

function addUploadImage(profileForm) {
    const uploadLabel = createLabel('Upload Post: ', 'p');
    uploadLabel.style.fontSize = '20px';
    uploadLabel.style.fontWeight = 'bold';
    const description = createElement('textarea', null, {id: 'description'});
    description.required = true;
    description.placeholder = 'Enter image description (required)';
    const uploader = createElement('label', null, {id: 'upload'});
    uploader.innerText = 'Upload Image';
    const imageInput = createElement('input');
    imageInput.type = 'file';
    imageInput.addEventListener('change', () => {
        uploadImage(event, api);
    });
    uploader.appendChild(imageInput);
    appendChilds(profileForm, [createElement('br'), createElement('br'), uploadLabel, description, uploader]);
}

function addUserPosts(profile, posts, userToken) {
    const up = document.getElementById('userPosts');
    var s = [];
    var totalLikes = 0;
    posts.map(post => {
        api.makeAPIRequest('post/?id='+post, optionsNoBody({'Content-Type': 'application/json', Authorization: `Token ${userToken}`}, 'GET'))
            .then(postInfo => {
                totalLikes += postInfo.meta.likes.length;
                s.unshift(postInfo);
                if (s.length == posts.length) {
                    appendPosts(up, s);
                    addLabelAndText(profile, 'Total Likes: ', totalLikes);               
                    addUploadImage(profileForm);
                }
            });
        });
}
    
/**
 * Loads user feed
 */
function loadFeed() {
    const userToken = checkStore('user');
    api.makeAPIRequest('user/feed', optionsNoBody({ 'Content-Type': 'application/json', Authorization: `Token ${userToken}`}, 'GET'))
        .then(data => {
            appendPosts(feed, data.posts);
        })
        .then(() => initProfile())
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

// create pages
const username = createInputBox('text', 'Enter username');
const password = createInputBox('password', 'Enter password');
const name = createInputBox('text', 'Enter name');
const email = createInputBox('text', 'Enter email');
const userLabel = createLabel('Username:', 'h2');
const userLabel1 = createLabel('Username:', 'h2');
const passLabel = createLabel('Password:', 'h2');
const passLabel1 = createLabel('Password:', 'h2');
const nameLabel = createLabel('Name:', 'h2');
const emailLabel = createLabel('Email:', 'h2');
const error = createElement('i', null, {id: 'error'});
const error1 = createElement('i', null, {id: 'error'});
appendChilds(loginForm, [header('LOGIN'), error, createElement('br'), userLabel1, username.cloneNode(), passLabel1, password.cloneNode(), createElement('br'), createElement('br'), createElement('br'), submitL]);
appendChilds(registerForm, [header('SIGNUP'), error1, createElement('br'), nameLabel, name, createElement('br'), emailLabel, email, userLabel, username, passLabel, password, createElement('br'), createElement('br'), createElement('br'), submitR]);
appendChilds(body, [createModal('COMMENTS'), createModal('LIKED BY'), feed, loginForm, registerForm, profileForm, userPosts]);

// reload feed page when user refreshes
if (checkStore('user')) {
    login.innerText = 'LOGOUT';
    if (checkStore('currentPage') === 'profileForm') {
        register.innerText = 'FEED';
        formChange('loginForm', 'userPosts');
    } else {
        register.innerText = 'PROFILE';
    }
    formChange('loginForm', checkStore('currentPage'));
    window.localStorage.setItem('logged', 1);
    loadFeed();
} else {
    window.localStorage.setItem('currentPage', 'loginForm');
}

