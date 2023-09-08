import './App.css';

import axios from 'axios';


function App() {
	var datas;

	axios.get("http://localhost:8000/")
	.then(
		function (response) {
			datas = response.data;
			console.log(datas);
		}
	)
	.catch(
		function (error) {
			console.log(error);
		}
	)
	.finally(
	);

	const list = datas.map( data => <p>{data.url}</p> )

	return (
	    <div>
		{list}
	    </div>
	);
}

export default App;
