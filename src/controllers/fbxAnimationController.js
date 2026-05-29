// src/three/fbxAnimationController.js
// FBX ANIMATION CONTROLLER FOR VRM MODEL
// Loads FBX animations (e.g. from Mixamo) and retargets them to VRM humanoid bones

import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";

// ─── Mixamo bone name → VRM humanoid bone name mapping ───────────────────────
const MIXAMO_TO_VRM_BONE = {
	mixamorigHips: 'hips',
	mixamorigSpine: 'spine',
	mixamorigSpine1: 'chest',
	mixamorigSpine2: 'upperChest',
	mixamorigNeck: 'neck',
	mixamorigHead: 'head',
	mixamorigLeftShoulder: 'leftShoulder',
	mixamorigLeftArm: 'leftUpperArm',
	mixamorigLeftForeArm: 'leftLowerArm',
	mixamorigLeftHand: 'leftHand',
	mixamorigLeftHandThumb1: 'leftThumbMetacarpal',
	mixamorigLeftHandThumb2: 'leftThumbProximal',
	mixamorigLeftHandThumb3: 'leftThumbDistal',
	mixamorigLeftHandIndex1: 'leftIndexProximal',
	mixamorigLeftHandIndex2: 'leftIndexIntermediate',
	mixamorigLeftHandIndex3: 'leftIndexDistal',
	mixamorigLeftHandMiddle1: 'leftMiddleProximal',
	mixamorigLeftHandMiddle2: 'leftMiddleIntermediate',
	mixamorigLeftHandMiddle3: 'leftMiddleDistal',
	mixamorigLeftHandRing1: 'leftRingProximal',
	mixamorigLeftHandRing2: 'leftRingIntermediate',
	mixamorigLeftHandRing3: 'leftRingDistal',
	mixamorigLeftHandPinky1: 'leftLittleProximal',
	mixamorigLeftHandPinky2: 'leftLittleIntermediate',
	mixamorigLeftHandPinky3: 'leftLittleDistal',
	mixamorigRightShoulder: 'rightShoulder',
	mixamorigRightArm: 'rightUpperArm',
	mixamorigRightForeArm: 'rightLowerArm',
	mixamorigRightHand: 'rightHand',
	mixamorigRightHandPinky1: 'rightLittleProximal',
	mixamorigRightHandPinky2: 'rightLittleIntermediate',
	mixamorigRightHandPinky3: 'rightLittleDistal',
	mixamorigRightHandRing1: 'rightRingProximal',
	mixamorigRightHandRing2: 'rightRingIntermediate',
	mixamorigRightHandRing3: 'rightRingDistal',
	mixamorigRightHandMiddle1: 'rightMiddleProximal',
	mixamorigRightHandMiddle2: 'rightMiddleIntermediate',
	mixamorigRightHandMiddle3: 'rightMiddleDistal',
	mixamorigRightHandIndex1: 'rightIndexProximal',
	mixamorigRightHandIndex2: 'rightIndexIntermediate',
	mixamorigRightHandIndex3: 'rightIndexDistal',
	mixamorigRightHandThumb1: 'rightThumbMetacarpal',
	mixamorigRightHandThumb2: 'rightThumbProximal',
	mixamorigRightHandThumb3: 'rightThumbDistal',
	mixamorigLeftUpLeg: 'leftUpperLeg',
	mixamorigLeftLeg: 'leftLowerLeg',
	mixamorigLeftFoot: 'leftFoot',
	mixamorigLeftToeBase: 'leftToes',
	mixamorigRightUpLeg: 'rightUpperLeg',
	mixamorigRightLeg: 'rightLowerLeg',
	mixamorigRightFoot: 'rightFoot',
	mixamorigRightToeBase: 'rightToes',
};


// ─── All VRM humanoid bone names (for full reset) ─────────────────────────────
const ALL_VRM_BONES = Object.values(MIXAMO_TO_VRM_BONE);

// ─── Helper: normalize Mixamo bone name (colon variant) ──────────────────────
function normalizeMixamoName(name) {
  return name.replace("mixamorig:", "mixamorig");
}

// ─── Helper: retarget clip to VRM bones ──────────────────────────────────────
// function retargetClipToVRM(sourceClip, vrm) {
//   const tracks = [];

//   for (const track of sourceClip.tracks) {
//     const [boneName, property] = track.name.split(".");
//     const normalized  = normalizeMixamoName(boneName);
//     const vrmBoneName = MIXAMO_TO_VRM_BONE[normalized];

