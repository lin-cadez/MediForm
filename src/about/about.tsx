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
                <h1>About</h1>
                <p>
                    This is a simple app that fetches data from a JSON file and displays it in a checklist format. The data is fetched from a JSON file hosted on GitHub. The app uses React Router for navigation.
                </p>
                <p>
                    The app is built using React, TypeScript, and Lucide icons.
                </p>
            </div>
		</div>
	);
}

export default About;