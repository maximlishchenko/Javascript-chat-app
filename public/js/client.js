//required for front end communication between client and server

const socket = io();

const inboxPeople = document.querySelector(".inbox-people");
const messagesHistory = document.querySelector(".messages__history");


let userName = "";
let id;
const newUserConnected = function (data) {

	//give the user a random unique id
	id = Math.floor(Math.random() * 1000000);
	userName = 'user-' + id;
	//console.log(typeof(userName));


	//emit an event with the user id
	socket.emit("new user", userName);
	//call
};

const addToUsersBox = function (userName) {
	//This if statement checks whether an element of the user-userlist
	//exists and then inverts the result of the expression in the condition
	//to true, while also casting from an object to boolean
	if (!!document.querySelector(`.${userName}-userlist`)) {
		return;

	}

	//setup the divs for displaying the connected users
	//id is set to a string including the username
	const userBox = `
	<div class="chat_id ${userName}-userlist">
	  <h5>${userName}</h5>
	</div>
  `;
	//set the inboxPeople div with the value of userbox
	inboxPeople.innerHTML += userBox;
};

const newUserNotification = function (userName) {
	if (!!document.querySelector(`.notification-user-${userName}`)) {
		return;
	}
	//setup the divs for displaying the connected users
	//id is set to a string including the username
	const notificationMessage = `
	<div class="notification-user-${userName}">
	  <h5>${userName} has joined the chat.</h5>
	</div>
  `;
	//set the inboxPeople div with the value of userbox
	messagesHistory.innerHTML += notificationMessage;
};

const informAboutNewUser = function () {
	document.title = 'New user has joined the chat.';
}

//call
newUserConnected();

//when a new user event is detected
socket.on("new user", function (data) {
	data.map(function (user) {
		newUserNotification(user);
		//informAboutNewUser();
		addToUsersBox(user);
	});
});

//when a user leaves
socket.on("user disconnected", function (userName) {
	document.querySelector(`.${userName}-userlist`).remove();
	const disconnectMessage = `
	<div>
	  <h5>${userName} has left the chat.</h5>
	</div>
  `;
	//set the inboxPeople div with the value of userbox
	messagesHistory.innerHTML += disconnectMessage;
});



const inputField = document.querySelector(".message_form__input");
const messageForm = document.querySelector(".message_form");
const messageBox = document.querySelector(".messages__history");
const inboxMessages = document.querySelector(".inbox__messages");

const addNewMessage = ({
	user,
	message
}) => {
	const time = new Date();
	const formattedTime = time.toLocaleString("en-US", {
		hour: "numeric",
		minute: "numeric"
	});

	const receivedMsg = `
  <div class="incoming__message">
	<div class="received__message">
	  <p>${message}</p>
	  <div class="message__info">
		<span class="message__author">${user}</span>
		<span class="time_date">${formattedTime}</span>
	  </div>
	</div>
  </div>`;

	const myMsg = `
  <div class="outgoing__message">
	<div class="sent__message">
	  <p>${message}</p>
	  <div class="message__info">
		<span class="time_date">${formattedTime}</span>
	  </div>
	</div>
  </div>`;

	//is the message sent or received
	messageBox.innerHTML += user === userName ? myMsg : receivedMsg;
	if (user === userName) {
		document.querySelector(".typing-message").remove();
	}
};

messageForm.addEventListener("submit", (e) => {
	e.preventDefault();
	if (!inputField.value) {
		return;
	}

	socket.emit("chat message", {
		message: inputField.value,
		nick: userName,
	});

	inputField.value = "";
});

socket.on("chat message", function (data) {
	addNewMessage({
		user: data.nick,
		message: data.message
	});
});

var timeout;

function timeoutFunction() {
	typing = false;
	socket.emit("typing", false);
}


socket.on("typing", function (data) {
	const userTyping = `
	<div class="typing-message">
		<h5>${data} is typing.</h5>
    </div>`;
	// if typing state is false and there already is a typing-message div
	if (!data && !!document.querySelector(".typing-message")) {
		document.querySelector(".typing-message").remove();
	}
	// if there already is a typing-message div
	if (!!document.querySelector(".typing-message")) {
		document.querySelector(".typing-message").remove();
	}
	// if there is no typing-message div and data is a username
	if (!document.querySelector(".typing-message") && data) {
		inboxMessages.innerHTML += userTyping;
	}
});


inputField.addEventListener("keydown", function () {
	socket.emit("typing", userName);
});