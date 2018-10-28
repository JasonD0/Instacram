import { appendChilds, removeChilds } from './html-helpers.js';
import { addViewComments, addLikes, addViewLikes } from './modal-helpers.js';
import { initProfile, initEditProfile } from './profile-helpers.js';

/* returns an empty array of size max */
export const range = (max) => Array(max).fill(null);

/* returns a randomInteger */
export const randomInteger = (max = 1) => Math.floor(Math.random()*max);

/* returns a randomHexString */
const randomHex = () => randomInteger(256).toString(16);

/* returns a randomColor */
export const randomColor = () => '#'+range(3).map(randomHex).join('');

/**
 * You don't have to use this but it may or may not simplify element creation
 * 
 * @param {string}  tag     The HTML element desired
 * @param {any}     data    Any textContent, data associated with the element
 * @param {object}  options Any further HTML attributes specified
 */
export function createElement(tag, data, options = {}) {
    const el = document.createElement(tag);
    el.textContent = data;
   
    // Sets the attributes in the options object to the element
    return Object.entries(options).reduce(
        (element, [field, value]) => {
            element.setAttribute(field, value);
            return element;
        }, el);
}

/**
 * Given a post, return a tile with the relevant data
 * @param   {object}        post 
 * @returns {HTMLElement}
 */
export function createPostTile(post, api) {
    const section = createElement('section', null, { class: 'post' });
    const postId = post.id;
    const userToken = checkStore('user');
    section.appendChild(createElement('img', null, 
        { src: 'data:image/png;base64,' + post.src, alt: post.meta.description_text, class: 'post-image' }));

    const name = createElement('a');
    name.innerText = post.meta.author + '\n';
    name.className = 'name';
    viewUserProfile(post.meta.author, name, api);
    
    const description = createElement('p');
    description.innerText = '"' + post.meta.description_text + '"';
    description.style.textAlign = 'center';
    
    const numComments = (post.comments) ? post.comments.length : 0;
    const numLikes = (post.meta.likes) ? post.meta.likes.length : 0;
    window.localStorage.setItem(post.id, numLikes);
    
    const comments = addViewComments(numComments, postId, userToken, api);
    const likes = addLikes(numLikes, postId, userToken, api);
    const viewLikes = addViewLikes(postId, userToken, api);

    const date = createElement('i');
    date.className = 'date';
    date.innerText = convertToTime(post.meta.published);
    
    const del = createElement('a');
    del.className = 'del';
    del.innerText= 'Delete Post';

    appendChilds(section, [name, likes, viewLikes, description, comments, date]);

    return section;
}

/**
 * Clicking on a username  chnages current page to the profile page
 * @param {*} username 
 * @param {*} nameElement 
 * @param {*} api 
 */
export function viewUserProfile(username, nameElement, api) {
    const register = document.getElementById('register');
    nameElement.addEventListener('click', () => {
        const userToken = checkStore('user');
        document.getElementsByClassName('modal')[0].style.display = 'none';
        document.getElementsByClassName('modal')[1].style.display = 'none';
        api.makeAPIRequest('user/?username='+username, optionsNoBody({'Content-Type': 'application/json', Authorization: `Token ${userToken}`}, 'GET'))
            .then(userInfo => {
                // show profile page
                register.innerText = 'FEED';
                window.localStorage.setItem('profile', userInfo.id);
                initProfile(userInfo.id, api);
                formChange(checkStore('currentPage'), 'userPosts');
                formChange(checkStore('currentPage'), 'profileForm');
                window.localStorage.setItem('currentPage', 'profileForm');
            })
            .then(() => {
                window.localStorage.setItem('profile', -1);
            });
    });
}

