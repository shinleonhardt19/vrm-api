import * as THREE from "three";

export function createThreeScene(container) {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(30,container.clientWidth / container.clientHeight, 0.1, 100);
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

  camera.position.set(0, 1.4, 2.2);
  renderer.setSize(container.clientWidth, container.clientHeight);
  // renderer.setSize(1920,1600)
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  container.appendChild(renderer.domElement);

  scene.add(new THREE.DirectionalLight(0xffffff, 1));
  scene.add(new THREE.AmbientLight(0xffffff, 0.5));
  scene.add(new THREE.GridHelper(4,7)); // Adding grid world
  scene.background = new THREE.Color(0xE3DAC9); // Setup background coloer 0xF5F5F5
  return { scene, camera, renderer };
}