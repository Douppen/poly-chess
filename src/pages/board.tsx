import ChessModel from "../components/ChessModel";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

const GamePage = () => {
  return (
    <div id="canvas-container" style={{ height: "100vh" }}>
      <Canvas camera={{ position: [5, 10, 10], fov: 50 }}>
        <hemisphereLight color="white" intensity={0.45} />
        <spotLight position={[50, 50, 10]} angle={0.15} penumbra={1} />
        <group position={[4, 0, -3]}>
          <ChessModel />
        </group>
        <OrbitControls />
      </Canvas>
    </div>
  );
};

export default GamePage;
