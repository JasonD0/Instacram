import { appendChilds } from './html-helpers.js';
import { addViewComments, addLikes, addViewLikes } from './modal-helpers.js';

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

    appendChilds(section, [name, likes, viewLikes, description, comments, date]);

    return section;
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
        api.makeAPIRequest('post/', options({ 'Content-Type': 'application/json', Authorization: `Token ${userToken}` }, 'POST', {description_text: description, src: dataURL}))
            .then(postId => {
                const id = postId.post_id;
                api.makeAPIRequest('post/?id='+id, optionsNoBody({'Content-Type': 'application/json', Authorization: `Token ${userToken}`}, 'GET'))
                    .then(imageInfo => {
                        document.getElementById('userPosts').insertAdjacentElement('afterbegin', createPostTile(imageInfo, api));
                    })
            });
    };

    // this returns a base64 image
    reader.readAsDataURL(file);
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
    const x = document.getElementById(pageA);
    const y = document.getElementById(pageB);
    
    x.style.display = 'none';
    y.style.display = 'inline-block';
    for (var box of document.getElementsByClassName('input-text-boxes')) {
        box.value = '';
    }
}
