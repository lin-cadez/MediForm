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
                <p>
                    Aplikacija je namenjena izpolnjevanju seznamov. Sezname lahko ustvariš sam ali pa izbereš med obstoječimi.
                </p>
                <p>
                    Sezname lahko deliš s prijatelji, ki jih lahko izpolnijo skupaj s tabo.
                </p>
            </div>
		</div>
	);
}

export default About;