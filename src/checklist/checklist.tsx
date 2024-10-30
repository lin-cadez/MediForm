import { NavLink } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Export from "../export.svg";
import "./checklist.css";

export default function Checklist() {
	return (
		<div className="checklist-page">
			<nav>
				<NavLink to="/" end>
					<button>
						<ArrowLeft />
					</button>
				</NavLink>
				<button><img src={Export} alt="export" /></button>
			</nav>
			<h1>Seznam opravil</h1>
		</div>
	);
}