//     if (!vrmBoneName) continue;

//     const vrmBoneNode = vrm.humanoid.getNormalizedBoneNode(vrmBoneName);
//     if (!vrmBoneNode) continue;

//     const targetName = vrmBoneNode.name;

//     if (property === "quaternion") {
//       // Flip X and Z axes: Mixamo Z-forward → VRM -Z-forward
//       const values = Float32Array.from(track.values);
//       for (let i = 0; i < values.length; i += 4) {
//         values[i]     = -values[i];
//         values[i + 2] = -values[i + 2];
//       }
//       tracks.push(
//         new THREE.QuaternionKeyframeTrack(
//           `${targetName}.quaternion`,
//           track.times,
//           values
//         )
//       );
//     } else if (property === "position" && vrmBoneName === "hips") {
//       // Scale cm → m, flip Z
//       const SCALE = 0.01;
//       const values = Float32Array.from(track.values);
//       for (let i = 0; i < values.length; i += 3) {
//         values[i]     =  values[i]     * SCALE;
//         values[i + 1] =  values[i + 1] * SCALE;
//         values[i + 2] = -values[i + 2] * SCALE;
//       }
//       tracks.push(
//         new THREE.VectorKeyframeTrack(
//           `${targetName}.position`,
//           track.times,
//           values
//         )
//       );
//     }
//   }

//   return new THREE.AnimationClip(sourceClip.name, sourceClip.duration, tracks);
// }
function retargetClipToVRM(sourceClip, vrm, fbxAsset) {
    const tracks = [];
    const restRotationInverse = new THREE.Quaternion();
    const parentRestWorldRotation = new THREE.Quaternion();
    const _quatA = new THREE.Quaternion();

    // Tính toán scale dựa trên tỉ lệ chiều cao hips
    const motionHips = fbxAsset.getObjectByName('mixamorigHips');
    const vrmHips = vrm.humanoid?.getNormalizedBoneNode('hips');
    const hipsScale = (vrmHips?.position.y || 1.0) / (motionHips?.position.y || 1.0);

    for (const track of sourceClip.tracks) {
        const [mixamoRigName, property] = track.name.split(".");
        const vrmBoneName = MIXAMO_TO_VRM_BONE[normalizeMixamoName(mixamoRigName)];
        const vrmBoneNode = vrm.humanoid?.getNormalizedBoneNode(vrmBoneName);
        const mixamoRigNode = fbxAsset.getObjectByName(mixamoRigName);

        if (!vrmBoneNode || !mixamoRigNode) continue;

        // Lưu trữ rotation của rest-pose để tính offset
        mixamoRigNode.getWorldQuaternion(restRotationInverse).invert();
        mixamoRigNode.parent.getWorldQuaternion(parentRestWorldRotation);

        if (property === "quaternion" && track instanceof THREE.QuaternionKeyframeTrack) {
            const values = Float32Array.from(track.values);
            for (let i = 0; i < values.length; i += 4) {
                _quatA.fromArray(values, i);
                
                // Thuật toán chuẩn: Bù trừ góc xoay giữa 2 hệ trục
                _quatA.premultiply(parentRestWorldRotation)
                      .multiply(restRotationInverse);
                
                _quatA.toArray(values, i);
            }
            tracks.push(new THREE.QuaternionKeyframeTrack(`${vrmBoneNode.name}.quaternion`, track.times, values));
            
        } else if (property === "position" && vrmBoneName === "hips") {
            const values = Float32Array.from(track.values);
            for (let i = 0; i < values.length; i += 3) {
                values[i] *= hipsScale;
                values[i + 1] *= hipsScale;
                values[i + 2] *= hipsScale; // Đã bao gồm scale chuẩn
            }
            tracks.push(new THREE.VectorKeyframeTrack(`${vrmBoneNode.name}.position`, track.times, values));
        }
    }
    return new THREE.AnimationClip(sourceClip.name, sourceClip.duration, tracks);
}



// ─────────────────────────────────────────────────────────────────────────────
// FBXAnimationController
// ─────────────────────────────────────────────────────────────────────────────
export class FBXAnimationController {
  /**
   * @param {import('@pixiv/three-vrm').VRM} vrm
   * @param {string} [animationsDir="/animations/"]
   */
  constructor(vrm, animationsDir = "/animations/") {
    this.vrm = vrm;
    this.animationsDir = animationsDir.endsWith("/") ? animationsDir : animationsDir + "/";

    this.mixer = new THREE.AnimationMixer(vrm.scene);
    this.clips = new Map();
    this.currentAction = null;
    this.loader = new FBXLoader();
    this.FADE_DURATION = 0.3;
  }

