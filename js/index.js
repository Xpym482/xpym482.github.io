const msgRef = database.ref("/messages");
let email = null;
let receiverEmail = null;
let messages = [];
const messagesContainerGroup = document.getElementById("messages-group");
const messagesContainer = document.getElementById("messages-single");

function sendMessage(){
    let messageInput = document.getElementById("msg-input");
    let text = messageInput.value;
    if(!text.trim()) return alert('Please enter message.');
    const msg = {
        sender: email,
        receiver: receiverEmail,
        name,
        text
    };

    msgRef.push(msg);
    messagesContainer.innerHTML = "";
    messagesContainerGroup.innerHTML = "";
    updateMessages(messages);
    messageInput.value = "";
}

function runThrough(arr) {
    if (!arr) return false;

    const data = Object.values(arr);
    for(let i = 0; i < data.length; i++){
        if(data[i].email === email){
            return true;
        }
    }
    return false;
}


function load(){
    let chats = document.getElementById("all-conversations");

    firebase.auth().onAuthStateChanged(async function(user) {
        if (user) {
            const userNameContainer = document.getElementById("your-name");

            name = user.displayName;
            email = user.email;
            photoUrl = user.photoURL;
            photo = document.getElementById("profile-image");
            photo.src = photoUrl;

            const usrRef = database.ref("/users");

            const usr = {
                email,
                name,
                photoUrl
            };
            let users = null;

            await usrRef.once('value').then((snapshot) => {
                users = snapshot.val()
            })

            if (!runThrough(users)) usrRef.push(usr);

            await msgRef.on('child_added', (snapshot) => {
                messages.push(snapshot.val());
            });

            Object.values(users).forEach((element, index) => {
                if (element.email === email) return;
                addUserToChat(chats, element, index);
            })
            userNameContainer.innerHTML = name;

        } else {
            window.location.replace("login.html");
        }
    });
}



function updateMessages(data) {
    data.forEach((element) => {
        const name = element.name;
        const receiver = element.receiver;
        const sender = element.sender;
        const text = element.text;
        if ((sender === email && receiver === receiverEmail && receiver !== "empty") || (sender === receiverEmail && receiver === email && receiver !== "empty")) {
            const msg = `<li class="message" id="${email === sender ? "messages-sent": "messages-received"}">
            <i class = "name">${name}</i><br><i>${text}</i>
            </li>`;
            messagesContainer.innerHTML += msg;
        } else if(receiver === "empty"){
            const msg = `<li class="message" id="${email === sender ? "messages-sent": "messages-received"}">
            <i class = "name">${name}</i><br><i>${text}</i>
            </li>`;
            messagesContainerGroup.innerHTML += msg;
        }
        document.getElementById("conversation").scrollTop = document.getElementById("conversation").scrollHeight;
    })

}

function addUserToChat(chatsHTML, user, userId) {
    const divConvCont = document.createElement("div");
    divConvCont.className = "conversation-container";

    const divConvItem = document.createElement("div");
    divConvItem.className = "conversation-item";

    const divConvLogo = document.createElement("div");
    divConvLogo.className = "conversation-logo";

    const divConvText = document.createElement("div");
    divConvText.className = "conversation-text";

    const profileImg = document.createElement("img");
    profileImg.className = "profile-image";
    profileImg.src = user.photoUrl;

    const divYourName = document.createElement("div");
    divConvText.className = "your-name";

    const divConvLast = document.createElement("div");
    divConvLast.className = "conversation-last";

    const openChatButton = document.createElement("button");
    openChatButton.className = "button";
    openChatButton.innerHTML = "Message";
    openChatButton.onclick = function () {
        messagesContainer.innerHTML = "";
        messagesContainerGroup.style.display = "none";
        messagesContainerGroup.innerHTML = "";
        messagesContainer.style.display = "block";
        receiverEmail = user.email;
        updateMessages(messages);
    }
    const textNickname = document.createTextNode(user.name);

    divConvLast.appendChild(openChatButton);

    divYourName.appendChild(textNickname);
    divConvText.appendChild(divYourName);
    divConvText.appendChild(divConvLast);
    divConvLogo.appendChild(profileImg);

    divConvItem.appendChild(divConvLogo);
    divConvItem.appendChild(divConvText);

    divConvCont.appendChild(divConvItem);

    const li = document.createElement("li");
    li.appendChild(divConvCont);
    chatsHTML.appendChild(li);
}

function groupChat() {
    messagesContainer.innerHTML = "";
    messagesContainer.style.display = "none";
    receiverEmail = "empty";
    messagesContainerGroup.style.display = "block";
    messagesContainerGroup.innerHTML = "";
    updateMessages(messages);
}

document.addEventListener('DOMContentLoaded', load);
