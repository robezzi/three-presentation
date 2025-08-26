import React from 'react'
import * as THREE from 'three'
import { useEffect, useRef, useState } from 'react'
import { Canvas, extend, useThree, useFrame } from '@react-three/fiber'
import { useGLTF, useTexture, Environment, Lightformer } from '@react-three/drei'
import { BallCollider, CuboidCollider, Physics, RigidBody, useRopeJoint, useSphericalJoint } from '@react-three/rapier'
import { MeshLineGeometry, MeshLineMaterial } from 'meshline'
import badge from "./assets/tag.glb";
import bander from "./assets/band.png"
import smokeTexture from "./assets/smoke-33819.png" // Добавьте ваше PNG изображение

extend({ MeshLineGeometry, MeshLineMaterial })
useGLTF.preload(badge)
useTexture.preload(bander)
useTexture.preload(smokeTexture)

// PNG smoke particle system with customizable width and height
function PNGSquareSmokeParticles({
    count = 5,
    width = 100,
    height = 100,
    textureUrl = smokeTexture
}) {
    const groupRef = useRef()
    const { camera } = useThree()
    const [particles, setParticles] = useState([])
    const texture = useTexture(textureUrl)

    useEffect(() => {
        if (count === 0) {
            setParticles([])
            return
        }

        const newParticles = Array.from({ length: count }, () => ({
            position: new THREE.Vector3(
                (Math.random() - 0.5) * 5,
                -5 + Math.random() * 3,
                -10 + Math.random() * 5
            ),
            width: width * (0.6 + Math.random() * 0.8),
            height: height * (0.6 + Math.random() * 0.8),
            // Убираем самостоятельное вращение частиц
            speed: 0.5 + Math.random() * 0.8,
            opacity: 0.1 + Math.random() * 0.4,
            scale: 0.5 + Math.random() * 0.3,
            initialY: Math.random()
        }))
        setParticles(newParticles)
    }, [count, width, height])

    useFrame((state, delta) => {
        if (!groupRef.current || particles.length === 0) return

        // Обновляем billboarding для всех частиц
        groupRef.current.children.forEach((mesh, i) => {
            mesh.lookAt(camera.position)
        })

        particles.forEach((particle, i) => {
            // Плавное движение вверх
            particle.position.y += particle.speed * delta

            // Легкое покачивание из стороны в сторону
            particle.position.x += Math.sin(state.clock.elapsedTime * 0.8 + particle.initialY * 10) * 0.1 * delta

            // Плавное изменение размера (дым расширяется)
            particle.scale += 0.1 * delta

            // Постепенное увеличение прозрачности и затем исчезновение
            particle.opacity = Math.max(0, 0.4 - (particle.position.y + 5) / 30)

            // Сброс частиц, которые ушли слишком высоко
            if (particle.position.y > 10 || particle.opacity <= 0) {
                particle.position.set(
                    (Math.random() - 0.5) * 5,
                    -5 + Math.random() * 2,
                    -10 + Math.random() * 3
                )
                particle.width = width * (0.6 + Math.random() * 0.8)
                particle.height = height * (0.6 + Math.random() * 0.8)
                particle.speed = 0.5 + Math.random() * 0.8
                particle.opacity = 0.1 + Math.random() * 0.4
                particle.scale = 0.5 + Math.random() * 0.3
                particle.initialY = Math.random()
            }

            // Обновление позиции и масштаба меша
            const mesh = groupRef.current.children[i]
            if (mesh) {
                mesh.position.copy(particle.position)
                mesh.scale.set(
                    particle.width * particle.scale,
                    particle.height * particle.scale,
                    1
                )

                const material = mesh.material
                material.opacity = particle.opacity
            }
        })
    })

    if (count === 0 || particles.length === 0) {
        return null
    }

    return (
        <group ref={groupRef}>
            {particles.map((_, i) => (
                <mesh key={i}>
                    <planeGeometry args={[1, 1]} />
                    <meshBasicMaterial
                        map={texture}
                        transparent
                        depthWrite={false}
                        side={THREE.DoubleSide}
                        blending={THREE.AdditiveBlending}
                    />
                </mesh>
            ))}
        </group>
    )
}