  // ── Reset all VRM humanoid bones to T-pose (zero rotation) ───────────────
  // Must be called before the first FBX play so old InitPose offsets are cleared
  resetTPose() {
    const zero = new THREE.Quaternion(); // identity = no rotation

    for (const boneName of ALL_VRM_BONES) {
      const node = this.vrm.humanoid.getNormalizedBoneNode(boneName);
      if (node) {
        node.quaternion.copy(zero);
        node.position.setScalar(0); // reset position offsets too (except root)
      }
    }

    // Also reset via setNormalizedPose to make sure VRM internal state is clean
    const emptyPose = {};
    for (const boneName of ALL_VRM_BONES) {
      emptyPose[boneName] = { rotation: [0, 0, 0, 1] }; // identity quaternion
    }
    this.vrm.humanoid.setNormalizedPose(emptyPose);

    console.log("[FBXAnimCtrl] Bones reset to T-pose.");
  }

  // ── Loading ───────────────────────────────────────────────────────────────

  async load(name, file = null) {
    const filename = file ?? `${name}.fbx`;
    const url = `${this.animationsDir}${filename}`;

    return new Promise((resolve, reject) => {
      this.loader.load(
        url,
        (fbx) => {
          if (!fbx.animations || fbx.animations.length === 0) {
            console.warn(`[FBXAnimCtrl] No animations found in: ${url}`);
            reject(new Error(`No animations in ${url}`));
            return;
          }

          const sourceClip  = fbx.animations[0];
          const retargeted  = retargetClipToVRM(sourceClip, this.vrm, fbx); // add fbx here
          retargeted.name   = name;

          this.clips.set(name, retargeted);
          console.log(`[FBXAnimCtrl] Loaded "${name}" (${retargeted.duration.toFixed(2)}s, ${retargeted.tracks.length} tracks)`);
          resolve(retargeted);
        },
        undefined,
        (err) => {
          console.error(`[FBXAnimCtrl] Failed to load ${url}:`, err);
          reject(err);
        }
      );
    });
  }

  async loadAll(list) {
    await Promise.all(list.map(({ name, file }) => this.load(name, file)));
  }

  // ── Playback ──────────────────────────────────────────────────────────────

  play(name, { loop = true, fadeDuration, timeScale = 0.3 } = {}) {
    const clip = this.clips.get(name);
    if (!clip) {
      console.error(`[FBXAnimCtrl] Animation "${name}" not loaded.`);
      return null;
    }

    const fade   = fadeDuration ?? this.FADE_DURATION;
    const action = this.mixer.clipAction(clip);
    action.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce, Infinity);
    action.clampWhenFinished = !loop;
    action.timeScale = timeScale;

    if (this.currentAction && this.currentAction !== action) {
      this.currentAction.fadeOut(fade);
      action.reset().fadeIn(fade).play();
    } else {
      // First play — reset bones first to clear any InitPose residue
      if (!this.currentAction) {
        this.resetTPose();
      }
      action.reset().play();
    }

    this.currentAction = action;
    console.log(`[FBXAnimCtrl] Playing "${name}" (loop=${loop})`);
    return action;
  }

  stop(fadeDuration) {
    if (!this.currentAction) return;
    const fade = fadeDuration ?? this.FADE_DURATION;
    this.currentAction.fadeOut(fade);
    this.currentAction = null;
  }

  playOnce(name, returnTo = null) {
    const clip = this.clips.get(name);
    if (!clip) {
      console.error(`[FBXAnimCtrl] Animation "${name}" not loaded.`);
      return;
    }

    const action = this.play(name, { loop: false });
    if (!action) return;

    const onFinish = (e) => {
      if (e.action !== action) return;
      this.mixer.removeEventListener("finished", onFinish);
      if (returnTo && this.clips.has(returnTo)) {
        this.play(returnTo, { loop: true });
      } else {
        this.currentAction = null;
      }
    };
    this.mixer.addEventListener("finished", onFinish);
  }

  // ── Update (call every frame) ─────────────────────────────────────────────

  update(delta) {
    this.mixer.update(delta);
  }

  // ── Utilities ─────────────────────────────────────────────────────────────

  list()             { return [...this.clips.keys()]; }
  has(name)          { return this.clips.has(name); }
  getMixer()         { return this.mixer; }
  setFadeDuration(s) { this.FADE_DURATION = s; }
}