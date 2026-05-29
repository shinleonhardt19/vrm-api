import * as THREE from "three";
import { createThreeScene } from "./modules/threeScene.js";
import { loadVRM } from "./modules/vrmLoader.js"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"; 

import { VRMController } from "./controllers/vrmController.js";
import { EyeController } from "./controllers/eyeController.js";
import { MouthController } from "./controllers/mouthController.js";
import { ExpressionController } from "./controllers/expressionController.js";
import { AnimationController } from "./controllers/animationController.js";
import { VRMLLMController} from "./controllers/vrmLLMController.js";
import { FBXAnimationController } from "./controllers/fbxAnimationController.js";

import { loadFBXAnimations } from "./modules/loadFBXAnimation.js";
import { LLMBackendAPI } from "./modules/llmBackendAPI.js";
import { createChatButton } from "./modules/chatButton.js";
import { ChatUI } from "./modules/chatUI.js";

// MAIN APP
let window;
const container = document.getElementById("app");
const { scene, camera, renderer} = createThreeScene(container);
const clock = new THREE.Clock();
window.camera = camera;

// Add OrbitControls
// const controls = new OrbitControls(camera, renderer.domElement);
// controls.enableDamping = true; 
// controls.dampingFactor = 0.05;
// controls.target.set(-0.138, 1.0, 0.5); 

let vrm;
let controller;
let eyeController;
let mouthController;
let expressionController;
let animationController;
let vrmLLMController;
let fbxAnimController;
let llmAPI; 
let chatToggleBtn;
let chatUI; 



async function init() {
  vrm = await loadVRM("/vrm_models/ceo_bronya.vrm", scene);
  window.vrm = vrm;
  console.log("=== VRM LOADED ===");
  
  const allExpressions = Object.keys(vrm.expressionManager.expressions);
  console.log("Available Expressions:", allExpressions);
  
  const lookAtTarget = new THREE.Object3D();
  lookAtTarget.position.set(0, 1.5, 1);
  scene.add(lookAtTarget);
  vrm.lookAt.target = lookAtTarget;
  vrm.scene.position.set(0, -0.8, 0); // -1.4
  vrm.scene.scale.setScalar(1.5);
  camera.position.set(-0.9, 1.017, 2.338) 
  camera.lookAt(-0.138, 1.0, 0.5); 
  // camera.lookAt(0, 1.0, 0.5);

  // Initialize standard controllers
  controller = new VRMController(vrm);
  eyeController = new EyeController(vrm, lookAtTarget); // Enable blink
  mouthController = new MouthController(vrm);
  expressionController = new ExpressionController(vrm, eyeController);
  
  // ── FBX Animation Controller ─────────────────────────────────────────────
  fbxAnimController = new FBXAnimationController(vrm, "/fbx_animations/");
  window.fbxAnimController = fbxAnimController;

  // Load idle + any other animations
  await loadFBXAnimations();

  // Initialize animation controller
  animationController = new AnimationController( // Animation Controller for mouth animation
    vrm,
    renderer,
    scene,
    camera,
    {
      vrmController: controller,
      eyeController: eyeController,
      mouthController: mouthController,
      fbxController: fbxAnimController 
    },
  );

  scene.add(new THREE.AmbientLight(0xffffff, 1.5)); //f5f5f5 0xffffff

  // Initialize LLM 
  vrmLLMController = new VRMLLMController(expressionController, mouthController);
  llmAPI = new LLMBackendAPI(); 
  chatUI = new ChatUI(vrmLLMController, llmAPI);
}

// START APP

init().then(() => {
  console.log("Init completed...");

  // Create Chat UI
  chatUI.create();
  chatToggleBtn = createChatButton(ChatUI);

  // Hover effect
  chatToggleBtn.onmouseenter = () => {chatToggleBtn.style.transform = "scale(1.1)";};
  chatToggleBtn.onmouseleave = () => {chatToggleBtn.style.transform = "scale(1)";};

  // Toggle chat UI
  chatToggleBtn.onclick = () => chatUI.toggle();
  document.body.appendChild(chatToggleBtn);

  // Start animation
  animationController.start(clock);
  console.log("Succeffully started!");
}).catch(err => {
  console.error("Init failed:", err);
});