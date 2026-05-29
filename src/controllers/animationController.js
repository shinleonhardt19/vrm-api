// three/animationController.js
// ANIMATION CONTROLLER CLASS

export class AnimationController {
  constructor(vrm, renderer, scene, camera, controllers = {}) {
    this.vrm = vrm;
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    
    // Controllers
    this.vrmController = controllers.vrmController || null; // for model overall control
    this.eyeController = controllers.eyeController || null; // for eye movement
    this.mouthController = controllers.mouthController || null; // for mouth movement
    this.fbxController = controllers.fbxController || null; // for fbx animation controller

    // Animation state
    this.idleTime = 0;
    this.isRunning = false;
    this.animationFrameId = null;
  }

  // Set controllers after initialization
  setControllers(controllers) {
    if (controllers.vrmController) this.vrmController = controllers.vrmController;
    if (controllers.eyeController) this.eyeController = controllers.eyeController;
    if (controllers.mouthController) this.mouthController = controllers.mouthController;
    if (controllers.fbxController) this.fbxController = controllers.fbxController;
  }

  // Update all controllers
  updateControllers(delta) {
    this.eyeController?.update(delta);
    this.mouthController?.update(delta);
    this.vrmController?.update(delta);
    
    // pdate pose animation if exists
    if (window.poseAnimController) {
      window.poseAnimController.update(delta);
    }
    
    // FBX mixer update
    this.fbxController?.update(delta);
    this.vrm?.update(delta);
  }

  // Main animation loop
  animate(clock) {
    if (!this.isRunning) return;

    this.animationFrameId = requestAnimationFrame(() => this.animate(clock));

    const delta = clock.getDelta();    
    this.updateControllers(delta);
    this.renderer.render(this.scene, this.camera);
  }

  // Start animation
  start(clock) { // Add Orbit controls here
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log("Animation started");
    // controls.update() // Enable orbit controls
    this.animate(clock);
  }

  // Stop animation
  stop() {
    this.isRunning = false;
    
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    console.log("Animation stopped");
  }

  // Pause/Resume
  toggle(clock) {
    if (this.isRunning) {
      this.stop();
    } else {
      this.start(clock);
    }
  }
}