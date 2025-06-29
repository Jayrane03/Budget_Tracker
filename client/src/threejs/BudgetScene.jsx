// src/threejs/BudgetScene.jsx
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Float, useGLTF, Environment } from '@react-three/drei';

const Coin = () => {
  const { scene } = useGLTF('/bitcoin.glb');
  return <primitive object={scene} scale={1.2} position={[0, -0.2, 0]} />;
};

useGLTF.preload('/bitcoin.glb'); // Preload GLB model

const BudgetScene = () => {
  return (
    <Canvas
      className="three-canvas"
      camera={{ position: [0, 0, 5], fov: 50 }}
      gl={{ antialias: true }}
    >
      <ambientLight intensity={0.7} />
      <directionalLight position={[4, 7, 5]} intensity={1.2} />

      <Suspense fallback={null}>
        <Environment preset="city" />
        <Float speed={2} rotationIntensity={1.5} floatIntensity={2.5}>
          <Coin />
        </Float>
      </Suspense>

      <OrbitControls enableZoom={false} enablePan={false} />
    </Canvas>
  );
};

export default BudgetScene;
