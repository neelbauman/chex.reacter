import { Canvas, useFrame } from '@react-three/fiber';

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
