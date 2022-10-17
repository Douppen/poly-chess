/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
author: hanoldaa (https://sketchfab.com/hanoldaa)
license: CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)
source: https://sketchfab.com/3d-models/low-poly-chess-set-0f440e2b01ca42f8b3fdee8178c51f20
title: Low Poly Chess Set
*/

import React from "react";
import { useGLTF } from "@react-three/drei";

export default function ChessModel(props) {
  const { nodes, materials } = useGLTF("/low-poly-chess-set.glb");
  return (
    <group {...props} dispose={null}>
      <group rotation={[-Math.PI / 2, 0, 0]}>
        <group position={[4.08, 1.01, 5.9]} rotation={[-0.27, 0.6, 1.93]} />
        <group position={[-2, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <group position={[-3, 0, 0]}>
            <mesh
              geometry={nodes.Bishop001_0.geometry}
              material={materials.Bishop}
            />
          </group>
          <mesh
            geometry={nodes.Bishop_0.geometry}
            material={materials.Bishop}
          />
        </group>
        <group position={[0, -1, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <group position={[-7, 0, 0]}>
            <mesh
              geometry={nodes.Pawn007_0.geometry}
              material={materials.Pawn}
            />
          </group>
          <group position={[-6, 0, 0]}>
            <mesh
              geometry={nodes.Pawn006_0.geometry}
              material={materials.Pawn}
            />
          </group>
          <group position={[-5, 0, 0]}>
            <mesh
              geometry={nodes.Pawn005_0.geometry}
              material={materials.Pawn}
            />
          </group>
          <group position={[-4, 0, 0]}>
            <mesh
              geometry={nodes.Pawn004_0.geometry}
              material={materials.Pawn}
            />
          </group>
          <group position={[-3, 0, 0]}>
            <mesh
              geometry={nodes.Pawn003_0.geometry}
              material={materials.Pawn}
            />
          </group>
          <group position={[-2, 0, 0]}>
            <mesh
              geometry={nodes.Pawn002_0.geometry}
              material={materials.Pawn}
            />
          </group>
          <group position={[-1, 0, 0]}>
            <mesh
              geometry={nodes.Pawn001_0.geometry}
              material={materials.Pawn}
            />
          </group>
          <mesh geometry={nodes.Pawn_0.geometry} material={materials.Pawn} />
        </group>
        <group rotation={[Math.PI / 2, 0, 0]}>
          <mesh geometry={nodes.Board_0.geometry} material={materials.Lights} />
          <mesh geometry={nodes.Board_1.geometry} material={materials.Darks} />
        </group>
        <group rotation={[Math.PI / 2, 0, 0]}>
          <group position={[-7, 0, 0]}>
            <mesh
              geometry={nodes.Rook001_0.geometry}
              material={materials.Rook}
            />
          </group>
          <mesh geometry={nodes.Rook_0.geometry} material={materials.Rook} />
        </group>
        <group position={[-3, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh geometry={nodes.Queen_0.geometry} material={materials.Queen} />
        </group>
        <group position={[-4, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh geometry={nodes.King_0.geometry} material={materials.King} />
        </group>
        <group position={[-1, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <group position={[-5, 0, 0]}>
            <mesh
              geometry={nodes.Knight001_0.geometry}
              material={materials.Knight}
            />
          </group>
          <mesh
            geometry={nodes.Knight_0.geometry}
            material={materials.Knight}
          />
        </group>
        <group position={[-2, -7, 0]} rotation={[-Math.PI / 2, 0, -Math.PI]}>
          <group position={[3, 0, 0]}>
            <mesh
              geometry={nodes.Bishop003_0.geometry}
              material={materials.Bishop_Dark}
            />
          </group>
          <mesh
            geometry={nodes.Bishop002_0.geometry}
            material={materials.Bishop_Dark}
          />
        </group>
        <group position={[-3, -7, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh
            geometry={nodes.King001_0.geometry}
            material={materials.KingDark}
          />
        </group>
        <group position={[-1, -7, 0]} rotation={[-Math.PI / 2, 0, -Math.PI]}>
          <mesh
            geometry={nodes.Knight002_0.geometry}
            material={materials.KnightDark}
          />
        </group>
        <group position={[-6, -7, 0]} rotation={[-Math.PI / 2, 0, -Math.PI]}>
          <mesh
            geometry={nodes.Knight003_0.geometry}
            material={materials.KnightDark}
          />
        </group>
        <group position={[-4, -7, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh
            geometry={nodes.Queen001_0.geometry}
            material={materials.QueenDark}
          />
        </group>
        <group position={[0, -7, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh
            geometry={nodes.Rook002_0.geometry}
            material={materials.RookDark}
          />
        </group>
        <group position={[-7, -7, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh
            geometry={nodes.Rook003_0.geometry}
            material={materials.RookDark}
          />
        </group>
        <group position={[0, -6, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh
            geometry={nodes.Pawn008_0.geometry}
            material={materials.PawnDark}
          />
        </group>
        <group position={[-1, -6, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh
            geometry={nodes.Pawn009_0.geometry}
            material={materials.PawnDark}
          />
        </group>
        <group position={[-2, -6, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh
            geometry={nodes.Pawn010_0.geometry}
            material={materials.PawnDark}
          />
        </group>
        <group position={[-3, -6, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh
            geometry={nodes.Pawn011_0.geometry}
            material={materials.PawnDark}
          />
        </group>
        <group position={[-4, -6, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh
            geometry={nodes.Pawn012_0.geometry}
            material={materials.PawnDark}
          />
        </group>
        <group position={[-5, -6, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh
            geometry={nodes.Pawn013_0.geometry}
            material={materials.PawnDark}
          />
        </group>
        <group position={[-6, -6, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh
            geometry={nodes.Pawn014_0.geometry}
            material={materials.PawnDark}
          />
        </group>
        <group position={[-7, -6, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh
            geometry={nodes.Pawn015_0.geometry}
            material={materials.PawnDark}
          />
        </group>
      </group>
    </group>
  );
}

useGLTF.preload("/low-poly-chess-set.glb");
