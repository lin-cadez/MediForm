import "./App.css";
import Checklist from "./checklist/checklist";
import Selector from "./selector/selector";
import {
	BrowserRouter as Router,
	Route,
	Routes,
} from "react-router-dom";

function App() {
	return (
		<div>
			<Router>
				<Routes>
					<Route path="/checklist/*" element={<Checklist />} />
					<Route path="/" element={<Selector />} />
					<Route path="*" element={<Selector />} />
				</Routes>
			</Router>
		</div>
	);
}

export default App;
