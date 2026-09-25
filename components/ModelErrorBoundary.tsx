"use client";

import { Component, ReactNode } from "react";

export default class ModelErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; fallback: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    // console.error (not warn) so it's impossible to miss in DevTools.
    // Usual causes: scene.gltf / scene.bin / textures/ not in public/models,
    // or a Draco/meshopt file that failed to decode.
    console.error(
      "[CarScene] Failed to load /models/scene.gltf. Check the Network tab: " +
        "scene.gltf, scene.bin and every file in textures/ must return 200 " +
        "from public/models/.",
      error
    );
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}
