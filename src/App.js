import './App.css';

import {
	Button,
	defaultTheme,
	Provider
} from '@adobe/react-spectrum';

import axios from 'axios';
import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';

import { ForceGraph3D, ForceGraph2D } from 'react-force-graph';

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

function Scene(props) {
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


function Graph2D(props) {
	const { useMemo, useState, useCallback, useRef } = React;

	const NODE_R = 4;
	const data = useMemo( () => {
		const gData = props.graphData;

		gData.links.forEach( link => {
			const a = gData.nodes.filter( node => node.id === link.source );
			const b = gData.nodes.filter( node => node.id === link.target );

			//console.log(a);console.log(b)

			!a[0].neighbors && (a[0].neighbors = []);
			!b[0].neighbors && (b[0].neighbors = []);
			a[0].neighbors.push(b[0]);
			b[0].neighbors.push(a[0]);

			!a[0].links && (a[0].links = []);
			!b[0].links && (b[0].links = []);
			a[0].links.push(link);
			b[0].links.push(link);
		});
		
		return gData;
	}, []);

	const max = Math.max(...data.nodes.map((node) => node.n_visited));
	console.log(max);

	const [highlightNodes, setHighlightNodes] = useState(new Set());
	const [highlightLinks, setHighlightLinks] = useState(new Set());
	const [hoverNode, setHoverNode] = useState(null);

	const updateHighlight = () => {
		setHighlightNodes(highlightNodes);
		setHighlightLinks(highlightLinks);
	};

	const handleNodeHover = (node) => {
		highlightNodes.clear();
		highlightLinks.clear();

		if (node) {
			highlightNodes.add(node);
			node.neighbors.forEach(neighbor => highlightNodes.add(neighbor));
			node.links.forEach(link => highlightLinks.add(link));
		}

		setHoverNode(node || null);
		updateHighlight();
	};

	const handleLinkHover = (link) => {
		highlightNodes.clear();
		highlightLinks.clear();

		if (link) {
			highlightLinks.add(link);
			highlightNodes.add(link.source);
			highlightNodes.add(link.target);
		}

		updateHighlight();
	};

	const paintRing = useCallback( (node, ctx) => {
		ctx.beginPath();
		ctx.arc(node.x, node.y, Math.sqrt(node.val)*NODE_R+1, 0, 2*Math.PI, false);
		ctx.strokeStyle = node == hoverNode ? 'red' : 'orange';
		ctx.stroke();
	}, [hoverNode]);

	const fgRef = useRef();

	const handleNodeClick = useCallback( node => {
		fgRef.current.zoomToFit(400);
		window.open(node.id, '_blank');
	}, [fgRef]);

	return (
		<ForceGraph2D
			ref={fgRef}
			graphData={data}
			nodeLabel={node => node.n_visited}
			nodeColor={node => '#'+(Math.floor(node.n_visited/max*255)).toString(16).padStart(2,'0')+'0000'}
			nodeRelSize={NODE_R}
			autoPauseRedraw={false}
			linkWidth={link => highlightLinks.has(link) ? 3 : 1}
			linkDirectionalParticles={2.0}
			linkDirectionalParticleWidth={link => highlightLinks.has(link) ? 4 : 0}
			linkCurvature={0.25}
			nodeCanvasObjectMode={node => highlightNodes.has(node) ? 'before' : undefined}
			nodeCanvasObject={paintRing}
			onNodeHover={handleNodeHover}
			onLinkHover={handleLinkHover}
			onNodeClick={handleNodeClick}
		/>
	);
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

	return (
		<div>
			<Provider theme={defaultTheme}>
				<Button
					variant="accent"
					onPress={() => alert('Hey there!')}
				>
					Hello React Spectrum!
				</Button>
			</Provider>

			<div id="canvas-container">
				{data ? <Graph2D graphData={data}/> : <button onClick={GetData}>データ</button>}
			</div>
		</div>
	);
}

export default App;
