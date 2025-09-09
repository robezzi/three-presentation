import * as THREE from 'three';

declare module '@react-three/fiber' {
	interface ThreeElements {
		mesh: Object3DNode<THREE.Mesh, typeof THREE.Mesh> & {
			geometry?: THREE.BufferGeometry;
			material?: THREE.Material | THREE.Material[];
		};
	}
}

declare module 'three' {
	interface Material {
		map?: THREE.Texture;
		anisotropy?: number;
		clearcoat?: number;
		clearcoatRoughness?: number;
		roughness?: number;
		metalness?: number;
	}
}
