import "./selector.css";
import { NavLink } from "react-router-dom";
import Logo from "../logo.jpg";

export default function Selector() {
	return (
		<div>
			<nav>
				<div className="logo">
					<img src={Logo} alt="logo" />
				</div>
				<div className="about">
					<NavLink to="/about">O nas</NavLink>
				</div>
			</nav>
			<main>
				<h1>Seznami</h1>
				<p>Izberi seznam, ki ga želiš izpolniti.</p>
				<div className="seznami">
					<NavLink to="/checklist" className="seznam">
						<h2>Seznam opravil</h2>
						<p>Seznam opravil, ki jih moraš opraviti.</p>
					</NavLink>
					<NavLink to="/checklist" className="seznam">
						<h2>Nakupovalni seznam</h2>
						<p>Seznam stvari, ki jih moraš kupiti.</p>
					</NavLink>
					<NavLink to="/checklist" className="seznam">
						<h2>Seznam želja</h2>
						<p>Seznam stvari, ki si jih želiš.</p>
					</NavLink>
				</div>
			</main>
		</div>
	);
}
