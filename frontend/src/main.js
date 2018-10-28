// importing named exports we use brackets
import { options, optionsNoBody, createElement, checkStore, formChange, appendPosts, userSearchDisplay, loadFeed, homePage } from './helpers.js';
import { header, createLabel, createInputBox, createFormDiv, createButton, appendChilds, removeChilds, createModal } from './html-helpers.js';
import { initProfile, initEditProfile } from './profile-helpers.js';

// when importing 'default' exports, use below syntax
import API from './api.js';

const api  = new API();
var userPostsList = [];

// get feed body
const body = document.getElementById('large-feed');

// create pages for login, register, feed, user posts and profile 
const loginForm = createFormDiv('loginForm', '400px');
const registerForm = createFormDiv('registerForm', '400px');
registerForm.style.display = 'none';
const feed = createFormDiv('feed', '700px');
feed.style.display = 'none';
const profileForm = createFormDiv('profileForm', '400px');
profileForm.style.display = 'none';
const userPosts = createFormDiv('userPosts', '700px');
userPosts.style.display = 'none';

// navigation item for login/logout
const login = document.getElementById('login');
login.innerText = 'LOGIN';
login.addEventListener('click', ()=>{
    if (login.innerText === 'LOGIN') {
        formChange('registerForm', 'loginForm');
    } else {
        // LOGOUT
        userSearchDisplay('none');

        // change pages and navigation text
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

// navigation item for register/feed/profile
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
        if (parseInt(checkStore('profile')) == -1) {
            window.localStorage.setItem('profile', checkStore('id'));
            initProfile(null, api);
        }
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
    window.scrollTo(0,0);
});

// follow button to follow user searched in search bar
const followButton = document.getElementById('follow');
followButton.addEventListener('click', () => {
    const user = document.getElementById('follow-input');
    const userToken = checkStore('user');
    api.makeAPIRequest('user/follow?username='+user.value, optionsNoBody({ 'Content-Type': 'application/json', Authorization: `Token ${userToken}` }, 'PUT'))
        .then(data => {
            if (data.message !== 'success') {
                user.value = data.message;
            // update page if follow successful
            } else if (data.message === 'success') {
                const userName = document.getElementById('author').innerText;
                const following = document.getElementById('following');
                if (following && userName === checkStore('author')) following.innerText += user.value + ',\u00A0';
                user.value = '';
                loadFeed(api, feed, null);
            }
        });
});

// unfollow button to unfollow user searched in search bar
const unfollowButton = document.getElementById('un-follow');
unfollowButton.addEventListener('click', () => {
    const user = document.getElementById('follow-input');
    const userToken = checkStore('user');
    api.makeAPIRequest('user/unfollow?username='+user.value, optionsNoBody({ 'Content-Type': 'application/json', Authorization: `Token ${userToken}` }, 'PUT'))
        .then(data => {
            if (data.message !== 'success') {
                user.value = data.message;
            // update page if unfollow successful
            } else if (data.message === 'success') {
                const userName = document.getElementById('author').innerText;
                const following = document.getElementById('following');
                if (following && userName === checkStore('author')) following.innerText = following.innerText.replace(user.value + ',\u00A0', '');
                user.value = '';
                loadFeed(api, feed, true);
            }
        });
});

// login button
const submitL = createButton('Login', 'submit');
submitL.addEventListener('click', () => {
    const tb = document.getElementsByClassName('input-text-boxes');
    // request login  get token
    api.makeAPIRequest('auth/login', options({ 'Content-Type': 'application/json' }, 'POST', {username: tb[0].value, password: tb[1].value}))
        .then(data => {
            // if fail then show error message
            if (data.message) {
                error.innerText = data.message;
                error.style.display = 'block';
            // go to home page
            } else {
                homePage(data, api, feed);
            }
        });
    });

// signup button
const submitR = createButton('Signup', 'submit');
submitR.addEventListener('click', () => {
    const tb = Array.from(document.getElementsByClassName('input-text-boxes')).slice(2, 6);
    // request signup  get token
    api.makeAPIRequest('auth/signup', options({ 'Content-Type': 'application/json' }, 'POST', {username:  tb[2].value, password: tb[3].value, email: tb[1].value, name: tb[0].value})) 
        .then(data => {
            // if fail then show error message
            if (data.message) {
                error1.innerText = data.message;
                error1.style.display = 'block';
            // go to home page
            } else {
                homePage(data, api, feed);
            }
        });
    });

window.localStorage.setItem('currentScrollHeight', 0);
// adds infinite scroll to window
window.addEventListener('scroll', () => {
    const windowHeight = document.body.scrollHeight;
    let x = (checkStore('currentScrollHeight')) ? parseInt(checkStore('currentScrollHeight')) : 0;
    const currentHeight = window.scrollY - x;
    const currPage = document.getElementById('register');
    const userToken = checkStore('user');
    const p = parseInt(checkStore('feedPosts'));
    const n = 5;
    const feed = document.getElementById('feed');
    
    // appends posts when user scrolled past fixed percentage
    if (currentHeight/windowHeight > 0.4) {
        window.localStorage.setItem('currentScrollHeight', currentHeight);
        // add posts to feed         
        if (currPage.innerText === 'PROFILE') {
            api.makeAPIRequest('user/feed?p='+p+'&n='+n, optionsNoBody({ 'Content-Type': 'application/json', Authorization: `Token ${userToken}`}, 'GET'))
            .then(data => {
                if (data && data.posts.length > 0) appendPosts(feed, data.posts, api);
            });
            window.localStorage.setItem('feedPosts', p+n);
            
        // add posts to user profile posts
        } else if (currPage.innerText === 'FEED') {
            const userPostsSection = document.getElementById('userPosts');
            const q = parseInt(checkStore('userPosts'));
            const m = (userPostsList.length < q+5) ? q + (userPostsList.length - q): q+5;
            if (q != m) {
                appendPosts(userPostsSection, userPostsList.slice(q, m), api);
                window.localStorage.setItem('userPosts', m);
            }
        }
    }
});

// login/signup page labels and input boxes
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
const error = createElement('i', null, {class: 'error'});
const error1 = createElement('i', null, {class: 'error'});

// adds pages to html
appendChilds(loginForm, [header('LOGIN'), error, createElement('br'), userLabel1, username.cloneNode(), passLabel1, password.cloneNode(), createElement('br'), createElement('br'), createElement('br'), submitL]);
appendChilds(registerForm, [header('SIGNUP'), error1, createElement('br'), nameLabel, name, createElement('br'), emailLabel, email, userLabel, username, passLabel, password, createElement('br'), createElement('br'), createElement('br'), submitR]);
appendChilds(body, [createModal('COMMENTS'), createModal('LIKED BY'), createModal('EDIT PROFILE'), feed, loginForm, registerForm, profileForm, userPosts]);

// reload feed page when user refreshes
if (checkStore('user')) {
    window.scrollTo(0,0);
    window.localStorage.setItem('currentScrollHeight', 0);
    userSearchDisplay('inline-block');
    
    // change navigation text and change page to previous page before reload
    login.innerText = 'LOGOUT';
    if (checkStore('currentPage') === 'profileForm') {
        register.innerText = 'FEED';
        formChange('loginForm', 'userPosts');
    } else {
        register.innerText = 'PROFILE';
    }
    formChange('loginForm', checkStore('currentPage'));
    loadFeed(api, feed, true);
    initEditProfile(api);
} else {
    window.localStorage.setItem('currentPage', 'loginForm');
}


/**
 * Adds first 10 posts of the user's posts 
 * @param {*} posts 
 * @param {*} userToken 
 */
export function addUserPosts(postIds, userToken) {
    const up = document.getElementById('userPosts');
    var s = [];
    var totalLikes = 0;
    postIds.map(postId => {
        // get post info 
        api.makeAPIRequest('post/?id='+postId, optionsNoBody({'Content-Type': 'application/json', Authorization: `Token ${userToken}`}, 'GET'))
            .then(postInfo => {
                totalLikes += postInfo.meta.likes.length;
                s.unshift(postInfo);
                // when finished getting all post info  adds posts to user posts html
                if (s.length == postIds.length) {
                    userPostsList = s.sort((a, b) => {
                        return parseFloat(b.meta.published) - parseFloat(a.meta.published);
                    });
                    window.localStorage.setItem('userPosts', (s.length < 10) ? s.length : 10);
                    appendPosts(up, s.slice(0, parseInt(checkStore('userPosts'))), api);
                    document.getElementById('total-likes').innerText = totalLikes;
                }
            });
    });
}
