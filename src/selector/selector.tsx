import "./selector.css";
import { NavLink } from "react-router-dom";
import Logo from "../logo.jpg";

export default function Selector() {
	return (
		<div className="selector-page">
			<nav>
				<div className="logo">
					<img src={Logo} alt="logo" />
				</div>
				<div className="about">
					<NavLink to="/about">
						O nas
					</NavLink>
				</div>
			</nav>
			<h1>izbirnik</h1>
			<NavLink to="/checklist">
				<button>Seznam opravil</button>
			</NavLink>
		</div>
	);
}
