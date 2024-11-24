import { NavLink } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import "./about.css";

const About = () => {
	return (
		<div>
			<nav>
				<NavLink to="/" end>
					<button style={{ display: "flex", alignItems: "center" }}>
						<ArrowLeft />
					</button>
				</NavLink>
			</nav>
			<div className="about-content">
				<h1>O aplikaciji</h1>
				<p>Narejeno z ❤️ na Vegovi.</p>
				<p>
					Avtorji:
					<ul>
						<li>
							<a
								href="https://github.com/lin-cadez"
								target="_blank">
								Lin Čadež
							</a>
						</li>
						<li>
							<a
								href="https://github.com/jakecernet"
								target="_blank">
								Jaka Černetič
							</a>
						</li>
						<li>
							<a
								href="https://github.com/jonontop"
								target="_blank">
								Jon Pečar
							</a>
						</li>
					</ul>
				</p>
			</div>
		</div>
	);
};

export default About;
