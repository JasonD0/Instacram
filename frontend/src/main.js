// importing named exports we use brackets
import { options, optionsNoBody, createPostTile, uploadImage, createElement, checkStore, formChange } from './helpers.js';
import { header, createLabel, createInputBox, createFormDiv, createButton, appendChilds, removeChilds, addLabelAndText, createModal } from './html-helpers.js';

// when importing 'default' exports, use below syntax
import API from './api.js';

const api  = new API();
var userPostsList = [];

// navigation item for login/logout
const login = document.getElementById('login');
login.innerText = 'LOGIN';
login.addEventListener('click', ()=>{
    if (login.innerText === 'LOGIN') {
        formChange('registerForm', 'loginForm');
    } else {
        // LOGOUT
        // remove user search bar for following/unfollowing
        document.getElementById('follow').style.display = 'none';
        document.getElementById('un-follow').style.display = 'none';
        document.getElementById('follow-input').style.display = 'none';

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
        if (checkStore('profile') == -1) {
            window.localStorage.setItem('profile', -2);
            initProfile();
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
            if (data.message === 'User Not Found') {
                user.value = data.message;
            } else if (data.message === 'success') {
                const following = document.getElementById('following');
                if (following) following.innerText += user.value + ',\u00A0';
                user.value = '';
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
            if (data.message === 'User Not Found') {
                user.value = data.message;
            } else if (data.message === 'success') {
                const following = document.getElementById('following');
                if (following) following.innerText = following.innerText.replace(user.value + ',\u00A0', '');
                user.value = '';
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
                homePage(data);
                error.style.display = 'none';
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
                homePage(data);
                error1.style.display = 'none';
            }
        });
    });

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

/**
 * Changes page to home page
 * @param {*} data 
 */
function homePage(data) {
    if (data.token) {
        window.localStorage.setItem('changesToFeedContent', 0);

        // show search bar for following/unfollowing user
        document.getElementById('follow').style.display = 'inline-block';
        document.getElementById('un-follow').style.display = 'inline-block';
        document.getElementById('follow-input').style.display = 'inline-block';

        // change navigation 
        formChange(checkStore('currentPage'), 'feed');
        window.localStorage.setItem('currentPage', 'feed');
        window.localStorage.setItem('user', data.token);
        register.innerText = 'PROFILE';
        login.innerText = 'LOGOUT';
        
        const userToken = data.token;
        // store user id and username
        api.makeAPIRequest('user/', optionsNoBody({'Content-Type': 'application/json', Authorization: `Token ${userToken}`}, 'GET'))
            .then(data => {
                window.localStorage.setItem('id', data.id);
                window.localStorage.setItem('author', data.username);
            })
            // load feed and profile
            .then(() => {
                loadFeed();
                initEditProfile();
            });
    }
}

/**
 * Adds posts to feed
 * @param posts 
 */
function appendPosts(parentElement, posts) {
    if (!posts) return;
    posts.reduce((parent, post) => {
        parent.appendChild(createPostTile(post, api));
        parent.appendChild(createElement('br'));
        return parent;
    }, parentElement);
}

/**
 * create modal for editing profile
 */
export function initEditProfile() {
    removeChilds(document.getElementsByClassName('modal-content')[2]);
    const modal = document.getElementsByClassName('modal')[2];
    const content = document.getElementsByClassName('modal-content')[2];
    content.style.height = '300px';
    content.style.textAlign = 'center';

    addEditProfileElements(content);    

    // done 'button' to update new user information
    const done = createElement('a');
    done.innerText = 'Done';
    done.addEventListener('click', () => {
        const inputs = document.getElementsByClassName('input-text-boxes1');
        updateUserInfo(inputs);
        for (var box of inputs) box.value = '';
        modal.style.display = 'none';
    });
    appendChilds(content, [createElement('br'), createElement('br'), done]);
    modal.appendChild(content);
}

/**
 * Adds edit profile modal elements 
 * @param {*} content 
 */
function addEditProfileElements(content) {
    const mess = createElement('i');
    mess.innerText = 'Change at least one field';
    const password = createInputBox('password', 'Enter password', 1);
    const name = createInputBox('text', 'Enter name', 1);
    const email = createInputBox('text', 'Enter email', 1);    
    const passLabel = createLabel('New Password:', 'h2');
    const nameLabel = createLabel('New Name:', 'h2');
    const emailLabel = createLabel('New Email:', 'h2');
    appendChilds(content, [mess, createElement('br'), nameLabel, name, passLabel, password, emailLabel, email]);
}

/**
 * Updates user information
 * @param {*} inputs 
 */
function updateUserInfo(inputs) {
    const userToken = checkStore('user');
    const b = {};
    if (inputs[2].value) b.email = inputs[2].value; 
    if (inputs[0].value) b.name = inputs[0].value;
    if (inputs[1].value) b.password = inputs[1].value;
    // request to update to new user information
    api.makeAPIRequest('user/', options({Authorization: `Token ${userToken}`, 'Content-Type': 'application/json'}, 'PUT', b))
        .then(data => {
            if (data.msg === 'success') {
                if (b.name) document.getElementById('user-name').innerText = b.name;
                if (b.email) document.getElementById('user-email').innerText = b.email;
            }
        });
}

/**
 * Create user profile
 */
export function initProfile(userId) {
    //window.localStorage.setItem('logged', 2);
    const userToken = checkStore('user');
    const id = (userId) ? userId : checkStore('id');
    removeChilds(document.getElementById('profileForm'));
    removeChilds(document.getElementById('userPosts'));
    // get user information
    api.makeAPIRequest('user/?id='+id, optionsNoBody({'Content-Type': 'application/json', Authorization: `Token ${userToken}`}, 'GET'))    
        .then(info => {
            const profile = document.getElementById('profileForm');
            profile.appendChild(header('PROFILE'));
            
            // 'button' for showing modal to edit user information
            if (userId == parseInt(checkStore('id')) || !userId) {
                const edit = createElement('a');
                edit.innerText = 'Edit Profile';
                edit.addEventListener('click', () => {
                    const modal = document.getElementsByClassName('modal')[2];
                    modal.style.display = 'block';
                });
                appendChilds(profile, [edit, createElement('br')]);
            }
            appendProfileInformation(profile, info, userToken, id);
        });
}

/**
 * Adds user information to profile
 * @param {*} profile 
 * @param {*} info 
 */
function appendProfileInformation(profile, info, userToken, userId) {
    addLabelAndText(profile, 'Username: ', info.username, 'author');
    addLabelAndText(profile, 'Name: ', info.name, 'user-name');
    addLabelAndText(profile, 'Email: ', info.email, 'user-email');
    addLabelAndText(profile, 'Followers: ', info.followed_num);
    userPosts.appendChild(header('POSTS'));
    addUserPosts(info.posts, userToken);
    addLabelAndText(profile, 'Following: ', '', 'following');
    addLabelAndText(profile, 'Total Posts: ', info.posts.length, 'total-posts');
    addLabelAndText(profile, 'Total Likes: ', 0, 'total-likes');      
    if (userId == parseInt(checkStore('id'))) addUploadImage(profileForm);

    // get people the user is following
    const followingInfo = info.following;
    followingInfo.map(user => {
        // get user name from user ids
        api.makeAPIRequest('user/?id='+user, optionsNoBody({'Content-Type': 'application/json', Authorization: `Token ${userToken}`}, 'GET'))
        .then(userInfo => {
            const following = document.getElementById('following');
            if (following) following.innerText += userInfo.username + ',\u00A0';
        });
    });
}

/**
 * Create elements to allow user to post new image
 * @param {*} profileForm 
 */
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
    imageInput.addEventListener('change', () => uploadImage(event, api));

    uploader.appendChild(imageInput);
    appendChilds(profileForm, [createElement('br'), createElement('br'), uploadLabel, description, uploader]);
}

