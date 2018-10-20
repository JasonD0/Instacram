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
    name.innerText = post.meta.author + "\n";
    name.className = 'name';
    
    const description = createElement('p');
    description.innerText = '\"' + post.meta.description_text + '\"';
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

/**
 * Allows user to see comments of the post
 * @param {*} numComments 
 * @param {*} postId 
 * @param {*} userToken 
 * @param {*} api 
 */
function addViewComments(numComments, postId, userToken, api) {
    const comments = createElement('a');
    comments.innerText = 'View all ' + numComments + ' comments\n\u00A0\n'; 
    comments.className = 'comments';
    comments.addEventListener('click', () => {
        document.getElementsByClassName('modal')[0].style.display = 'block';
        removeChilds(document.getElementsByClassName('modal-content')[0]);
        api.makeAPIRequest('post/?id='+postId, optionsNoBody({'Content-Type': 'application/json', Authorization: `Token ${userToken}`}, 'GET'))
            .then(data => addCommentModalContents(data));
        });
    return comments;    
}

/**
 * Allows user to see list of users that liked the post
 * @param {*} postId 
 * @param {*} userToken 
 * @param {*} api 
 */
function addViewLikes(postId, userToken, api) {
    const viewLikes = createElement('a');
    viewLikes.innerText = 'View likes';
    viewLikes.className = 'viewLikes';
    viewLikes.addEventListener('click', () => {
        document.getElementsByClassName('modal')[1].style.display = 'block';
        removeChilds(document.getElementsByClassName('modal-content')[1]);
        api.makeAPIRequest('post/?id='+postId, optionsNoBody({'Content-Type': 'application/json', Authorization: `Token ${userToken}`}, 'GET'))
            .then(data => addLikeModalContent(data, userToken, api));
    });
    return viewLikes;
}

/**
 * Adds like functionality to all like 'buttons'
 * @param {*} numLikes 
 * @param {*} postId 
 * @param {*} userToken 
 * @param {*} api 
 */
function addLikes(numLikes, postId, userToken, api) {
    const likes = createElement('a');
    likes.innerText = '\n\u00A0\u00A0\u00A0 ❤ ' + numLikes + ' likes ·'; 
    likes.className = 'likes';
    likes.addEventListener('click', () => {
        api.makeAPIRequest('post/like?id='+postId, optionsNoBody({'Content-Type': 'application/json', Authorization: `Token ${userToken}`}, 'PUT'))
        .then(() => {
            updateLikes(likes, postId, userToken, api);         
        });
    });
    return likes;
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
 * Updates like count for a post
 * @param {*} likeAction 
 * @param {*} postId 
 * @param {*} userToken 
 */
function updateLikes(likeButton, postId, userToken, api) {
    api.makeAPIRequest('post/?id='+postId, optionsNoBody({'Content-Type': 'application/json', Authorization: `Token ${userToken}`}, 'GET'))
    .then(data => {
        let x = parseInt(likeButton.innerText.replace(/\D+/g, ''));
        // user unliked
        if (data.meta.likes.length <= parseInt(checkStore(postId))) {
            window.localStorage.setItem(postId, x-1);
            api.makeAPIRequest('post/unlike?id='+postId, optionsNoBody({'Content-Type': 'application/json', Authorization: `Token ${userToken}`}, 'PUT'));                                
            if (x > 0) likeButton.innerText = likeButton.innerText.replace(x, `${x-1}`);
        // user liked
        } else {
            window.localStorage.setItem(postId, x+1);
            likeButton.innerText = likeButton.innerText.replace(x, `${x+1}`);
        }                  
    });
}

   /**
 * Add users that liked the post to pop-up modal
 * @param {*} data 
 * @param {*} userToken 
 */
function addLikeModalContent(data, userToken, api) {
    const userLikes = data.meta.likes; 
    userLikes.reduce((cs, us) => {
        const u = createElement('a', null, {class: 'user'});
        u.style.fontSize = '15px';
        // convert id to name
        api.makeAPIRequest('user/?id='+us, optionsNoBody({'Content-Type': 'application/json', Authorization: `Token ${userToken}`}, 'GET'))
        .then(userInfo => {
            u.innerText = userInfo.username;   
        });
        appendChilds(cs, [u, createElement('br'), createElement('br')]);
        return document.getElementsByClassName('modal-content')[1];
    }, document.getElementsByClassName('modal-content')[1]);
}

// create options for api requests without body
export function optionsNoBody(headers, method) {
    return {
        headers: headers,
        method: method
    }
}

/**
 * Remove all child elements of a parent
 * @param {*} element 
 */
export function removeChilds(element) {
    let child = element.firstChild;
    while (child) {
        element.removeChild(child);
        child = element.firstChild;
    }
}

/**
 * Converts UNIX time stamp to readable time
 * @param {*} n 
 */
export function convertToTime(n) {
    let time = new Date(parseFloat(n)*1000);
    return time.toUTCString();
}


// create options for api requests
export function options(headers, method, body) {
    return {
        headers: headers,
        method: method,
        body: JSON.stringify(body)
    }    
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
        // do something with the data result
        let dataURL = e.target.result;
        const description = document.getElementById('description').value;
        if (description === '') {
            return;
        }
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

export function header(text) {
    const header = createElement('h1');
    header.innerText = text;
    header.style.fontSize = '50px';
    header.style.color = 'white';
    return header;
}

/**
 * Appends list of elements to a parent
 * @param {*} parent 
 * @param {*} childs 
 */
export function appendChilds(parent, childs) {
    for (var child of childs) {
        parent.appendChild(child);
    }
}

/**
 * Creates label with text
 * @param {*} text 
 */
export function createLabel(text, type) {
    const label = createElement(type);
    label.innerText = text;
    label.style.color = 'white';
    label.style.paddingRight = '20px';
    label.style.display = 'inline-block';
    return label;
}

/**
 * Creates textBox for user input
 * @param {*} type 
 * @param {*} placeholder 
 */
export function createInputBox(type, placeholder) {
    const box = createElement('input');
    box.className = 'input-text-boxes';
    box.type = type;
    box.required = true;
    box.placeholder = placeholder;
    return box;
}