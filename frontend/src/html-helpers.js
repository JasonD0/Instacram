import { createElement } from './helpers.js';

/**
 * functions to create html elements
 */

/**
 * Creates header text
 * @param {*} text 
 */
export function header(text) {
    const header = createElement('h1');
    header.innerText = text;
    header.style.fontSize = '50px';
    header.style.color = 'white';
    return header;
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
export function createInputBox(type, placeholder, i) {
    const box = createElement('input');
    box.className = (i) ? 'input-text-boxes1' : 'input-text-boxes';
    box.type = type;
    box.required = true;
    box.placeholder = placeholder;
    return box;
}

/**
 * Creates div element
 * @param {*} id 
 * @param {*} width 
 */
export function createFormDiv(id, width) {
    const div = createElement('div');
    div.className = 'main-content-box';
    div.id = id;
    div.style.width = width;
    return div;
}

export function createButton(text, id) {
    const b = createElement('button');
    b.className = 'submit-buttons';
    b.innerText = text;
    b.id = id;
    return b;
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
 * adds label and text to parent 
 * @param {*} parent 
 * @param {*} labelText 
 * @param {*} text 
 * @param {*} id 
 */
export function addLabelAndText(parent, labelText, text, id) {
    const label = createLabel(labelText, 'p');
    label.style.fontSize = '20px';
    label.style.fontWeight = 'bold';
    const text_ = createElement('i', null, {id: id});
    text_.style.color = 'white';
    text_.innerText = text;
    if (labelText === 'Following: ') appendChilds(parent, [label, createElement('br'), text_, createElement('br')]);
    else appendChilds(parent, [label, text_, createElement('br')]);
}

/**
 * Creates pop-up modal
 * @param {*} type 
 */
export function createModal(type) {
    const modal = createElement('div', null, {class: 'modal'});
    const modalHeader = createElement('div', null, {class: 'modal-header'});
    const modalContent = createElement('div', null, {class: 'modal-content'});
    
    const exit = createElement('a', null, {class: 'exit'});
    exit.innerText = '×';
    exit.addEventListener('click', () => {
        Array.from(document.getElementsByClassName('modal')).map(m => m.style.display = 'none');
        document.getElementById('large-feed').style.float = 'none';
    });

    // create modal header
    const header = createElement('h2');
    header.innerText = type;
    header.style.paddingLeft = '15px';
    appendChilds(modalHeader, [exit, header]);

    // add footer for comment modal 
    if (type === 'COMMENTS') {
        modalContent.style.height = '600px';
        const modalFooter = createElement('div', null, {class: 'modal-footer'});
        appendChilds(modal, [modalHeader, modalContent, modalFooter]);    
    } else {
        appendChilds(modal, [modalHeader, modalContent]);
    }
    return modal;
}