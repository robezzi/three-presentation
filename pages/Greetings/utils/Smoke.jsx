import React from 'react'
import * as THREE from 'three'
import { useEffect, useRef, useState } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'

import smokeTexture from "../../../assets/smoke-33819.png"

export default function Smoke({
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

        if (groupRef.current) {
            groupRef.current.layers.set(1)
        }

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