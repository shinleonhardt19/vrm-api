// BACKEND API 
import yaml from 'js-yaml'

const res = await fetch('configs/config.yaml');
const data = yaml.load(await res.text());

export class LLMBackendAPI {
  constructor(baseURL = null) {
    if (!baseURL) {
      const currentHost = window.location.hostname;
      const backendPort = data.backendPort;
      // If accessing via IP, use same IP for backend
      if (currentHost === data.webBaseURL) {
              baseURL = `${data.webBaseURL}:${backendPort}`;
            } 
            // If not domain nor localhost but not localhost (access through IP LAN 192.168...)
            else if (currentHost !== 'localhost' && currentHost !== '127.0.0.1') {
              baseURL = `http://${currentHost}:${backendPort}`;
            } 
            // Localhost for main pc
            else {
              baseURL = `http://localhost:${backendPort}`;
            }
      
      console.log(`Auto-detected backend URL: ${baseURL}`);
    }
    this.baseURL = baseURL;
  }

  async chat(message, history = []) {
    try {
      console.log(`Sending to backend: ${message}`);
      
      const response = await fetch(`${this.baseURL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          history: history,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Backend error:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Backend response:', data);
      return data;
    } catch (error) {
      console.error('Chat API error:', error);
      throw error;
    }
  }
}
