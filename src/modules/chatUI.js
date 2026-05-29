// CHAT UI COMPONENT 
export class ChatUI {
  constructor(vrmLLMController, llmAPI) {
    this.vrmController = vrmLLMController;
    this.llmAPI = llmAPI;
    this.chatHistory = [];
    this.chatContainer = null;
    this.messagesContainer = null;
    this.inputField = null;
    this.sendButton = null;
  }

  create() {
    // Main chat container
    this.chatContainer = document.createElement('div');
    this.chatContainer.id = 'vrm-chat-container';
    this.chatContainer.style.cssText = `
      position: fixed;
      bottom: 80px;
      left: 20px;
      width: 600px;
      height: 250px;
      background: rgba(0, 0, 0, 0.9);
      border-radius: 15px;
      display: flex;
      flex-direction: column;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      z-index: 1000;
      font-family: Monospace;
    `;

    // Header
    const header = document.createElement('div');
    header.style.cssText = `
      padding: 15px;
      background: linear-gradient(135deg,rgb(54, 66, 119) 0%,rgb(135, 154, 216) 100%);
      border-radius: 15px 15px 0 0;
      color: white;
      font-weight: bold;
      text-align: center;
    `;
    header.textContent = '💬 Chat with Bronya';
    this.chatContainer.appendChild(header);

    // Messages container
    this.messagesContainer = document.createElement('div');
    this.messagesContainer.id = 'chat-messages';
    this.messagesContainer.style.cssText = `
      flex: 1;
      overflow-y: auto;
      padding: 15px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    `;
    
    // Custom scrollbar
    const style = document.createElement('style');
    style.textContent = `
      #chat-messages::-webkit-scrollbar { width: 8px; }
      #chat-messages::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
      #chat-messages::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.3); border-radius: 10px; }
      #chat-messages::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.5); }
    `;
    document.head.appendChild(style);
    
    this.chatContainer.appendChild(this.messagesContainer);
    
    // Input text + Speech to text button
    const inputWrapper = document.createElement('div');
    inputWrapper.style.cssText = `
      flex: 1;
      display: flex;
      align-items: center;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 5px;
      color: white;
      font-family: monospace;
    `; 


    // Speech-to-text button 
    this.speechButton = document.createElement('button');
    this.speechButton.textContent = '၊၊||၊';
    this.speechButton.style.cssText = `
      padding: 7px 10px;
      background: rgba(255,255,255,0.15);
      border: 1px solid rgba(255,255,255,0.3);
      border-radius: 5px;
      color: white;
      cursor: pointer;
      font-size: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 4px;
    `;
    // generate logs temporaly
    this.speechButton.onclick = () => {
      console.log(" ၊၊||၊ Speech-to-text button clicked ");
      // TODO: SPEECH TO TEXT IN HERE
    };    


    // Input container
    const inputContainer = document.createElement('div');
    inputContainer.style.cssText = `
      padding: 15px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      gap: 12px;
    `;
    
    this.inputField = document.createElement('input');
    this.inputField.type = 'text';
    this.inputField.placeholder = 'Type your message...';
    this.inputField.style.cssText = `
      flex: 1;
      padding: 10px;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 5px;
      color: white;
      font-family: monospace;
      margin-right: 4px;
    `;
    
    inputWrapper.appendChild(this.speechButton);
    inputWrapper.appendChild(this.inputField);


    this.sendButton = document.createElement('button');
    this.sendButton.textContent = '➤';
    this.sendButton.style.cssText = `
      padding: 10px 25px;
      background: linear-gradient(135deg,rgb(54, 66, 119) 0%,rgb(135, 154, 216) 100%);
      border: none;
      border-radius: 5px;
      color: white;
      cursor: pointer;
      font-size: 16px;
    `;

    this.sendButton.onclick = () => this.sendMessage();
    this.inputField.onkeypress = (e) => {
      if (e.key === 'Enter') this.sendMessage();
    };

    inputContainer.appendChild(inputWrapper);
    inputContainer.appendChild(this.sendButton);
    this.chatContainer.appendChild(inputContainer);

    document.body.appendChild(this.chatContainer);
  }

  addMessage(text, isUser = false, isThinking = false) {
    const msg = document.createElement('div');
    msg.style.cssText = `
      padding: 10px 15px;
      border-radius: 10px;
      max-width: 80%;
      word-wrap: break-word;
      ${isUser 
        ? 'background: linear-gradient(135deg,rgb(69, 97, 219) 0%, #764ba2 100%); align-self: flex-end; color: white;' 
        : isThinking
          ? 'background: rgba(255, 165, 0, 0.3); align-self: flex-start; color: #ffa500; font-style: italic;'
          : 'background: rgba(255, 255, 255, 0.1); align-self: flex-start; color: #e0e0e0;'
      }
    `;
    msg.textContent = text;
    msg.dataset.isThinking = isThinking;
    this.messagesContainer.appendChild(msg);
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    return msg;
  }

  removeThinkingMessage() {
    const thinkingMsg = this.messagesContainer.querySelector('[data-is-thinking="true"]');
    if (thinkingMsg) {
      thinkingMsg.remove();
    }
  }

  async sendMessage() {
    const message = this.inputField.value.trim();
    if (!message || this.vrmController.getProcessing()) return;

    this.addMessage(message, true);
    this.inputField.value = '';
    this.vrmController.setProcessing(true);
    
    // Disable input
    this.inputField.disabled = true;
    this.sendButton.disabled = true;
    this.sendButton.style.opacity = '0.5';

    // ✅ Add thinking message
    const thinkingMsg = this.addMessage('Thinking...', false, true);

    try {
      // Call LLM backend
      const response = await this.llmAPI.chat(message, this.chatHistory);
      
      // ✅ Remove thinking message
      this.removeThinkingMessage();
      
      // Add to history
      this.chatHistory.push({ role: 'user', content: message });
      this.chatHistory.push({ role: 'assistant', content: response.text });

      // Display response
      this.addMessage(response.text, false);

      // Analyze sentiment
      const sentiment = this.vrmController.analyzeSentiment(response.text);
      console.log(`🎭 Detected sentiment: ${sentiment}`);

      // ✅ Construct full audio URL
      const audioUrl = response.audio_url.startsWith('http') 
        ? response.audio_url 
        : `${this.llmAPI.baseURL}${response.audio_url}`;
      
      console.log(`Audio URL: ${audioUrl}`);

      // Play audio with lip sync and expression
      await this.vrmController.playAudioWithLipSync(audioUrl, sentiment);
      
    } catch (error) {
      console.error('❌ Error:', error);
      this.removeThinkingMessage();
      this.addMessage(`Error: ${error.message}`, false);
    } finally {
      this.vrmController.setProcessing(false);
      
      // Re-enable input
      this.inputField.disabled = false;
      this.sendButton.disabled = false;
      this.sendButton.style.opacity = '1';
      this.inputField.focus();
    }
  }

  show() {
    if (this.chatContainer) {
      this.chatContainer.style.display = 'flex';
    }
  }

  hide() {
    if (this.chatContainer) {
      this.chatContainer.style.display = 'none';
    }
  }

  toggle() {
    if (this.chatContainer) {
      const isVisible = this.chatContainer.style.display !== 'none';
      if (isVisible) {
        this.hide();
      } else {
        this.show();
      }
    }
  }
}