export default function App() {
    const [transitionState, setTransitionState] = useState('idle') // 'idle', 'dragging', 'transitioning', 'nextPage'
    const [dragProgress, setDragProgress] = useState(0)
    const [showNextPage, setShowNextPage] = useState(false)
    const [finalDragProgress, setFinalDragProgress] = useState(0)

    const handleDragProgress = (progress) => {
        setDragProgress(progress)
        setFinalDragProgress(progress)
    }

    const handleDragEnd = () => {
        if (finalDragProgress > 0.6) {
            setTransitionState('transitioning')
            setTimeout(() => {
                setShowNextPage(true)
                setTransitionState('nextPage')
            }, 1200)
        } else {
            // Плавный возврат, если не дотянули
            setTransitionState('returning')
            setTimeout(() => {
                setDragProgress(0)
                setFinalDragProgress(0)
                setTransitionState('idle')
            }, 500)
        }
    }

    if (showNextPage) {
        return <NextPageComponent />
    }

    const calculateYOffset = () => {
        if (transitionState === 'transitioning') {
            return -100 // Полный переход
        } else if (transitionState === 'returning') {
            // Плавное возвращение с easing
            const progress = 1 - (Date.now() % 1000) / 1000 // Анимируем возврат
            return -finalDragProgress * 100 * progress
        }
        return -dragProgress * 50 // При драге смещаем только на 50% для preview
    }

    return (
        <div className='container-text'>
            <Canvas camera={{ position: [0, 0, 13], fov: 30 }} style={{
                position: 'relative',
                transform: `translateY(${calculateYOffset()}vh)`,
                transition: transitionState === 'transitioning' ?
                    'transform 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)' :
                    transitionState === 'returning' ?
                        'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)' :
                        'none'
            }}>
                <ambientLight intensity={Math.PI} />
                <Physics interpolate gravity={[0, -40, 0]} timeStep={1 / 60}>
                    <Band
                        onDragProgress={handleDragProgress}
                        onDragEnd={handleDragEnd}
                        isTransitioning={transitionState === 'transitioning'}
                    />
                </Physics>

                <PNGSquareSmokeParticles
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
                opacity: 1 - dragProgress * 1.5,
                transition: 'opacity 0.3s ease-in-out'
            }}>
                <h1>Mikhail Kochelev</h1>
                <p>Front-end developer</p>
            </div>

            <div className='right-text' style={{
                opacity: 1 - dragProgress * 1.5,
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
                opacity: 1 - dragProgress * 3,
                transition: 'opacity 0.3s ease-in-out'
            }}>
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g><path d="M0 0h24v24H0z" fill="none" /><path d="M12 2l4.243 4.243-1.415 1.414L12 4.828 9.172 7.657 7.757 6.243 12 2zM2 12l4.243-4.243 1.414 1.415L4.828 12l2.829 2.828-1.414 1.415L2 12zm20 0l-4.243 4.243-1.414-1.415L19.172 12l-2.829-2.828 1.414-1.415L22 12zm-10 2a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 8l-4.243-4.243 1.415-1.414L12 19.172l2.828-2.829 1.415 1.414L12 22z" /></g></svg>
                <p>drag the badge</p>
            </div>
        </div>
    )
}

