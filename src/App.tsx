import "./App.css";
import {
	BrowserRouter as Router,
	Route,
	NavLink,
	Routes,
	Navigate,
} from "react-router-dom";
import { List, Settings } from "lucide-react";
import Checklist from "./checklist/checklist";
import Export from "./export/export";

function App() {
	return (
		<div>
			<Router>
				<nav>
					<ul>
						<li>
							<NavLink to="/checklist">
								<List /> Checklist
							</NavLink>
						</li>
						<li>
							<NavLink to="/export">
								<Settings />
								Export
							</NavLink>
						</li>
					</ul>
				</nav>
        <Routes>
          <Route path="/checklist" element={<Checklist />} />
          <Route path="/export" element={<Export />} />
          <Route path="*" element={<Navigate to="/checklist" />} />
        </Routes>
			</Router>
		</div>
	);
}

export default App;
