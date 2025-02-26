document.addEventListener("DOMContentLoaded", function () {
  const peopleListItems = document.querySelectorAll("#plist .chat-list li");
  const chatSection = document.getElementById("chat-section");
  const chatAvatar = document.getElementById("chat-avatar");
  const chatName = document.getElementById("chat-name");
  const chatHistory = document
    .getElementById("chat-history")
    .querySelector("ul");

  // Dữ liệu tin nhắn giả (có thể thay bằng dữ liệu từ backend)
  const messages = {
    "Aiden Chavez": [
      {
        sender: "Aiden Chavez",
        text: "Hi, how are you?",
        time: "10:10 AM, Today",
      },
      { sender: "You", text: "I'm good, thanks!", time: "10:12 AM, Today" },
      {
        sender: "Aiden Chavez",
        text: "Great to hear!",
        time: "10:13 AM, Today",
      },
    ],
    "Mike Thomas": [
      {
        sender: "Mike Thomas",
        text: "Hey, what's up?",
        time: "09:30 AM, Today",
      },
      {
        sender: "You",
        text: "Not much, just relaxing.",
        time: "09:32 AM, Today",
      },
      {
        sender: "Mike Thomas",
        text: "Sounds good! How's your day going?",
        time: "09:35 AM, Today",
      },
    ],
  };

  // Lắng nghe sự kiện click vào danh sách người dùng
  peopleListItems.forEach((item) => {
    item.addEventListener("click", function () {
      // Lấy thông tin người dùng khi click
      const userName = this.getAttribute("data-chat");
      const userAvatar = this.querySelector("img").src;

      // Hiển thị phần chat
      chatSection.style.display = "block"; // Hiển thị phần chat
      chatAvatar.src = userAvatar;
      chatName.textContent = userName;

      // Cập nhật lịch sử chat
      chatHistory.innerHTML = ""; // Xóa lịch sử tin nhắn hiện tại

      // Thêm tin nhắn vào chat-history
      messages[userName].forEach((message) => {
        const messageElement = document.createElement("li");
        messageElement.classList.add("clearfix");

        if (message.sender === "You") {
          messageElement.innerHTML = `
              <div class="message-data">
                <span class="message-data-time">${message.time}</span>
              </div>
              <div class="message my-message">
                ${message.text}
              </div>
            `;
        } else {
          messageElement.innerHTML = `
              <div class="message-data text-right">
                <span class="message-data-time">${message.time}</span>
                <img src="${userAvatar}" alt="avatar" />
              </div>
              <div class="message other-message float-right">
                ${message.text}
              </div>
            `;
        }

        chatHistory.appendChild(messageElement);
      });
    });
  });

  // Kiểm tra nếu không chọn người dùng nào
  function checkNoUserSelected() {
    const selectedUser = document.querySelector(".chat-list li.active");
    if (!selectedUser) {
      // Ẩn phần chat và thanh gửi tin nhắn nếu không có người dùng được chọn
      chatSection.style.display = "none";
    }
  }

  // Kiểm tra khi không có người dùng nào được chọn
  checkNoUserSelected();
});
