import { initializeApp } from "https://www.gstatic.com/firebasejs/13.4.0/firebase-app.js";

import {
    getFirestore,
    collection,
    addDoc,
    onSnapshot,
    updateDoc,
    deleteDoc,
    doc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js";

// FIREBASE CONFIGURATION
const firebaseConfig = {
    apiKey: "AIzaSyD-arcLhQGq475C-fxul4J8zmF0oLHgn5w",
    authDomain: "arinna-personal-website.firebaseapp.com",
    projectId: "arinna-personal-website",
    storageBucket: "arinna-personal-website.firebasestorage.app",
    messagingSenderId: "28689531442",
    appId: "1:28689531442:web:48c8c82c4aeac31354b22b"
};

// CONNECT TO FIREBASE
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// COMMENTS SYSTEM
const commentForm = document.getElementById("commentForm");
const commentsList = document.getElementById("commentsList");

const ownerLogin = document.getElementById("ownerLogin");
const ownerLogout = document.getElementById("ownerLogout");
const ownerStatus = document.getElementById("ownerStatus");

let comments = [];
let ownerMode = false;

// DISPLAY COMMENTS
function displayComments() {

    if (!commentsList) return;

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
        date.textContent = comment.date || "";

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

            const count = comment.reactions?.[emoji] || 0;
            button.textContent = emoji + " " + count;

            button.addEventListener("click", async function() {

                const currentReactions = comment.reactions || {};
                const currentMine = comment.myReactions || [];

                const active = currentMine.includes(emoji);

                const newReactions = {
                    ...currentReactions,
                    [emoji]: Math.max(
                        0,
                        (currentReactions[emoji] || 0) + (active ? -1 : 1)
                    )
                };

                const newMine = active
                    ? currentMine.filter(item => item !== emoji)
                    : [...currentMine, emoji];

                try {
                    await updateDoc(doc(db, "comments", comment.id), {
                        reactions: newReactions,
                        myReactions: newMine
                    });
                } catch (error) {
                    console.error("Reaction error:", error);
                    alert("Unable to update reaction.");
                }

            });

            actions.appendChild(button);

        });

        // Like button
        const likeButton = document.createElement("button");
        likeButton.className = "reaction-btn";
        likeButton.type = "button";

        likeButton.textContent =
            (comment.liked ? "❤️ Liked " : "🤍 Like ") +
            (comment.likes || 0);

        likeButton.addEventListener("click", async function() {

            const newLiked = !comment.liked;

            try {
                await updateDoc(doc(db, "comments", comment.id), {
                    liked: newLiked,
                    likes: Math.max(
                        0,
                        (comment.likes || 0) + (newLiked ? 1 : -1)
                    )
                });
            } catch (error) {
                console.error("Like error:", error);
                alert("Unable to update like.");
            }

        });

        actions.appendChild(likeButton);

        card.append(header, message, actions);
        commentsList.appendChild(card);

    });

}

// LISTEN FOR COMMENTS FROM FIREBASE
if (commentsList) {

    onSnapshot(collection(db, "comments"), function(snapshot) {

        comments = snapshot.docs.map(function(document) {
            return {
                id: document.id,
                ...document.data()
            };
        });

        comments.sort(function(a, b) {
            const timeA = a.createdAt?.toMillis() || 0;
            const timeB = b.createdAt?.toMillis() || 0;
            return timeB - timeA;
        });

        displayComments();

    }, function(error) {
        console.error("Error loading comments:", error);
        commentsList.textContent = "Unable to load comments.";
    });

}

// SUBMIT A COMMENT
if (commentForm) {

    commentForm.addEventListener("submit", async function(event) {

        event.preventDefault();

        const name = document.getElementById("name").value.trim();
        const message = document.getElementById("message").value.trim();

        if (!name || !message) return;

        const newComment = {

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

            myReactions: [],
            createdAt: serverTimestamp()

        };

        try {

            await addDoc(collection(db, "comments"), newComment);

            commentForm.reset();

            document.getElementById("form-response").textContent =
                "Your comment has been posted successfully! 💜";

        } catch (error) {

            console.error("Error submitting comment:", error);

            document.getElementById("form-response").textContent =
                "Unable to post your comment. Please try again.";

        }

    });

}

// OWNER LOGIN
if (ownerLogin) {

    ownerLogin.addEventListener("click", function() {

        const password = prompt("Enter owner password:");

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
