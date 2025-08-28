import React from 'react'
import * as THREE from 'three'
import { useEffect, useRef, useState } from 'react'
import { Canvas, extend, useThree, useFrame } from '@react-three/fiber'
import { useGLTF, useTexture, Environment, Lightformer } from '@react-three/drei'
import { BallCollider, CuboidCollider, Physics, RigidBody, useRopeJoint, useSphericalJoint } from '@react-three/rapier'
import { MeshLineGeometry, MeshLineMaterial } from 'meshline'

import badge from "../../assets/tag.glb";
import bander from "../../assets/band.png"
import smokeTexture from "../../assets/smoke-33819.png"

import Band from "./utils/Band"
import Smoke from "./utils/Smoke"

import "../../styles/greetings.css"

extend({ MeshLineGeometry, MeshLineMaterial })
useGLTF.preload(badge)
useTexture.preload(bander)
useTexture.preload(smokeTexture)

export default function Greeting() {
    return (
        <>
            <div className='container-text'>
                <Canvas camera={{ position: [0, 0, 13], fov: 30 }} style={{
                    position: 'relative',
                }}>
                    <ambientLight intensity={Math.PI} />
                    <Physics interpolate gravity={[0, -40, 0]} timeStep={1 / 60}>
                        <Band />
                    </Physics>

                    <Smoke
                        count={3}
                        width={50}
                        height={50}
                    />

                    <Environment background blur={0.75}>
                        <color attach="background" args={['black']} />
                        <Lightformer intensity={2} color="white" position={[0, -1, 5]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
                        <Lightformer intensity={3} color="white" position={[-1, -1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
                        <Lightformer intensity={3} color="white" position={[1, 1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
                        <Lightformer intensity={10} color="white" position={[-10, 0, 14]} rotation={[0, Math.PI / 2, Math.PI / 3]} scale={[100, 10, 1]} />
                    </Environment>
                </Canvas>

                <div className='left-text' style={{
                    transition: 'opacity 0.3s ease-in-out'
                }}>
                    <h1>Mikhail Kochelev</h1>
                    <p>Front-end developer</p>
                </div>

                <div className='right-text' style={{
                    transition: 'opacity 0.3s ease-in-out'
                }}>
                    <p>Tech stack</p>
                    <ul>
                        <li>React</li>
                        <li>TypeScript</li>
                        <li>Redux</li>
                        <li>Webpack</li>
                        <li>Git</li>
                        <li>CI/CD</li>
                    </ul>
                </div>

                <div className='drag' style={{
                    transition: 'opacity 0.3s ease-in-out'
                }}>
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g><path d="M0 0h24v24H0z" fill="none" /><path d="M12 2l4.243 4.243-1.415 1.414L12 4.828 9.172 7.657 7.757 6.243 12 2zM2 12l4.243-4.243 1.414 1.415L4.828 12l2.829 2.828-1.414 1.415L2 12zm20 0l-4.243 4.243-1.414-1.415L19.172 12l-2.829-2.828 1.414-1.415L22 12zm-10 2a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 8l-4.243-4.243 1.415-1.414L12 19.172l2.828-2.829 1.415 1.414L12 22z" /></g></svg>
                    <p>drag the badge</p>
                </div>
            </div>
        </>
    )
}
