import "./export.css";
import Pdf from "./pdf.svg";
import Word from "./word.svg";

export default function Export() {
	return (
		<div className="export-page">
			<h1>Izvozi</h1>
			<p>
				Izberi format datoteke, v katerem želiš izvoziti svoj seznam.
			</p>
			<div className="export-buttons">
				<button>
					Izvozi kot PDF <img src={Pdf} alt="pdf" />
				</button>
				<button>Izvozi kot CSV</button>
				<button>
					Izvozi kot Word <img src={Word} alt="word" />
				</button>
			</div>
		</div>
	);
}
