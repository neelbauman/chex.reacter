import './App.css';

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

function Graph3D(props) {
	const { useMemo, useState, useCallback, useRef } = React;

	const NODE_R = 8;
	const data = useMemo( () => {
		const gData = props.graphData;

		gData.links.forEach( link => {
			const a = gData.nodes.filter( node => node.id === link.source );
			const b = gData.nodes.filter( node => node.id === link.target );

			//console.log(a);
			//console.log(a[0]);
			//console.log(a[0].neighbors);
	       		a[0].neighbors ? console.log("foo") : a[0].neighbors = [];
			b[0].neighbors ? console.log("foo") : b[0].neighbors = [];
//			(! a[0].neighbors) && (a.neighbors = []);
//			(! b[0].neighbors) && (b.neighbors = []);
			//console.log(a[0].neighbors);
			a[0].neighbors.push(b[0]);
			b[0].neighbors.push(a[0]);

	       		a[0].links ? console.log("foo") : a[0].links = [];
	       		b[0].links ? console.log("foo") : b[0].links = [];
//			a[0].links && (a.links = []);
//			b[0].links && (b.links = []);
			a[0].links.push(link);
			b[0].links.push(link);
		});

//		console.log(gData);
		return gData;
	}, []);

	const [highlightNodes, setHighlightNodes] = useState(new Set());
	const [highlightLinks, setHighlightLinks] = useState(new Set());
	const [hoverNode, setHoverNode] = useState(null);

	const updateHighlight = () => {
		setHighlightNodes(highlightNodes);
		setHighlightLinks(highlightLinks);
	};

	const handleNodeHover = node => {
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

	const handleLinkHover = link => {
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
		ctx.arc(node.x, node.y, NODE_R * 1.4, 0, 2*Math.PI, false);
		ctx.fillStyle = node === hoverNode ? 'red' : 'orange';
		ctx.fill();
	}, [hoverNode]);

	const fgRef = useRef();

	const handleNodeClick = useCallback( node => {
		const distance = 80;
		const distRatio = 1 + distance/Math.hypot(node.x, node.y, node.z);
		fgRef.current.cameraPosition(
			{ x: node.x*distRatio, y: node.y*distRatio, z:node.z*distRatio },
			node,
			1000
		);
	}, [fgRef]);

	return (
		<ForceGraph3D
			ref={fgRef}
			graphData={data}
			nodeRelSize={NODE_R}
			autoPauseRedraw={false}
			linkWidth={link => highlightLinks.has(link) ? 3 : 1}
			linkDirectionalParticles={3.5}
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

function Graph2D(props) {
	const { useMemo, useState, useCallback, useRef } = React;

	const NODE_R = 8;
	const data = useMemo( () => {
		const gData = props.graphData;

		gData.links.forEach( link => {
			const a = gData.nodes.filter( node => node.id === link.source );
			const b = gData.nodes.filter( node => node.id === link.target );

			//console.log(a);
			//console.log(a[0]);
			//console.log(a[0].neighbors);
	       		a[0].neighbors ? console.log("foo") : a[0].neighbors = [];
			b[0].neighbors ? console.log("foo") : b[0].neighbors = [];
//			(! a[0].neighbors) && (a.neighbors = []);
//			(! b[0].neighbors) && (b.neighbors = []);
			//console.log(a[0].neighbors);
			a[0].neighbors.push(b[0]);
			b[0].neighbors.push(a[0]);

	       		a[0].links ? console.log("foo") : a[0].links = [];
	       		b[0].links ? console.log("foo") : b[0].links = [];
//			a[0].links && (a.links = []);
//			b[0].links && (b.links = []);
			a[0].links.push(link);
			b[0].links.push(link);
		});

//		console.log(gData);
		return gData;
	}, []);

	const [highlightNodes, setHighlightNodes] = useState(new Set());
	const [highlightLinks, setHighlightLinks] = useState(new Set());
	const [hoverNode, setHoverNode] = useState(null);

	const updateHighlight = () => {
		setHighlightNodes(highlightNodes);
		setHighlightLinks(highlightLinks);
	};

	const handleNodeHover = node => {
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

	const handleLinkHover = link => {
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
		ctx.arc(node.x, node.y, NODE_R * 1.4, 0, 2*Math.PI, false);
		ctx.fillStyle = node === hoverNode ? 'red' : 'orange';
		ctx.fill();
	}, [hoverNode]);

	const fgRef = useRef();
	console.log(fgRef);

	const handleNodeClick = useCallback( node => {
		const distance = 40;
		const distRatio = 1 + distance/Math.hypot(node.x, node.y);
		fgRef.current.cameraPosition(
			{ x: node.x*distRatio, y: node.y*distRatio },
			node,
			3000
		);
	}, [fgRef]);

	return (
		<ForceGraph2D
			graphData={data}
			nodeRelSize={NODE_R}
			autoPauseRedraw={false}
			linkWidth={link => highlightLinks.has(link) ? 3 : 1}
			linkDirectionalParticles={3.5}
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
		<div id="canvas-container">
			{data ? <Graph3D graphData={data}/> : <button onClick={GetData}>データ</button>}
		</div>
	);
}

export default App;
