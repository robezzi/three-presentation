import React, { useMemo, useRef, useEffect, Suspense } from 'react'
import _ from 'lodash';
import { Canvas, extend } from '@react-three/fiber'; // Добавьте extend обратно
import { useGLTF, useTexture, Lightformer } from '@react-three/drei';
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

import badge from "../../assets/tag-v1.glb";
import bander from "../../assets/band.png"
import smokeTexture from "../../assets/smoke-33819.png"


const Environment = React.lazy(() => import('@react-three/drei').then(mod => ({ default: mod.Environment })));
const Band = React.lazy(() => import('./components/Band'))
const Smoke = React.lazy(() => import('./components/Smoke'))

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
        texture.repeat.set(2000, 2000)
        return texture
    }, [])
}

function SmokeWithGrid({ count = 1, width = 100, height = 100 }) {
    const gridTexture = useGridTexture()

    return (
        <group>
            <Suspense>
                <Smoke count={count} width={width} height={height} />
            </Suspense>
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
    const canvasRef = useRef();

    useEffect(() => {
        const handleResize = () => {
            if (canvasRef.current) {
                const canvas = canvasRef.current;
                const { width, height } = canvas.getBoundingClientRect();
                canvas.width = width;
                canvas.height = height;
            }
        };

        const throttledResize = _.throttle(handleResize, 100);
        window.addEventListener('resize', throttledResize);
        handleResize();

        return () => window.removeEventListener('resize', throttledResize);
    }, []);
    return (
        <div className='greetings'>
            <Canvas
                ref={canvasRef}
                className='badge'
                camera={{ position: [0, 0, 13], fov: 30 }}
                style={{ position: 'absolute' }}
                performance={{ min: 0.5 }}
                dpr={Math.min(window.devicePixelRatio, 2)}
            >
                <ambientLight intensity={Math.PI} />
                <group>
                    <Physics interpolate gravity={[0, -40, 0]} timeStep={1 / 60}>
                        <Suspense fallback={null}>
                            <Band />
                        </Suspense>
                    </Physics>
                </group>
                <SmokeWithGrid count={3} width={50} height={50} />
                <Suspense fallback={null}>
                    <Environment background blur={0.75}>
                        <color attach="background" args={['black']} />
                        <Lightformer intensity={2} color="white" position={[0, -1, 5]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
                        <Lightformer intensity={3} color="white" position={[-1, -1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
                        <Lightformer intensity={3} color="white" position={[1, 1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
                        <Lightformer intensity={10} color="white" position={[-10, 0, 14]} rotation={[0, Math.PI / 2, Math.PI / 3]} scale={[100, 10, 1]} />
                    </Environment>
                </Suspense>
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
                    <ul>
                        <p>Links:</p>
                        <li>
                            <a href="https://t.me/Robezzi">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50"><path d="M25,2c12.703,0,23,10.297,23,23S37.703,48,25,48S2,37.703,2,25S12.297,2,25,2z M32.934,34.375	c0.423-1.298,2.405-14.234,2.65-16.783c0.074-0.772-0.17-1.285-0.648-1.514c-0.578-0.278-1.434-0.139-2.427,0.219	c-1.362,0.491-18.774,7.884-19.78,8.312c-0.954,0.405-1.856,0.847-1.856,1.487c0,0.45,0.267,0.703,1.003,0.966	c0.766,0.273,2.695,0.858,3.834,1.172c1.097,0.303,2.346,0.04,3.046-0.395c0.742-0.461,9.305-6.191,9.92-6.693	c0.614-0.502,1.104,0.141,0.602,0.644c-0.502,0.502-6.38,6.207-7.155,6.997c-0.941,0.959-0.273,1.953,0.358,2.351	c0.721,0.454,5.906,3.932,6.687,4.49c0.781,0.558,1.573,0.811,2.298,0.811C32.191,36.439,32.573,35.484,32.934,34.375z"></path></svg>
                                <p>@Robezzi</p>
                            </a>
                        </li>
                        <li>
                            <a href="https://github.com/robezzi/robezzi">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50"><path d="M17.791,46.836C18.502,46.53,19,45.823,19,45v-5.4c0-0.197,0.016-0.402,0.041-0.61C19.027,38.994,19.014,38.997,19,39 c0,0-3,0-3.6,0c-1.5,0-2.8-0.6-3.4-1.8c-0.7-1.3-1-3.5-2.8-4.7C8.9,32.3,9.1,32,9.7,32c0.6,0.1,1.9,0.9,2.7,2c0.9,1.1,1.8,2,3.4,2 c2.487,0,3.82-0.125,4.622-0.555C21.356,34.056,22.649,33,24,33v-0.025c-5.668-0.182-9.289-2.066-10.975-4.975 c-3.665,0.042-6.856,0.405-8.677,0.707c-0.058-0.327-0.108-0.656-0.151-0.987c1.797-0.296,4.843-0.647,8.345-0.714 c-0.112-0.276-0.209-0.559-0.291-0.849c-3.511-0.178-6.541-0.039-8.187,0.097c-0.02-0.332-0.047-0.663-0.051-0.999 c1.649-0.135,4.597-0.27,8.018-0.111c-0.079-0.5-0.13-1.011-0.13-1.543c0-1.7,0.6-3.5,1.7-5c-0.5-1.7-1.2-5.3,0.2-6.6 c2.7,0,4.6,1.3,5.5,2.1C21,13.4,22.9,13,25,13s4,0.4,5.6,1.1c0.9-0.8,2.8-2.1,5.5-2.1c1.5,1.4,0.7,5,0.2,6.6c1.1,1.5,1.7,3.2,1.6,5 c0,0.484-0.045,0.951-0.11,1.409c3.499-0.172,6.527-0.034,8.204,0.102c-0.002,0.337-0.033,0.666-0.051,0.999 c-1.671-0.138-4.775-0.28-8.359-0.089c-0.089,0.336-0.197,0.663-0.325,0.98c3.546,0.046,6.665,0.389,8.548,0.689 c-0.043,0.332-0.093,0.661-0.151,0.987c-1.912-0.306-5.171-0.664-8.879-0.682C35.112,30.873,31.557,32.75,26,32.969V33 c2.6,0,5,3.9,5,6.6V45c0,0.823,0.498,1.53,1.209,1.836C41.37,43.804,48,35.164,48,25C48,12.318,37.683,2,25,2S2,12.318,2,25 C2,35.164,8.63,43.804,17.791,46.836z"></path></svg>
                                <p>/Robezzi</p>
                            </a>
                        </li>
                    </ul>
                </div>
                <div className='drag'>
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g><path d="M0 0h24v24H0z" fill="none" /><path d="M12 2l4.243 4.243-1.415 1.414L12 4.828 9.172 7.657 7.757 6.243 12 2zM2 12l4.243-4.243 1.414 1.415L4.828 12l2.829 2.828-1.414 1.415L2 12zm20 0l-4.243 4.243-1.414-1.415L19.172 12l-2.829-2.828 1.414-1.415L22 12zm-10 2a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 8l-4.243-4.243 1.415-1.414L12 19.172l2.828-2.829 1.415 1.414L12 22z" /></g></svg>
                    <p>drag the badge</p>
                </div>
            </div>
        </div>
    )
}