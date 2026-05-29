// chatButton.js

export function createChatButton(chatUI) {
  const chatToggleBtn = document.createElement("button");
  chatToggleBtn.innerHTML = '💬';
  chatToggleBtn.style.cssText = `
    position: fixed;
    bottom: 77px;
    left: 650px;
    padding: 15px;
    background: linear-gradient(135deg,rgb(54, 66, 119) 0%,rgb(135, 154, 216) 100%);
    color: white;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    font-size: 24px;  
    z-index: 2000;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
    transition: all 0.3s ease;
  `;
  return chatToggleBtn;
}
