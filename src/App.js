import './App.css';

import axios from 'axios';

import React, { useRef, useState } from 'react';

import {
	Button,
	defaultTheme,
	Provider
} from '@adobe/react-spectrum';


import { ForceGraph3D, ForceGraph2D } from 'react-force-graph';



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
		<Provider theme={defaultTheme}>
			<Button
				variant="accent"
				onPress={() => alert('Hey there!')}
			>
				Hello React Spectrum!
			</Button>

			<div id="canvas-container">
				{data ? <Graph2D graphData={data}/> : <button onClick={GetData}>データ</button>}
			</div>
		</Provider>
	);
}

export default App;
