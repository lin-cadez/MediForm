import { NavLink } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@/components/ui/drawer";
import ExportSVG from "../export.svg";
import Pdf from "../pdf.svg";
import Excel from "../excel.svg";
import "./checklist.css";

export default function Checklist() {
	return (
		<div className="checklist-page">
			<Drawer>
				<nav>
					<NavLink to="/" end>
						<button>
							<ArrowLeft />
						</button>
					</NavLink>
					<DrawerTrigger>
						<img src={ExportSVG} alt="export" />
					</DrawerTrigger>
				</nav>
				<div className="vsebina">
					<h1>Seznam opravil</h1>
					<div className="checklist">
						<div className="checklist-item">
							<input type="checkbox" id="item1" />
							<label htmlFor="item1">Prvo opravilo</label>
						</div>
						<div className="checklist-item">
							<input type="checkbox" id="item2" />
							<label htmlFor="item2">Drugo opravilo</label>
						</div>
						<div className="checklist-item">
							<input type="checkbox" id="item3" />
							<label htmlFor="item3">Tretje opravilo</label>
						</div>
					</div>
				</div>
				<DrawerContent className="drawer-content">
					<div aria-hidden className="drawer-close" />
					<DrawerHeader>
						<DrawerTitle>Izvozi seznam</DrawerTitle>
					</DrawerHeader>
					<div className="export-page">
						<DrawerDescription>
							Izberi format datoteke, v katerem želiš izvoziti
							svoj seznam.
						</DrawerDescription>
						<div className="export-buttons">
							<button>
								Izvozi kot PDF <img src={Pdf} alt="pdf" />
							</button>
							<button>
								Izvozi kot Excel <img src={Excel} alt="excel" />
							</button>
						</div>
					</div>
				</DrawerContent>
			</Drawer>
		</div>
	);
}