// Given an input element of type=file, grab the data uploaded for use
export function uploadImage(event, api) {
    const [ file ] = event.target.files;
    const userToken = checkStore('user');
    const validFileTypes = [ 'image/jpeg', 'image/png', 'image/jpg' ]
    const valid = validFileTypes.find(type => type === file.type);

    // bad data, let's walk away
    if (!valid)
        return false;
    
    // if we get here we have a valid image
    const reader = new FileReader();
    
    reader.onload = (e) => {
        let dataURL = e.target.result;
        const description = document.getElementById('description').value;
        if (description === '') return;
        // post new image 
        dataURL = dataURL.replace(/^data:image\/png;base64,/, '');
        dataURL = dataURL.replace(/^data:image\/jpg;base64,/, '');
        dataURL = dataURL.replace(/^data:image\/jpeg;base64,/, '');
        api.makeAPIRequest('post/', options({ 'Content-Type': 'application/json', Authorization: `Token ${userToken}` }, 'POST', {description_text: description, src: dataURL}))
            .then(postId => {
                const id = postId.post_id;
                api.makeAPIRequest('post/?id='+id, optionsNoBody({'Content-Type': 'application/json', Authorization: `Token ${userToken}`}, 'GET'))
                    .then(imageInfo => {
                        // update page if post successful
                        document.getElementById('description').value = '';
                        const totalPostsCounter = document.getElementById('total-posts');
                        let x = parseInt(totalPostsCounter.innerText.replace(/\D+/g, ''));
                        totalPostsCounter.innerText = totalPostsCounter.innerText.replace(x, `${x+1}`);
                        document.getElementById('userPosts').insertAdjacentElement('afterbegin', createPostTile(imageInfo, api));
                    })
            });
    };

    // this returns a base64 image
    reader.readAsDataURL(file);
}

/**
 * Adds posts to feed
 * @param posts 
 */
export function appendPosts(parentElement, posts, api) {
    if (!posts) return;
    posts.reduce((parent, post) => {
        parent.appendChild(createPostTile(post, api));
        parent.appendChild(createElement('br'));
        return parent;
    }, parentElement);
}

/* 
    Reminder about localStorage
    window.localStorage.setItem('AUTH_KEY', someKey);
    window.localStorage.getItem('AUTH_KEY');
    localStorage.clear()
*/
export function checkStore(key) {
    if (window.localStorage)
        return window.localStorage.getItem(key)
    else
        return null

}

// create options for api requests without body
export function optionsNoBody(headers, method) {
    return {
        headers: headers,
        method: method
    }
}

// create options for api requests
export function options(headers, method, body) {
    return {
        headers: headers,
        method: method,
        body: JSON.stringify(body)
    }    
}

/**
 * Converts UNIX time stamp to readable time
 * @param {*} n 
 */
export function convertToTime(n) {
    let time = new Date(parseFloat(n)*1000);
    return time.toString();
}

/**
 * Changes page from pageA to pageB
 * @param {*} pageA 
 * @param {*} pageB 
 */
export function formChange(pageA, pageB) {
    window.localStorage.setItem('currentScrollHeight', 0);
    const x = document.getElementById(pageA);
    const y = document.getElementById(pageB);
    
    x.style.display = 'none';
    y.style.display = 'inline-block';
    for (var box of document.getElementsByClassName('input-text-boxes')) {
        box.value = '';
    }
}

/**
 * Changes page to home page
 * @param {*} data 
 */
export function homePage(data, api, feed) {
    if (data.token) {
        const register = document.getElementById('register');
        const login = document.getElementById('login');
        Array.from(document.getElementsByClassName('error')).map(element => element.style.display = 'none');
        window.localStorage.setItem('changesToFeedContent', 0);

        userSearchDisplay('inline-block');

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
                loadFeed(api, feed, true);
                initEditProfile(api);
            });
    }
}

/**
 * Loads user feed
 */
export function loadFeed(api, feed, loadProfile) {
    removeChilds(feed);
    window.localStorage.setItem('changesToFeedContent', 0);
    const userToken = checkStore('user');
    api.makeAPIRequest('user/feed', optionsNoBody({ 'Content-Type': 'application/json', Authorization: `Token ${userToken}`}, 'GET'))
    .then(data => {
        if (data.posts) window.localStorage.setItem('feedPosts', data.posts.length);
        appendPosts(feed, data.posts, api);
    })
    .then(() => {
        if (loadProfile) initProfile(null, api);
    });
}

/**
 * Show/Hide search bar for users to follow/unfollow
 * @param {*} displayType 
 */
export function userSearchDisplay(displayType) {
    document.getElementById('follow').style.display = displayType;
    document.getElementById('un-follow').style.display = displayType;
    document.getElementById('follow-input').style.display = displayType;
}
