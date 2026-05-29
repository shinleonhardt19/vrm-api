// VRM + LLM INTEGRATION CONTROLLER 

export class VRMLLMController {
  constructor(expressionController, mouthController) {
    this.expressionController = expressionController;
    this.mouthController = mouthController;
    
    this.isProcessing = false;
    this.currentAudio = null;
    this.audioContext = null;
    this.audioSource = null;
    this.analyser = null;
    this.lipSyncActive = false;
    
    // Sentiment detection keywords
    this.sentimentKeywords = {
      happy: ['wonderful', 'happy', 'haha', 'hehe', 'yay', 'Shin', 'great', 'love', 'nice', '❤️', '😊', '😄'],
      sad: ['sad', 'cry', 'sorry', '😢', '😭'],
      angry: ['angry', 'mad', '😠', '😡'],
      surprised: ['wow', 'omg', 'surprise', 'Surprise', '😲', '😮'],
      relaxed: ['relax', 'calm', 'ok', 'fine', 'good','😌'],
      BronyaFace2: ['bronyaface2', 'BryonaFace2'],
      BronyaFace1: ['bronyaface1', 'BryonaFace1'],
    };
    
    this.defaultExpression = 'relaxed';
  }

  // SENTIMENT ANALYSIS (emotion words detection)
  analyzeSentiment(text) {
    const lowerText = text.toLowerCase();
    
    const scores = {};
    for (const [sentiment, keywords] of Object.entries(this.sentimentKeywords)) {
      scores[sentiment] = 0;
      for (const keyword of keywords) {
        if (lowerText.includes(keyword.toLowerCase())) {
          scores[sentiment]++;
        }
      }
    }
    
    let maxScore = 0;
    let detectedSentiment = this.defaultExpression;
    
    for (const [sentiment, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score;
        detectedSentiment = sentiment;
      }
    }
    
    console.log(`Sentiment analysis:`, scores, `→ ${detectedSentiment}`);
    return maxScore > 0 ? detectedSentiment : this.defaultExpression;
  }

  // AUDIO PLAYBACK WITH LIP SYNC
  async playAudioWithLipSync(audioUrl, expression = null) {
    return new Promise((resolve, reject) => {
      console.log(`Playing audio: ${audioUrl}`);
      
      // Stop any current audio
      this.stopAudio();
      
      // Set expression if provided
      if (expression && this.expressionController) {
        this.expressionController.setFaceExpression(expression);
        console.log(`Set expression: ${expression}`);
      }
      
      // Create audio element
      this.currentAudio = new Audio(audioUrl);
      this.currentAudio.crossOrigin = "anonymous"; // Important for CORS
      
      // Enable user interaction for autoplay
      this.currentAudio.volume = 1.0;
      
      // Setup audio context for lip sync
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      // Resume audio context if suspended
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume().then(() => {
          console.log('AudioContext resumed');
        });
      }
      
      try {
        const source = this.audioContext.createMediaElementSource(this.currentAudio);
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 256;
        source.connect(this.analyser);
        this.analyser.connect(this.audioContext.destination);
        this.audioSource = source;
        
        console.log('Audio context setup complete');
      } catch (error) {
        console.error('Audio context setup error:', error);
        // Continue without lip sync
      }
      
      // Play audio
      const playPromise = this.currentAudio.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('▶️ Audio playing');
            // Start lip sync after audio starts
            if (this.analyser && this.mouthController) {
                this.mouthController.startSpeaking();
            }
          })
          .catch(err => {
            console.error('Audio play error:', err);
            reject(err);
          });
      }
      
      // Handle audio end
      this.currentAudio.onended = () => {
        console.log('Audio ended');
        this.mouthController.stopSpeaking();
        // Reset to default expression
        if (this.expressionController) {
          setTimeout(() => {
            this.expressionController.setFaceExpression(this.defaultExpression);
            console.log(`Reset to ${this.defaultExpression}`);
          }, 500); // Small delay for natural transition
        }
        resolve();
      };
      
      this.currentAudio.onerror = (err) => {
        console.error('Audio error:', err);
        // this.stopLipSync();
        this.mouthController.stopSpeaking();
        reject(err);
      };
    });
  }


  // AUDIO CONTROL
  stopAudio() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    // this.stopLipSync();
    this.mouthController.stopSpeaking();
  }

  pauseAudio() {
    if (this.currentAudio) {
      this.currentAudio.pause();
    //   this.stopLipSync();
      this.mouthController.stopSpeaking();
    }
  }

  resumeAudio() {
    if (this.currentAudio && this.currentAudio.paused) {
      this.currentAudio.play();
      if (this.analyser) {
        this.mouthController.startSpeaking();
      }
    }
  }

  // PROCESSING STATUS
  setProcessing(status) {
    this.isProcessing = status;
  }

  getProcessing() {
    return this.isProcessing;
  }
}