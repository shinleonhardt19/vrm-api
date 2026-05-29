// EYE CONTROLLER

export class EyeController {
  constructor(vrm, lookAtTarget) {
    this.vrm = vrm;
    this.lookAtTarget = lookAtTarget;
    
    this.BLINK_EXPR = "blink";
    this.blinkTimer = 0;
    this.blinkInterval = 3 + Math.random() * 2;
    this.isBlinking = false;
    this.blinkEnabled = true; // ✅ Thêm flag để bật/tắt blink
    
    this.eyeMoveTimer = 0;
    this.eyeMoveInterval = 2 + Math.random() * 3;
    this.currentLookTarget = { x: 0, y: 1.5, z: 1 };
    this.targetLookPosition = { x: 0, y: 1.5, z: 1 };
    this.isFollowingMouse = false;
    this.mouseLookPosition = { x: 0, y: 1.5, z: 1 };
  }

  // ✅ BẬT blink tự động
  enableBlink() {
    this.blinkEnabled = true;
    console.log("👁️ Auto-blink enabled");
  }

  // ✅ TẮT blink tự động
  disableBlink() {
    this.blinkEnabled = false;
    // Reset blink về 0 khi tắt
    if (this.vrm?.expressionManager) {
      this.vrm.expressionManager.setValue(this.BLINK_EXPR, 0.0);
    }
    this.isBlinking = false;
    console.log("🚫 Auto-blink disabled");
  }

  updateBlink(delta) {
    // ✅ Chỉ chạy blink nếu được bật
    if (!this.blinkEnabled) return;
    if (!this.vrm?.expressionManager) return;

    this.blinkTimer += delta;

    if (this.blinkTimer > this.blinkInterval && !this.isBlinking) {
      this.isBlinking = true;
      this.blinkTimer = 0;

      this.vrm.expressionManager.setValue(this.BLINK_EXPR, 1.0);

      setTimeout(() => {
        this.vrm.expressionManager.setValue(this.BLINK_EXPR, 0.0);
        this.isBlinking = false;
        this.blinkInterval = 3 + Math.random() * 2;
      }, 100 + Math.random() * 50);
    }
  }

  updateEyeMovement(delta) {
    if (!this.lookAtTarget) return;

    this.eyeMoveTimer += delta;

    if (this.eyeMoveTimer > this.eyeMoveInterval) {
      this.eyeMoveTimer = 0;
      this.eyeMoveInterval = 2 + Math.random() * 3;

      const randomX = (Math.random() - 0.5) * 0.8;
      const randomY = 1.3 + (Math.random() - 0.5) * 0.4;
      const randomZ = 0.8 + Math.random() * 0.4;

      this.targetLookPosition = { x: randomX, y: randomY, z: randomZ };
    }

    const lerpSpeed = 2.0 * delta;
    const targetPos = this.isFollowingMouse 
      ? this.mouseLookPosition 
      : this.targetLookPosition;

    this.currentLookTarget.x += (targetPos.x - this.currentLookTarget.x) * lerpSpeed;
    this.currentLookTarget.y += (targetPos.y - this.currentLookTarget.y) * lerpSpeed;
    this.currentLookTarget.z += (targetPos.z - this.currentLookTarget.z) * lerpSpeed;

    this.lookAtTarget.position.set(
      this.currentLookTarget.x,
      this.currentLookTarget.y,
      this.currentLookTarget.z
    );
  }

  setMouseLook(x, y) {
    this.isFollowingMouse = true;
    this.mouseLookPosition.x = x;
    this.mouseLookPosition.y = 1.5 - y;
    this.mouseLookPosition.z = 1;
  }

  disableMouseLook() {
    this.isFollowingMouse = false;
  }

  update(delta) {
    this.updateBlink(delta);
    this.updateEyeMovement(delta);
  }

  // Check if blink  is enabled
  isBlinkEnabled() {
    return this.blinkEnabled;
  }
}