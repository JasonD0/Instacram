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

    section.appendChild(createElement('h2', post.meta.author, { class: 'post-title' }));
    
    section.appendChild(createElement('img', null, 
        { src: 'data:image/png;base64,' + post.src, alt: post.meta.description_text, class: 'post-image' }));

    const d = createElement_('h5');
    d.innerText = '\"' + post.meta.description_text + '\"';

    section.appendChild(d);


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
        //document.body.appendChild(image);
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
    const header = createElement_('h1');
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
    const label = createElement_('h2');
    
    label.innerText = text;
    label.style.color = 'white';
    label.style.paddingRight = '20px';
    label.style.display = 'inline-block';

    return label;
}

export function createInputBox(type, placeholder) {
    const box = createElement_('input');

    box.type = type;
    box.required = true;
    box.placeholder = placeholder;
    box.style.padding = '10px 10px 10px 10px';
    box.style.outline = 'none';
    box.className = 'textBox';

    return box;
}

export function createElement_(element) {
    return document.createElement(element);
}