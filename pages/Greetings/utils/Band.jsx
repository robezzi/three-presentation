import React from 'react'
import * as THREE from 'three'
import { useEffect, useRef, useState } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { useGLTF, useTexture } from '@react-three/drei'
import { BallCollider, CuboidCollider, RigidBody, useRopeJoint, useSphericalJoint } from '@react-three/rapier'

import badge from "../../../assets/tag.glb";
import bander from "../../../assets/band.png"


export default function Band({ maxSpeed = 50, minSpeed = 10, isTransitioning }) {
    const band = useRef(), fixed = useRef(), j1 = useRef(), j2 = useRef(), j3 = useRef(), card = useRef()
    const vec = new THREE.Vector3(), ang = new THREE.Vector3(), rot = new THREE.Vector3(), dir = new THREE.Vector3()
    const segmentProps = { type: 'dynamic', canSleep: true, colliders: false, angularDamping: 2, linearDamping: 2 }
    const { nodes, materials } = useGLTF(badge)
    const texture = useTexture(bander)
    const { width, height } = useThree((state) => state.size)
    const [curve] = useState(() => new THREE.CatmullRomCurve3([new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()]))
    const [dragged, drag] = useState(false)
    const [hovered, hover] = useState(false)
    const [bandPosition, setBandPosition] = useState([3, 4, 0]);
    const dragStartPosition = useRef(new THREE.Vector3())
    const groupPositionRef = useRef(new THREE.Vector3(...bandPosition))

    useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1])
    useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1])
    useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1])
    useSphericalJoint(j3, card, [[0, 0, 0], [0, 1.45, 0]])

    useEffect(() => {
        const handleResize = () => {
            if (window.screen.width < 1440) {
                setBandPosition([0, 6, 0]);
            } else {
                setBandPosition([3, 4, 0]);
            }
        };
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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

            // Обновляем точки кривой с учетом позиции группы
            curve.points[0].copy(j3.current.translation()).sub(groupPositionRef.current)
            curve.points[1].copy(j2.current.lerped).sub(groupPositionRef.current)
            curve.points[2].copy(j1.current.lerped).sub(groupPositionRef.current)
            curve.points[3].copy(fixed.current.translation()).sub(groupPositionRef.current)

            band.current.geometry.setPoints(curve.getPoints(32))
            ang.copy(card.current.angvel())
            rot.copy(card.current.rotation())
            card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z })
        }
    })

    curve.curveType = 'chordal'
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping

    return (
        <group position={bandPosition}>
            {/* Основная группа с физическими телами */}
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

            {/* Mesh линии */}
            <mesh ref={band}>
                <meshLineGeometry />
                <meshLineMaterial
                    color="white"
                    resolution={[width, height]}
                    useMap
                    map={texture}
                    repeat={[-2, 1]}
                    lineWidth={1}
                />
            </mesh>
        </group>
    )
}