const addButton = document.getElementById("addComment");
const commentElement = document.getElementById("comments");
const userNamesFromComments = document.getElementsByClassName("username");
const deleteButtons = document.getElementsByClassName("deleteComment");
const editButtons = document.getElementsByClassName("editComment");
let open_form = false;

function getWorkoutIdFromURL(){
    let url = window.location.href;
    const REGEX = "\/workout\/(.*)/?";
    return url.match(REGEX)[1].split('/')[0];
}

function getWorkoutIdFromText(url){
    const REGEX = "\/workout\/(.*)/?";
    return url.match(REGEX)[1].split('/')[0];
}

function insertAfter(newNode, existingNode) {
    existingNode.parentNode.insertBefore(newNode, existingNode.nextSibling);
}

function createCommentTextArea(){
    let commentText = document.createElement('textarea');
    commentText.name = "comment";
    commentText.id = "comment";
    commentText.type= "text";
    commentText.placeholder = "Enter message...";
    return commentText;
}

function createEmptyErrorElement(){
    let commentError = document.createElement('p');
    commentError.classList.add("hidden");
    commentError.classList.add("error");
    return commentError;
}

function setErrorToErrorElement(commentError, text){
    commentError.classList.remove("hidden");
    commentError.textContent = text;
}

function createClickButton(text){
    let submitButton = document.createElement('button');
    submitButton.type = "button";
    submitButton.textContent = text;
    return submitButton;
}

function addButtonClickListener(){
    if (open_form) return;
    open_form = true;
    let form = document.createElement('form');
    let commentText = createCommentTextArea();
    let submitButton = createClickButton("Create");
    let commentError = createEmptyErrorElement();

    if (commentElement.firstChild){
        insertAfter(form, addButton);
    }
    else{
        commentElement.appendChild(form);
    }
    form.classList.add("card");
    form.classList.add("border-5");
    form.classList.add("pb-0");
    form.classList.add("px-3");
    form.appendChild(commentText);
    form.appendChild(submitButton);
    submitButton.classList.add("btn");
    submitButton.classList.add("btn-block");
    submitButton.classList.add("btn-primary");
    form.appendChild(commentError);
    submitButton.addEventListener("click", function(event) {
        event.preventDefault();
        if (!open_form) return;
        let requestConfig = {
            method: "PUT",
            url: `${getWorkoutIdFromURL()}/comments`,
            dataType: "json",
            data: {message: commentText.value},
            error: function(xhr, ajaxOptions, thrownError) {setErrorToErrorElement(commentError, xhr.responseJSON['error'])}
        }
        $.ajax(requestConfig).then(function (result) {
            if ("error" in result || !result["comment"]){
                setErrorToErrorElement(commentError, result['error']);
                return;
            }
            open_form = false;
            form.remove();
            location.reload();
            return;
        });
    });
}

function deleteCommentClickListener(event){
    let commentElement = event.target.parentNode.parentNode;
    let commentId = commentElement.id;
    
    let commentError = createEmptyErrorElement();
    commentError.id = 'deleteError';
    commentElement.appendChild(commentError);

    let requestConfig = {
        method: "DELETE",
        url: `${getWorkoutIdFromURL()}/comments`,
        dataType: "json",
        data: {commentId: commentId},
        error: function(xhr, ajaxOptions, thrownError) {setErrorToErrorElement(commentError, xhr.responseJSON['error'])}
    }
    $.ajax(requestConfig).then(function (result) {
        if ("error" in result || !result["result"]){
            setErrorToErrorElement(commentError, result['error']);
            return;
        }
        location.reload();
        return;
    });
}

function editCommentClickListener(event){
    let editButton = event.target;
    let commentElement = editButton.parentNode;
    let deleteButton = commentElement.querySelector('.deleteComment');
    deleteButton.remove();
    editButton.remove();
    let commentId = commentElement.id;

    let oldMessage= commentElement.querySelector('.workoutMessage');
    let oldWorkoutDate = commentElement.querySelector('.workoutDate');
    oldMessage.remove();
    oldWorkoutDate.remove();

    let textbox = createCommentTextArea();
    textbox.value = oldMessage.textContent;
    textbox.classList.add("message");
    textbox.classList.add("row");
    textbox.type="text";
    let submitButton = createClickButton("Edit");
    submitButton.classList.add("btn");
    submitButton.classList.add("btn-block");
    submitButton.classList.add("btn-primary");
    submitButton.classList.add("row");

    commentElement.appendChild(textbox);
    commentElement.appendChild(submitButton);

    submitButton.addEventListener('click', function(event) {
        let commentElement = event.target.parentNode.parentNode;
        let commentId = commentElement.id;

        let messageTextbox = commentElement.querySelector(".message");
        
        let editCommentError = createEmptyErrorElement();
        editCommentError.id = 'editError';
        commentElement.appendChild(editCommentError);
        let requestConfig = {
            method: "PATCH",
            url: `${getWorkoutIdFromURL()}/comments`,
            dataType: "json",
            data: {commentId: commentId, message: messageTextbox.value},
            error: function(xhr, ajaxOptions, thrownError) {setErrorToErrorElement(editCommentError, xhr.responseJSON['error'])}
        }
        $.ajax(requestConfig).then(function (result) {
            if ("error" in result || !result["result"]){
                setErrorToErrorElement(editCommentError, result['error']);
                return;
            }
            location.reload();
            return;
        });
    });
    

}

(function ($) {
    function addCommentListener(){
        addButton.addEventListener('click', addButtonClickListener);
    }
    addCommentListener();
    for (const deleteButton of deleteButtons){
        deleteButton.addEventListener('click', deleteCommentClickListener);
    }
    for (const editButton of editButtons){
        editButton.addEventListener('click', editCommentClickListener);
    }
})(window.jQuery);