// MOUTH  CONTROLLER

export class MouthController {
  constructor(vrm) {
    this.vrm = vrm;
    this.mouthExpressions = ['aa', 'ih', 'ou', 'ee', 'oh'];
    this.isSpeaking = false;
    this.currentValues = {};
    this.targetValues = {};
    this.speakInterval = null;

    // Initialize values
    this.mouthExpressions.forEach(expr => {
      this.currentValues[expr] = 0;
      this.targetValues[expr] = 0;
    });
  }

  startSpeaking() {
    if (this.isSpeaking) return;
    
    this.isSpeaking = true;
    console.log("🗣️ Started speaking");

    this.speakInterval = setInterval(() => {
      // Random chọn 1-2 mouth expressions
      const randomExpr = this.mouthExpressions[
        Math.floor(Math.random() * this.mouthExpressions.length)
      ];
      
      // Reset all
      this.mouthExpressions.forEach(expr => {
        this.targetValues[expr] = 0;
      });

      // Set random expression
      this.targetValues[randomExpr] = 0.4 + Math.random() * 0.6; // 0.4-1.0
    }, 100 + Math.random() * 100); // 100-200ms
  }

  stopSpeaking() {
    if (!this.isSpeaking) return;
    
    this.isSpeaking = false;
    console.log("Stopped speaking");

    if (this.speakInterval) {
      clearInterval(this.speakInterval);
      this.speakInterval = null;
    }

    // Reset all mouth expressions
    this.mouthExpressions.forEach(expr => {
      this.targetValues[expr] = 0;
    });
  }

  update(delta) {
    if (!this.vrm?.expressionManager) return;

    const lerpSpeed = 12 * delta;

    this.mouthExpressions.forEach(expr => {
      this.currentValues[expr] += 
        (this.targetValues[expr] - this.currentValues[expr]) * lerpSpeed;
      
      this.vrm.expressionManager.setValue(expr, this.currentValues[expr]);
    });
  }
}