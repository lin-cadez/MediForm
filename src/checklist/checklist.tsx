import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
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
import MultiSelectInput from "./MultiSelectInput";
import SingleSelectComponent from "./SingleSelectComponent";

interface List {
	title: string;
	description: string;
	url: string;
	sublists: Record<string, any>;
}

interface ListsData {
	lists: Record<string, List>;
}

export default function Checklist() {
	const [List, setList] = useState<List | null>(null);

	useEffect(() => {
		const fetchData = () => {
			const path = window.location.pathname;
			const urlSegment = path.split("/checklist/")[1];

			const storedData = localStorage.getItem("fetchedData");
			if (storedData) {
				const data: ListsData = JSON.parse(storedData);

				// Find the matching List
				const matchingList = Object.values(data.lists).find(
					(cat) => cat.url === urlSegment
				);

				if (matchingList) {
					setList(matchingList);
				}
			}
		};

		fetchData();
	}, []);

	if (!List) {
		return <div>Loading...</div>;
	}

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
					{/* <MultiSelectInput predefinedOptions={["1", "2", "3"]} />
					<SingleSelectComponent
						predefinedOptions={["1", "2", "3"]}
					/> */}

					<h1>{List.title}</h1>
					<p>{List.description}</p>
				</div>
				<DrawerContent>
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
