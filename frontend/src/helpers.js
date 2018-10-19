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
export function createPostTile(post, index) {
    const section = createElement('section', null, { class: 'post' });

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
    
    const comments = createElement('a');
    comments.innerText = 'View all ' + numComments + ' comments\n\u00A0\n'; 
    comments.className = 'comments';

    const likes = createElement('a');
    likes.innerText = '\n\u00A0\u00A0\u00A0 ❤ ' + numLikes + ' likes ·'; 
    likes.className = 'likes';
    
    const viewLikes = createElement('a');
    viewLikes.innerText = 'View likes';
    viewLikes.className = 'viewLikes';
    window.localStorage.setItem(index, post.id);

    const date = createElement('i');
    date.className = 'date';
    date.innerText = convertToTime(post.meta.published);

    const postId = createElement('p');
    postId.className = 'postId';
    postId.innerText = post.id;
    postId.style.display = 'none';

    appendChilds(section, [name, likes, viewLikes, description, comments, date, postId]);

    return section;
}

/**
 * Converts UNIX time stamp to readable time
 * @param {*} n 
 */
export function convertToTime(n) {
    let time = new Date(parseFloat(n));
    return time.toUTCString();
}

// Given an input element of type=file, grab the data uploaded for use
export function uploadImage(event) {
    const [ file ] = event.target.files;

    const validFileTypes = [ 'image/jpeg', 'image/png', 'image/jpg' ]
    const valid = validFileTypes.find(type => type === file.type);

    // bad data, let's walk away
    if (!valid)
        return false;
    
    // if we get here we have a valid image
    const reader = new FileReader();
    
    reader.onload = (e) => {
        // do something with the data result
        const dataURL = e.target.result;
        const image = createElement('img', null, { src: dataURL });
        document.getElementById('large-feed').appendChild(image);
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
export function createLabel(text) {
    const label = createElement('h2');
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