"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import {
  Environment,
  Html,
  Lightformer,
  Loader,
  PerspectiveCamera,
  MeshReflectorMaterial,
} from "@react-three/drei";
import CarModel from "./CarModel";
import ModelErrorBoundary from "./ModelErrorBoundary";

// Shown (dev only) inside the canvas if the model fails to load.
function MissingModelNotice() {
  if (process.env.NODE_ENV === "production") return null;
  return (
    <Html center>
      <div
        style={{
          color: "#f9d9d1",
          font: "12px/1.5 monospace",
          textAlign: "center",
          whiteSpace: "nowrap",
        }}
      >
        /models/scene.gltf failed to load
        <br />
        (see console + Network tab)
      </div>
    </Html>
  );
}

export default function CarScene({
  orbitProgressRef,
}: {
  orbitProgressRef: React.MutableRefObject<number>;
}) {
  return (
    <>
      <Canvas
        dpr={[1, 1.75]}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        shadows
        className="!absolute !inset-0"
      >
        <color attach="background" args={["#000000"]} />
        <fog attach="fog" args={["#000000", 9, 24]} />

        <PerspectiveCamera makeDefault fov={35} position={[-6, 1.4, 0]} />

        {/* Procedural studio reflections (no download). Without an environment
            the car's dark, glossy paint reflects pure black and disappears
            against the black background. */}
        <Environment resolution={256} frames={1}>
          <Lightformer form="rect" intensity={2.2} position={[0, 6, 0]} rotation-x={Math.PI / 2} scale={[12, 12, 1]} />
          <Lightformer form="rect" intensity={3} color="#eef2ff" position={[-7, 1.5, 0]} rotation-y={Math.PI / 2} scale={[10, 2.5, 1]} />
          <Lightformer form="rect" intensity={3} color="#eef2ff" position={[7, 1.5, 0]} rotation-y={-Math.PI / 2} scale={[10, 2.5, 1]} />
          <Lightformer form="rect" intensity={2.5} color="#ef2a3b" position={[0, 1.5, -7]} scale={[10, 2, 1]} />
          <Lightformer form="rect" intensity={1.5} color="#8fa0ff" position={[0, 1.2, 7]} rotation-y={Math.PI} scale={[10, 1.5, 1]} />
        </Environment>

        <hemisphereLight args={["#1a2038", "#000000", 0.4]} />

        {/* key light: cool white spot, like a single showroom downlight */}
        <spotLight
          position={[-3, 6, 2]}
          angle={0.45}
          penumbra={0.6}
          intensity={120}
          color="#eef2ff"
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        {/* rim light: brand red, separates the car from the black background */}
        <pointLight position={[3, 1.2, -3]} intensity={8} color="#ef2a3b" />
        {/* soft fill from the front, low, like a headlight bounce off the floor */}
        <pointLight position={[0, 0.4, 4]} intensity={3} color="#8fa0ff" />

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
          <planeGeometry args={[40, 40]} />
          <MeshReflectorMaterial
            mirror={0}
            blur={[300, 100]}
            resolution={1024}
            mixBlur={1}
            mixStrength={35}
            roughness={1}
            depthScale={1}
            minDepthThreshold={0.85}
            color="#050505"
            metalness={0.6}
          />
        </mesh>

        <Suspense fallback={null}>
          <ModelErrorBoundary fallback={<MissingModelNotice />}>
            <CarModel orbitProgressRef={orbitProgressRef} />
          </ModelErrorBoundary>
        </Suspense>
      </Canvas>

      <Loader
        containerStyles={{ background: "rgba(7,7,10,0.92)" }}
        innerStyles={{ width: "220px" }}
        barStyles={{ background: "#ef2a3b" }}
        dataStyles={{
          color: "#f9d9d1",
          fontSize: "11px",
          letterSpacing: "0.25em",
          textTransform: "uppercase",
          marginTop: "10px",
        }}
        dataInterpolation={(p) => `Loading the car — ${p.toFixed(0)}%`}
      />
    </>
  );
}
