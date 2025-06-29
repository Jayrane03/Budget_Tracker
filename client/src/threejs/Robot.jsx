import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, useGLTF, Float, OrbitControls } from '@react-three/drei';

const Robot = () => {
  const { scene } = useGLTF('/cute_robot.glb');
  const robotRef = useRef();

  // Small continuous rotation animation
  useFrame(() => {
    if (robotRef.current) {
      robotRef.current.rotation.y += 0.005; // smooth Y-axis rotation
    }
  });

  return <primitive ref={robotRef} object={scene} scale={1} position={[0, -1.5, 0]} />;
};

useGLTF.preload('/cute_robot.glb');

const RobotScene = () => {
  return (
    <div className="three-background" style={{ width: '450px', height: '400px' , marginLeft:'50px' ,  }}>
      <Canvas camera={{ position: [2.5, 1.5, 5], fov: 55 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 4, 5]} intensity={1} />
        <Suspense fallback={null}>
          <Environment preset="sunset" />
          <Float floatIntensity={1} speed={1.2}>
            <Robot />
          </Float>
        </Suspense>
        <OrbitControls enableZoom={false} enablePan={false} dampingFactor={0.1} enableDamping />

      </Canvas>
    </div>
  );
};

export default RobotScene;
