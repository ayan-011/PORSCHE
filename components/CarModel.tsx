"use client";

import { useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

const MODEL_PATH = "/models/scene.gltf";

// Start downloading as soon as this module is imported.
useGLTF.preload(MODEL_PATH);

/**
 * orbitProgressRef: 0 -> 1 driven externally from scroll.
 *   0    = start side view
 *   0.5  = pushed-in front view
 *   1    = end side view (mirrored profile)
 */
export default function CarModel({
  orbitProgressRef,
}: {
  orbitProgressRef: React.MutableRefObject<number>;
}) {
  const { scene } = useGLTF(MODEL_PATH);
  const camera = useThree((s) => s.camera);

  // IMPORTANT: useGLTF caches `scene` and shares it. The old code mutated that
  // cached object inside useMemo. React StrictMode (on in next.config.js) runs
  // useMemo twice in dev, so the 2nd run re-measured the already-scaled model,
  // computed scale = 1 and reset it to its raw, tiny size (this Sketchfab
  // export is ~0.05 units long) -> car effectively invisible.
  // Fix: work on a clone, and always start from an identity transform so the
  // fit is idempotent no matter how many times it runs.
  const { model, targetY, radius } = useMemo(() => {
    const model = scene.clone(true);
    model.position.set(0, 0, 0);
    model.rotation.set(0, 0, 0);
    model.scale.setScalar(1);
    model.updateMatrixWorld(true);

    const box = new THREE.Box3().setFromObject(model);
    if (box.isEmpty()) {
      console.error("[CarModel] Loaded model has an empty bounding box.");
    }
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z) || 1;

    const targetLength = 4.4; // longest side, in world units
    model.scale.setScalar(targetLength / maxDim);
    model.updateMatrixWorld(true);

    // re-measure after scaling, centre on x/z and sit the wheels on y = 0
    const box2 = new THREE.Box3().setFromObject(model);
    const size2 = box2.getSize(new THREE.Vector3());
    const center2 = box2.getCenter(new THREE.Vector3());
    model.position.set(-center2.x, -box2.min.y, -center2.z);
    model.updateMatrixWorld(true);

    model.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });

    return {
      model,
      targetY: size2.y * 0.42,
      radius: Math.max(size2.x, size2.z) * 1.35,
    };
  }, [scene]);

  useFrame(() => {
    const t = orbitProgressRef.current; // 0..1
    const eased = THREE.MathUtils.smoothstep(t, 0, 1);
    // -90deg (car's right side) -> 0 (nose) -> +90deg (car's left side)
    const angle = THREE.MathUtils.degToRad(-90 + eased * 180);
    const r = radius * (1 - 0.32 * Math.sin(eased * Math.PI));
    const height = targetY * (1 + 0.25 * Math.sin(eased * Math.PI));

    camera.position.set(Math.sin(angle) * r, height, Math.cos(angle) * r);
    camera.lookAt(0, targetY * 0.72, 0);
  });

  return <primitive object={model} dispose={null} />;
}
