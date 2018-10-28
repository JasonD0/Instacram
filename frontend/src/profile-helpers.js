import { options, optionsNoBody, createElement, checkStore, uploadImage } from './helpers.js';
import { header, createLabel, appendChilds, removeChilds, createInputBox, addLabelAndText } from './html-helpers.js';
import { addUserPosts } from './main.js';
/**
 * Functions to create profile page
 */

/**
 * Create user profile
 */
export function initProfile(userId, api) {
    //window.localStorage.setItem('logged', 2);
    const userToken = checkStore('user');
    const id = (userId) ? userId : parseInt(checkStore('id'));
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
            appendProfileInformation(profile, info, userToken, id, api);
        });
}

/**
 * Adds user information to profile
 * @param {*} profile 
 * @param {*} info 
 */
function appendProfileInformation(profile, info, userToken, userId, api) {
    const userPosts = document.getElementById('userPosts');
    const profileForm = document.getElementById('profileForm');
    addLabelAndText(profile, 'Username: ', info.username, 'author');
    addLabelAndText(profile, 'Name: ', info.name, 'user-name');
    addLabelAndText(profile, 'Email: ', info.email, 'user-email');
    addLabelAndText(profile, 'Followers: ', info.followed_num);
    userPosts.appendChild(header('POSTS'), api);
    addUserPosts(info.posts, userToken);
    addLabelAndText(profile, 'Following: ', '', 'following');
    addLabelAndText(profile, 'Total Posts: ', info.posts.length, 'total-posts');
    addLabelAndText(profile, 'Total Likes: ', 0, 'total-likes');      
    if (userId == parseInt(checkStore('id'))) addUploadImage(profileForm, api);

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
function addUploadImage(profileForm, api) {
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
    imageInput.addEventListener('change', (event) => uploadImage(event, api));

    uploader.appendChild(imageInput);
    appendChilds(profileForm, [createElement('br'), createElement('br'), uploadLabel, description, uploader]);
}



/**
 * create modal for editing profile
 */
export function initEditProfile(api) {
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
        updateUserInfo(inputs, api);
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
function updateUserInfo(inputs, api) {
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
