export async function loadFBXAnimations() {
  const animList = [
    { name: "idle", file: "Angry.fbx" },
    // { name: "wave",    file: "wave.fbx"    },
    // { name: "dance",   file: "dance.fbx"   },
    // { name: "talking", file: "talking.fbx" },
  ];

  const results = await Promise.allSettled(
    animList.map(({ name, file }) => fbxAnimController.load(name, file))
  );

  results.forEach((r, i) => {
    if (r.status === "rejected") {
      console.warn(`[FBX] Failed to load "${animList[i].name}":`, r.reason);
    }
  });

  console.log("[FBX] Loaded:", fbxAnimController.list());

  // Auto-play idle if loaded successfully
  if (fbxAnimController.has("idle")) {
    fbxAnimController.play("idle", { loop: true });
    console.log("[FBX] Playing idle animation.");
  }
}