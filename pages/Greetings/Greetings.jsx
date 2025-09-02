import React, { useMemo, useState, useEffect } from 'react'
import { Canvas, extend } from '@react-three/fiber'
import { useGLTF, useTexture, Environment, Lightformer } from '@react-three/drei'
import { Physics } from '@react-three/rapier'
import { MeshLineGeometry, MeshLineMaterial } from 'meshline'
import {
    EffectComposer,
    BrightnessContrast,
    Bloom,
    Noise,
    Vignette
} from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'

import badge from "../../assets/tag.glb";
import bander from "../../assets/band.png"
import smokeTexture from "../../assets/smoke-33819.png"

import Band from "./utils/Band"
import Smoke from "./utils/Smoke"

extend({ MeshLineGeometry, MeshLineMaterial })
useGLTF.preload(badge)
useTexture.preload(bander)
useTexture.preload(smokeTexture)

function useGridTexture() {
    return useMemo(() => {
        const canvas = document.createElement('canvas')
        canvas.width = canvas.height = 256
        const ctx = canvas.getContext('2d')


        ctx.fillStyle = 'rgba(58, 58, 58, 0.69)'
        ctx.fillRect(0, 0, 256, 256)


        ctx.strokeStyle = 'rgba(0, 180, 252, 1)'
        ctx.lineWidth = 2

        for (let i = 0; i < 256; i += 16) {
            ctx.beginPath()
            ctx.moveTo(i, 0)
            ctx.lineTo(i, 256)
            ctx.stroke()
            ctx.beginPath()
            ctx.moveTo(0, i)
            ctx.lineTo(256, i)
            ctx.stroke()
        }

        const texture = new THREE.CanvasTexture(canvas)
        texture.wrapS = THREE.RepeatWrapping
        texture.wrapT = THREE.RepeatWrapping
        texture.repeat.set(2000, 2000) // Повторяем текстуру
        return texture
    }, [])
}

// Модифицированный компонент Smoke с grid эффектом
function SmokeWithGrid({ count = 1, width = 100, height = 100 }) {
    const gridTexture = useGridTexture()

    return (
        <group>
            <Smoke count={count} width={width} height={height} />
            {/* Дополнительный mesh с grid эффектом поверх дыма */}
            <mesh position={[0, 0, -1]} scale={20}>
                <planeGeometry args={[10, 10]} />
                <meshBasicMaterial
                    map={gridTexture}
                    transparent
                    opacity={0.4}
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>
        </group>
    )
}




export default function Greeting() {
    return (
        <div className='greetings'>
            <Canvas className='badge' camera={{ position: [0, 0, 13], fov: 30 }} style={{ position: 'absolute' }}>
                <ambientLight intensity={Math.PI} />


                <group>
                    <Physics interpolate gravity={[0, -40, 0]} timeStep={1 / 60}>
                        <Band />
                    </Physics>
                </group>
                <SmokeWithGrid count={3} width={50} height={50} />
                <Environment background blur={0.75}>
                    <color attach="background" args={['black']} />
                    <Lightformer intensity={2} color="white" position={[0, -1, 5]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
                    <Lightformer intensity={3} color="white" position={[-1, -1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
                    <Lightformer intensity={3} color="white" position={[1, 1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
                    <Lightformer intensity={10} color="white" position={[-10, 0, 14]} rotation={[0, Math.PI / 2, Math.PI / 3]} scale={[100, 10, 1]} />
                </Environment>
                <EffectComposer>
                    <Bloom
                        intensity={0.5}
                        luminanceThreshold={0.4}
                        luminanceSmoothing={0.9}
                        height={300}
                    />
                    <BrightnessContrast
                        brightness={0.01}
                        contrast={0.14}
                    />
                    <Noise
                        opacity={0.02}
                        premultiply
                        blendFunction={BlendFunction.ADD}
                    />
                    <Vignette
                        darkness={0.5}
                        offset={0.5}
                    />
                </EffectComposer>
            </Canvas>
            <div className='container content-width'>
                <div className='left-text'>
                    <h1>Mikhail Kochelev</h1>
                    <p>Front-end developer</p>
                </div>
                <div className='drag'>
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g><path d="M0 0h24v24H0z" fill="none" /><path d="M12 2l4.243 4.243-1.415 1.414L12 4.828 9.172 7.657 7.757 6.243 12 2zM2 12l4.243-4.243 1.414 1.415L4.828 12l2.829 2.828-1.414 1.415L2 12zm20 0l-4.243 4.243-1.414-1.415L19.172 12l-2.829-2.828 1.414-1.415L22 12zm-10 2a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 8l-4.243-4.243 1.415-1.414L12 19.172l2.828-2.829 1.415 1.414L12 22z" /></g></svg>
                    <p>drag the badge</p>
                </div>
            </div>
        </div>
    )
}