import "./App.css";
import {
	BrowserRouter as Router,
	Route,
	NavLink,
	Routes,
} from "react-router-dom";
import { List, Settings, Home } from "lucide-react";
import Selector from "./selector/selector";
import Checklist from "./checklist/checklist";
import Export from "./export/export";

function App() {
	return (
		<div>
			<Router>
				<nav>
					<ul>
						<li>
							<NavLink to="/">
								<Home />
								Seznami
							</NavLink>
						</li>
						<li>
							<NavLink to="/checklist">
								<List /> Seznam
							</NavLink>
						</li>
						<li>
							<NavLink to="/export">
								<Settings />
								Izvoz
							</NavLink>
						</li>
					</ul>
				</nav>
        <Routes>
          <Route path="/checklist" element={<Checklist />} />
          <Route path="/export" element={<Export />} />
          <Route path="*" element={<Selector />} />
        </Routes>
			</Router>
		</div>
	);
}

export default App;
