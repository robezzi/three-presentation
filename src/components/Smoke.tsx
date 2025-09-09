import * as THREE from 'three';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';

import smokeTexture from '@assets/smoke-33819.png';

interface Particle {
	position: THREE.Vector3;
	width: number;
	height: number;
	speed: number;
	opacity: number;
	scale: number;
	initialY: number;
}

export default function Smoke({ count = 2, width = 50, height = 50, textureUrl = smokeTexture }): React.ReactElement {
	const { camera } = useThree();
	const [particles, setParticles] = useState<Particle[]>([]);
	const groupRef = useRef<THREE.Group>(null);
	const texture = useTexture(textureUrl);
	const tempVec = new THREE.Vector3();

	const gridTexture = useMemo(() => {
		const canvas = document.createElement('canvas');
		canvas.width = canvas.height = 256;

		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		ctx.fillStyle = 'rgba(58, 58, 58, 0.69)';
		ctx.fillRect(0, 0, 256, 256);
		ctx.strokeStyle = 'rgba(0, 180, 252, 1)';
		ctx.lineWidth = 2;

		for (let i = 0; i < 256; i += 16) {
			ctx.beginPath();
			ctx.moveTo(i, 0);
			ctx.lineTo(i, 256);
			ctx.stroke();
			ctx.beginPath();
			ctx.moveTo(0, i);
			ctx.lineTo(256, i);
			ctx.stroke();
		}

		const texture = new THREE.CanvasTexture(canvas);
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.repeat.set(2000, 2000);
		return texture;
	}, []);

	useEffect(() => {
		if (count === 0) {
			setParticles([]);
			return;
		}

		const newParticles = Array.from({ length: count }, () => ({
			position: new THREE.Vector3((Math.random() - 0.5) * 5, -5 + Math.random() * 3, -10 + Math.random() * 5),
			width: width * (0.6 + Math.random() * 0.8),
			height: height * (0.6 + Math.random() * 0.8),
			speed: 0.5 + Math.random() * 0.8,
			opacity: 0.1 + Math.random() * 0.4,
			scale: 0.5 + Math.random() * 0.3,
			initialY: Math.random(),
		}));
		setParticles(newParticles);
	}, [count, width, height]);

	useFrame((state, delta) => {
		if (!groupRef.current || particles.length === 0) return;
		const camPos = tempVec.copy(camera.position);
		groupRef.current.children.forEach((mesh) => {
			mesh.lookAt(camPos);
		});

		particles.forEach((particle, i) => {
			particle.position.y += particle.speed * delta;

			particle.position.x += Math.sin(state.clock.elapsedTime * 0.8 + particle.initialY * 10) * 0.1 * delta;

			particle.scale += 0.1 * delta;

			particle.opacity = Math.max(0, 0.4 - (particle.position.y + 5) / 30);

			if (particle.position.y > 10 || particle.opacity <= 0) {
				particle.position.set((Math.random() - 0.5) * 5, -5 + Math.random() * 2, -10 + Math.random() * 3);
				particle.width = width * (0.6 + Math.random() * 0.8);
				particle.height = height * (0.6 + Math.random() * 0.8);
				particle.speed = 0.5 + Math.random() * 0.8;
				particle.opacity = 0.1 + Math.random() * 0.4;
				particle.scale = 0.5 + Math.random() * 0.3;
				particle.initialY = Math.random();
			}

			if (!groupRef.current) return;
			const mesh = groupRef.current?.children[i] as THREE.Mesh;
			if (mesh && mesh.material && 'opacity' in mesh.material) {
				mesh.position.copy(particle.position);
				mesh.scale.set(particle.width * particle.scale, particle.height * particle.scale, 1);
				mesh.material.opacity = particle.opacity;
			}
		});
	});
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
	);
}
