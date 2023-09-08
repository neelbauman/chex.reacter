import './App.css';

import axios from 'axios';
import { createRoot } from 'react-dom/client';
import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';

function Box(props) {
	const meshRef = useRef();
	const [ hovered, setHover ] = useState(false);
	const [ active, setActive ] = useState(false);

	useFrame( (state, delta) => (meshRef.current.rotation.x += delta) );
	
	return (
		<mesh
			{...props}
			ref = {meshRef}
			scale = {active ? 1.5 : 1}
			onClick = { (event) => setActive(!active) }
			onPointerOver = { (event) => setHover(true) }
			onPointerOut = { (event) => setHover(false) }>
			<boxGeometry args={[1,1,1]} />
			<meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
		</mesh>
	);
}

function App() {
	const [ data, setData ] = React.useState();
	const url = "http://localhost:8000";
	
	const GetData = () => {
		axios.get(url)
		.then( (res) => {
			setData(res.data.map( (site) => <p>{site.url}</p> ));
		});
	};

	return (
		<div>
			{data ? data : <button onClick={GetData}>データ</button>}
			<Canvas>
				<ambientLight/>
				<pointLight position={[10,10,10]} />
				<Box position={[-1.2,0,0]}/>
				<Box position={[1.2,0,0]}/>
			</Canvas>
		</div>
	);
}

export default App;
