import { appendChilds, removeChilds } from './html-helpers.js';
import { checkStore, createElement, optionsNoBody, options, convertToTime } from './helpers.js';

/**
 * Allows user to see comments of the post
 * @param {*} numComments 
 * @param {*} postId 
 * @param {*} userToken 
 * @param {*} api 
 */
export function addViewComments(numComments, postId, userToken, api) {
    const comments = createElement('a');
    comments.innerText = 'View all ' + numComments + ' comments\n\u00A0\n'; 
    comments.className = 'comments';
    comments.addEventListener('click', () => {
        document.getElementsByClassName('modal')[0].style.display = 'block';
        removeChilds(document.getElementsByClassName('modal-content')[0]);
        api.makeAPIRequest('post/?id='+postId, optionsNoBody({'Content-Type': 'application/json', Authorization: `Token ${userToken}`}, 'GET'))
            .then(data => addCommentModalContents(data))
            .then(() => addPostComment(postId, userToken, api, comments));
        });
    return comments;    
}

/**
 * Allows user to post new comment
 * @param {*} postId 
 * @param {*} userToken 
 * @param {*} api 
 * @param {*} commentsLabel 
 */
function addPostComment(postId, userToken, api, commentsLabel) {
    const postButton = document.getElementById('post-button');
    const author = document.getElementById('author').innerText;
    const unixTime = new Date().getTime()/1000;
    postButton.addEventListener('click', () => {
        const comment = document.getElementById('user-comment').value;
        api.makeAPIRequest('post/comment?id='+postId, options({Authorization: `Token ${userToken}`, 'Content-Type': 'application/json'}, 'PUT', {author: author, published: unixTime, comment: comment}))
            .then(data => {
                if (data.message === 'success') {
                    createComment(comment, author, unixTime);
                    let x = parseInt(commentsLabel.innerText.replace(/\D+/g, ''));
                    commentsLabel.innerText = commentsLabel.innerText.replace(x, x+1);                
                }
            });
    });
}

/**
 * Create comment and add to comment section
 * @param {*} comment 
 * @param {*} author 
 * @param {*} unixTime 
 */
function createComment(comment, author, unixTime) {
    const commentSection = document.getElementsByClassName('modal-content')[0];
    const c = createElement('i', null, {class: 'comment'});
    c.innerText = comment;
    const u = createElement('a', null, {class: 'user'});
    u.innerText = author;
    const date = createElement('i', null, {class: 'date'});
    date.innerText = convertToTime(unixTime);
    date.style.fontSize = '10px';
    appendChilds(commentSection, [u, createElement('br'), createElement('br'), c, createElement('br'), date, createElement('br')]);
    document.getElementById('user-comment').value = '';
}

/**
 * Adds comments of the post to the pop-up modal
 * @param {*} data 
 */
function addCommentModalContents(data) {
    const modalFooter = document.getElementsByClassName('modal-footer')[0];
    removeChilds(modalFooter);
    
    // input text box for new comment
    const comment = createElement('textarea', null, {id: 'user-comment'});
    comment.placeholder = 'Enter comment';
    comment.style.width = '500px';
    
    // button to post new comment
    const postButton = createElement('a', null, {id: 'post-button'});
    postButton.innerText = 'Enter';
    postButton.style.fontSize = '15px';
    appendChilds(modalFooter, [comment, postButton]);
    
    addCommentSection(data);
}

/**
 * Add comment section 
 * @param {*} data 
 */
function addCommentSection(data) {
    const modalContent = document.getElementsByClassName('modal-content')[0];
    const userComments = data.comments.sort((a,b) => {return a.published - b.published});
    userComments.reduce((cs, us) => {
        const c = createElement('i', null, {class: 'comment'});
        c.innerText = us.comment;
        const u = createElement('a', null, {class: 'user'});
        u.innerText = us.author;
        const date = createElement('i', null, {class: 'date'});
        date.innerText = convertToTime(us.published);
        date.style.fontSize = '10px';
        appendChilds(cs, [u, createElement('br'), createElement('br'), c, createElement('br'), date, createElement('br')]);
        return modalContent;
    }, modalContent);
}

/**
 * Allows user to see list of users that liked the post
 * @param {*} postId 
 * @param {*} userToken 
 * @param {*} api 
 */
export function addViewLikes(postId, userToken, api) {
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
export function addLikes(numLikes, postId, userToken, api) {
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