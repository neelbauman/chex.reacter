import './App.css';

import axios from 'axios';
import React from 'react';

import {
	Cell, Column, Row, TableView, TableBody, TableHeader,
	Form, TextField,
	Button,
	Grid, View,
	defaultTheme,
	Provider
} from '@adobe/react-spectrum';

import { ForceGraph2D } from 'react-force-graph';


const { useMemo, useState, useCallback, useRef } = React;

const axios_instance = axios.create({
	baseURL: "https://252c-34-23-167-118.ngrok-free.app",
	timeout: 60000,
	headers: {
		"ngrok-skip-browser-warning": true
	}
});


function EntitiesView ( {datas} ) {
	return (
		<View overflow="scroll">
			{ datas.map(
				( data ) => {
					return (
						<ul>
							<li>{data.text}</li>
							<ul>{
								data.pred_entities.map(
									( pred_entity ) => {
										return <li>{pred_entity.name}: {pred_entity.type}</li>
									}
								)
							}</ul>
						</ul>
					)
				}
			)}
		</View>
	)
}

function Graph2D({graphData}) {

	const [highlightNodes, setHighlightNodes] = useState(new Set());
	const [highlightLinks, setHighlightLinks] = useState(new Set());
	const [hoverNode, setHoverNode] = useState(null);
	const [predEntities, setPredEntities] = useState();
	const fgRef = useRef();


	const data = useMemo( () => {
		const g = graphData
		g.links.forEach( link => {
			const a = graphData.nodes.filter( node => node.id === link.source );
			const b = graphData.nodes.filter( node => node.id === link.target );

			!a[0].neighbors && (a[0].neighbors = []);
			!b[0].neighbors && (b[0].neighbors = []);
			a[0].neighbors.push(b[0]);
			b[0].neighbors.push(a[0]);

			!a[0].links && (a[0].links = []);
			!b[0].links && (b[0].links = []);
			a[0].links.push(link);
			b[0].links.push(link);
		});
		return g;
	}, [ graphData ]);

	const NODE_R = 4;
	const max = Math.max(...data.nodes.map((node) => node.value));

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

	const handleNodeClick = ( node ) => {
		axios_instance.get("/nodes/", {
			params: {
				node_id: node.id
			},
			timeout: 60000*10
		}).then(
			( res ) => {
				console.log(res.data)
				setPredEntities(res.data)
			}
		)
	}

	return (
		<Grid areas={["left right"]} columns="1fr 1fr" width="100%">
			<View gridArea="left">
			<ForceGraph2D
				ref={fgRef}
				graphData={data}
				nodeLabel={ node => node.id }
				nodeColor={ node => {
					return '#'+(Math.floor(node.value/max*255)).toString(16).padStart(2,'0')+'0000'
				}}
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
			</View>
			<View gridArea="right">
				{ predEntities ? <EntitiesView datas={predEntities}/> : <View/> }
			</View>
		</Grid>
	);
}


function GraphView() {
	const [ filepath, setFilepath ] = useState("tts/dom.json")
	const [ graphData, setGraphData ] = useState({
		nodes: [],
		links: []
	})

	const getGraphData = (filepath) => {
		axios_instance.get("/graph/", {
			params: {
				filepath: filepath
			}
		}).then(
			(res) => {
				setGraphData(res.data)
				console.log(res.data)
				console.log(graphData)
			}
		)
	};

	// レンダー時、filepathからグラフデータを取得
	const handleButtonPress = (e) => {
		getGraphData(filepath)
	}

	//IDEA 座標計算結果をメモしておけば座標の再計算つまり再描画なく表示だけを切り替えられる
	return (
		<View width="100vw">
			<Form isRequired>
				<TextField value={filepath} onChange={setFilepath}/>
			</Form>
			<Button variant="primary" onPress={handleButtonPress}>
				Get Graph Data
			</Button>
			{ graphData ? <Graph2D graphData={graphData}/> : <View/> }
		</View>
	)

}


function App() {
	return (
		<Provider theme={defaultTheme}>
			<GraphView></GraphView>
		</Provider>
	);
}

export default App;