function Band({ maxSpeed = 50, minSpeed = 10, onDragProgress, onDragEnd, isTransitioning }) {
    const band = useRef(), fixed = useRef(), j1 = useRef(), j2 = useRef(), j3 = useRef(), card = useRef()
    const vec = new THREE.Vector3(), ang = new THREE.Vector3(), rot = new THREE.Vector3(), dir = new THREE.Vector3()
    const segmentProps = { type: 'dynamic', canSleep: true, colliders: false, angularDamping: 2, linearDamping: 2 }
    const { nodes, materials } = useGLTF(badge)
    const texture = useTexture(bander)
    const { width, height } = useThree((state) => state.size)
    const [curve] = useState(() => new THREE.CatmullRomCurve3([new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()]))
    const [dragged, drag] = useState(false)
    const [hovered, hover] = useState(false)
    const dragStartPosition = useRef(new THREE.Vector3())
    const lastProgress = useRef(0)

    useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1])
    useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1])
    useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1])
    useSphericalJoint(j3, card, [[0, 0, 0], [0, 1.45, 0]])

    useEffect(() => {
        if (hovered) {
            document.body.style.cursor = dragged ? 'grabbing' : 'grab'
            return () => void (document.body.style.cursor = 'auto')
        }
    }, [hovered, dragged])

    useFrame((state, delta) => {
        if (dragged && !isTransitioning) {
            vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera)
            dir.copy(vec).sub(state.camera.position).normalize()
            vec.add(dir.multiplyScalar(state.camera.position.length()))

            const dragDistance = dragged.clone().sub(vec).length()
            const progress = Math.min(1, dragDistance / 6) // Увеличил порог для более плавного прогресса

            if (Math.abs(progress - lastProgress.current) > 0.01) {
                onDragProgress(progress)
                lastProgress.current = progress
            }

            ;[card, j1, j2, j3, fixed].forEach((ref) => ref.current?.wakeUp())
            card.current?.setNextKinematicTranslation({
                x: vec.x - dragged.x,
                y: vec.y - dragged.y,
                z: vec.z - dragged.z
            })
        }

        if (fixed.current && !isTransitioning) {
            ;[j1, j2].forEach((ref) => {
                if (!ref.current.lerped) ref.current.lerped = new THREE.Vector3().copy(ref.current.translation())
                const clampedDistance = Math.max(0.1, Math.min(1, ref.current.lerped.distanceTo(ref.current.translation())))
                ref.current.lerped.lerp(ref.current.translation(), delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed)))
            })
            curve.points[0].copy(j3.current.translation())
            curve.points[1].copy(j2.current.lerped)
            curve.points[2].copy(j1.current.lerped)
            curve.points[3].copy(fixed.current.translation())
            band.current.geometry.setPoints(curve.getPoints(32))
            ang.copy(card.current.angvel())
            rot.copy(card.current.rotation())
            card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z })
        }
    })

    curve.curveType = 'chordal'
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping

    return (
        <>
            <group position={[0, 4, 0]}>
                <RigidBody ref={fixed} {...segmentProps} type="fixed" />
                <RigidBody position={[0.5, 0, 0]} ref={j1} {...segmentProps}>
                    <BallCollider args={[0.1]} />
                </RigidBody>
                <RigidBody position={[1, 0, 0]} ref={j2} {...segmentProps}>
                    <BallCollider args={[0.1]} />
                </RigidBody>
                <RigidBody position={[1.5, 0, 0]} ref={j3} {...segmentProps}>
                    <BallCollider args={[0.1]} />
                </RigidBody>
                <RigidBody
                    position={[2, 0, 0]}
                    ref={card}
                    {...segmentProps}
                    type={dragged && !isTransitioning ? 'kinematicPosition' : 'dynamic'}
                >
                    <CuboidCollider args={[0.8, 1.125, 0.01]} />
                    <group
                        scale={2.25}
                        position={[0, -1.2, -0.05]}
                        onPointerOver={() => !isTransitioning && hover(true)}
                        onPointerOut={() => !isTransitioning && hover(false)}
                        onPointerUp={(e) => {
                            if (isTransitioning) return
                            e.target.releasePointerCapture(e.pointerId)
                            drag(false)
                            onDragEnd()
                        }}
                        onPointerDown={(e) => {
                            if (isTransitioning) return
                            e.target.setPointerCapture(e.pointerId)
                            dragStartPosition.current.copy(card.current.translation())
                            drag(new THREE.Vector3().copy(e.point).sub(vec.copy(card.current.translation())))
                        }}>
                        <mesh geometry={nodes.card.geometry}>
                            <meshPhysicalMaterial map={materials.base.map} map-anisotropy={16} clearcoat={1} clearcoatRoughness={0.15} roughness={0.3} metalness={0.5} />
                        </mesh>
                        <mesh geometry={nodes.clip.geometry} material={materials.metal} material-roughness={0.3} />
                        <mesh geometry={nodes.clamp.geometry} material={materials.metal} />
                    </group>
                </RigidBody>
            </group>
            <mesh ref={band}>
                <meshLineGeometry />
                <meshLineMaterial color="white" depthTest={false} resolution={[width, height]} useMap map={texture} repeat={[-3, 1]} lineWidth={1} />
            </mesh>
        </>
    )
}

// Компонент следующей страницы
function NextPageComponent() {
    return (
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(45deg, #000000, #1a1a1a)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'white',
            fontSize: '2rem',
            opacity: 0,
            animation: 'fadeIn 1s ease-in-out forwards'
        }}>
            <style>
                {`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                `}
            </style>
            <h1>Добро пожаловать на следующую страницу!</h1>
        </div>
    )
}