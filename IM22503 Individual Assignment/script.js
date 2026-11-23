
// COMMENTS SYSTEM
const commentForm = document.getElementById("commentForm");
const commentsList = document.getElementById("commentsList");

let comments = JSON.parse(
    localStorage.getItem("arinnaComments")
) || [];

let ownerMode = false;

// SAVE COMMENTS
function saveComments() {

    localStorage.setItem(
        "arinnaComments",
        JSON.stringify(comments)
    );

}

// DISPLAY COMMENTS
function displayComments() {

    commentsList.innerHTML = "";

    if (comments.length === 0) {

        commentsList.textContent =
            "No comments yet. Be the first to leave a comment!";

        commentsList.className = "empty-comments";
        return;
    }

    commentsList.className = "";

    comments.forEach(function(comment) {

        const card = document.createElement("div");
        card.className = "comment-card";

        // Comment header
        const header = document.createElement("div");
        header.className = "comment-header";

        const name = document.createElement("span");
        name.className = "comment-name";
        name.textContent = comment.name;

        const date = document.createElement("span");
        date.className = "comment-date";
        date.textContent = comment.date;

        header.append(name, date);

        // Comment message
        const message = document.createElement("p");
        message.className = "comment-message";
        message.textContent = comment.message;

        // Reaction buttons
        const actions = document.createElement("div");
        actions.className = "comment-actions";

        ["❤️", "👍", "😂", "😍"].forEach(function(emoji) {

            const button = document.createElement("button");
            button.className = "reaction-btn";
            button.type = "button";

            const count = comment.reactions[emoji] || 0;

            button.textContent = emoji + " " + count;

            button.addEventListener("click", function() {

                comment.reactions[emoji] =
                    comment.reactions[emoji] || 0;

                // Toggle reaction for this browser
                const active = comment.myReactions.includes(emoji);

                if (active) {
                    comment.reactions[emoji]--;
                    comment.myReactions =
                        comment.myReactions.filter(
                            item => item !== emoji
                        );
                } else {
                    comment.reactions[emoji]++;
                    comment.myReactions.push(emoji);
                }

                saveComments();
                displayComments();

            });

            actions.appendChild(button);

        });

        // Like button
        const likeButton = document.createElement("button");
        likeButton.className = "reaction-btn";
        likeButton.type = "button";

        likeButton.textContent =
            (comment.liked ? "❤️ Liked " : "🤍 Like ") +
            comment.likes;

        likeButton.addEventListener("click", function() {

            comment.liked = !comment.liked;

            comment.likes += comment.liked ? 1 : -1;

            saveComments();
            displayComments();

        });

        actions.appendChild(likeButton);

        // Delete button: owner mode only
        if (ownerMode) {

            const deleteButton = document.createElement("button");

            deleteButton.className = "delete-btn";
            deleteButton.type = "button";
            deleteButton.textContent = "Delete";

            deleteButton.addEventListener("click", function() {

                if (confirm("Are you sure you want to delete this comment?")) {

                    comments = comments.filter(
                        item => item.id !== comment.id
                    );

                    saveComments();
                    displayComments();

                }

            });

            actions.appendChild(deleteButton);

        }


        card.append(header, message, actions);

        commentsList.appendChild(card);

    });

}

// SUBMIT A COMMENT
if (commentForm) {

    commentForm.addEventListener("submit", function(event) {

        event.preventDefault();

        const name = document.getElementById("name").value.trim();
        const message = document.getElementById("message").value.trim();

        if (!name || !message) {
            return;
        }

        const newComment = {

            id: Date.now(),

            name: name,

            message: message,

            date: new Date().toLocaleDateString(),

            likes: 0,

            liked: false,

            reactions: {
                "❤️": 0,
                "👍": 0,
                "😂": 0,
                "😍": 0
            },

            myReactions: []

        };

        comments.unshift(newComment);

        saveComments();

        displayComments();

        commentForm.reset();

        document.getElementById("form-response").textContent =
            "Your comment has been posted successfully! 💜";

    });

}

// OWNER LOGIN
const ownerLogin = document.getElementById("ownerLogin");
const ownerLogout = document.getElementById("ownerLogout");
const ownerStatus = document.getElementById("ownerStatus");

if (ownerLogin) {

    ownerLogin.addEventListener("click", function() {

        const password = prompt("Enter owner password:");

        //PASSWORD:
        if (password === "A#2003") {

            ownerMode = true;

            ownerLogin.hidden = true;
            ownerLogout.hidden = false;

            ownerStatus.textContent = "Owner mode active";

            displayComments();

        } else if (password !== null) {

            alert("Incorrect password!");

        }

    });

}

// OWNER LOGOUT
if (ownerLogout) {

    ownerLogout.addEventListener("click", function() {

        ownerMode = false;

        ownerLogin.hidden = false;
        ownerLogout.hidden = true;

        ownerStatus.textContent = "";

        displayComments();

    });

}

// SHOW SAVED COMMENTS WHEN PAGE OPENS
displayComments();