/**
 * Adds first 10 posts of the user's posts 
 * @param {*} posts 
 * @param {*} userToken 
 */
function addUserPosts(postIds, userToken) {
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
                userPostsList = s;
                window.localStorage.setItem('userPosts', (s.length < 10) ? s.length : 10);
                appendPosts(up, s.slice(0, parseInt(checkStore('userPosts'))));
                document.getElementById('total-likes').innerText = totalLikes;
            }
        });
    });
}
    
/**
 * Loads user feed
 */
function loadFeed() {
    window.localStorage.setItem('changesToFeedContent', 0);
    const userToken = checkStore('user');
    api.makeAPIRequest('user/feed', optionsNoBody({ 'Content-Type': 'application/json', Authorization: `Token ${userToken}`}, 'GET'))
    .then(data => {
        if (data.posts) window.localStorage.setItem('feedPosts', data.posts.length);
        appendPosts(feed, data.posts);
    })
    .then(() => initProfile());
}

// adds infinite scroll to window
window.addEventListener('scroll', () => {
    const windowHeight = document.body.scrollHeight;
    const currentHeight = window.scrollY;
    const currPage = document.getElementById('register');
    const userToken = checkStore('user');
    const p = checkStore('feedPosts');
    const n = 5;
    const feed = document.getElementById('feed');
    
    if (currentHeight/windowHeight > 0.4 && p) {
        // add posts to feed         
        if (currPage.innerText === 'PROFILE') {
            api.makeAPIRequest('user/feed?p='+p+'&n='+n, optionsNoBody({ 'Content-Type': 'application/json', Authorization: `Token ${userToken}`}, 'GET'))
            .then(data => {
                if (data.posts.length > 0) appendPosts(feed, data.posts);
            });
            window.localStorage.setItem('feedPosts', p+n);
            
        // add posts to user profile posts
        } else if (currPage.innerText === 'FEED') {
            const userPostsSection = document.getElementById('userPosts');
            const q = parseInt(checkStore('userPosts'));
            const m = (userPostsList.length < q+5) ? q + (userPostsList.length - q): q+5;
            if (q != m) {
                appendPosts(userPostsSection, userPostsList.slice(q, m));
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
const error = createElement('i', null, {id: 'error'});
const error1 = createElement('i', null, {id: 'error'});

// adds pages to html
appendChilds(loginForm, [header('LOGIN'), error, createElement('br'), userLabel1, username.cloneNode(), passLabel1, password.cloneNode(), createElement('br'), createElement('br'), createElement('br'), submitL]);
appendChilds(registerForm, [header('SIGNUP'), error1, createElement('br'), nameLabel, name, createElement('br'), emailLabel, email, userLabel, username, passLabel, password, createElement('br'), createElement('br'), createElement('br'), submitR]);
appendChilds(body, [createModal('COMMENTS'), createModal('LIKED BY'), createModal('EDIT PROFILE'), feed, loginForm, registerForm, profileForm, userPosts]);

// reload feed page when user refreshes
if (checkStore('user')) {
    // show user search bar for following/unfollowing
    document.getElementById('follow').style.display = 'inline-block';
    document.getElementById('un-follow').style.display = 'inline-block';
    document.getElementById('follow-input').style.display = 'inline-block';

    // change navigation text and change page to previous page before reload
    login.innerText = 'LOGOUT';
    if (checkStore('currentPage') === 'profileForm') {
        register.innerText = 'FEED';
        formChange('loginForm', 'userPosts');
    } else {
        register.innerText = 'PROFILE';
    }
    formChange('loginForm', checkStore('currentPage'));
    loadFeed();
    initEditProfile();
} else {
    window.localStorage.setItem('currentPage', 'loginForm');
}

