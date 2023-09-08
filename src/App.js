import './App.css';

import React from 'react';
import axios from 'axios';


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
	    </div>
	);
}

export default App;
