import './App.css';

import axios from 'axios';
import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';

import { ForceGraph3D } from 'react-force-graph';

function Box(props) {
	const meshRef = useRef();
	const [ hovered, setHover ] = useState(false);
	const [ active, setActive ] = useState(false);

	//useFrame( (state, delta) => (meshRef.current.rotation.x += delta) );
	
	return (
		<mesh
			{...props}
			ref = {meshRef}
			scale = {active ? 1.5 : 1}
			onClick = { (event) => setActive(!active) }
			onPointerOver = { (event) => setHover(true) }
			onPointerOut = { (event) => setHover(false) }>
			<boxGeometry args={[2,2,2]} />
			<meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
		</mesh>
	);
}

function Sphere(props) {
	const meshRef = useRef();
//	useFrame( (state, delta) => (meshRef.current.rotation.x += delta) );
	return (
		<mesh
			{...props}
			ref = {meshRef}
			scale = {1}>
			<sphereGeometry args={[4,32,32]}/>
			<meshStandardMaterial color={'white'}/>
		</mesh>
	);
}

function SceneOnCanvas(props) {
	let c = <Canvas
		camera = {{position: [30,30,50]}}>
			<ambientLight intensity={1}/>
			<directionalLight color={"white"} intensity={10} position={[0,0,10]} decay={20} />
			<Box position={[-12,0,0]}/>
			<Box position={[12,0,0]}/>
			<Sphere position={[0,20,0]}/>
		</Canvas>;
	
	return c;
}


function App() {
	const [ data, setData ] = useState();
	const url = "http://localhost:8000";
	
	const GetData = () => {
		axios.get(url)
		.then( (res) => {
			setData(res.data)
		});
	};
	
	console.log(data);

	return (
		<div id="canvas-container">
			{data ? <ForceGraph3D graphData={data}/> : <button onClick={GetData}>データ</button>}
		</div>
	);
}

export default App;
