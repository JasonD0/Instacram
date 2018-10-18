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
export function createPostTile(post) {
    const section = createElement('section', null, { class: 'post' });

    section.appendChild(createElement('img', null, 
        { src: 'data:image/png;base64,' + post.src, alt: post.meta.description_text, class: 'post-image' }));

    const name = createElement('a');
    name.innerText = post.meta.author + "\n";
    name.style.display = 'inline-block';
    name.style.color = 'white';
    name.style.paddingLeft = '15px';
    
    const description = createElement('p');
    description.innerText = '\"' + post.meta.description_text + '\"';
    description.style.textAlign = 'center';
    
    const numComments = (post.meta.comments) ? post.meta.comments.length : 0;
    const numLikes = (post.meta.likes) ? post.meta.likes.length : 0;
    
    const comments = createElement('a');
    comments.innerText = 'View all ' + numComments + ' comments\n\u00A0\n'; 
    comments.id = 'comments';
    comments.style.paddingLeft = '15px';
    comments.style.fontSize = '15px';
    comments.style.color = 'aquamarine';

    const likes = createElement('a');
    likes.innerText = '\n\u00A0\u00A0\u00A0 ❤ ' + numLikes + ' likes \u00A0·\u00A0 View likes'; 
    likes.id = 'comments';
    likes.style.paddingLeft = '15px';
    likes.style.fontSize = '15px';
    likes.style.color = 'aquamarine';

    const date = createElement('i');
    let time = new Date(parseInt(post.meta.published));
    date.style.fontSize = '15px';
    date.innerText = time.toUTCString();
    date.style.paddingLeft = '15px';
    date.style.color = 'rgba(255, 255, 255, 0.5)';
    appendChilds(section, [name, likes, description, comments, date]);

    return section;
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

export function appendChilds(parent, childs) {
    for (var child of childs) {
        parent.appendChild(child);
    }
}

export function createLabel(text) {
    const label = createElement('h2');
    label.innerText = text;
    label.style.color = 'white';
    label.style.paddingRight = '20px';
    label.style.display = 'inline-block';
    return label;
}

export function createInputBox(type, placeholder) {
    const box = createElement('input');
    box.className = 'input-text-boxes';
    box.type = type;
    box.required = true;
    box.placeholder = placeholder;
    return box;
}