import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import "./selector.css";
import Logo from "../logo.jpg";

interface List {
	title: string;
	description: string | null;
	url: string;
}

interface ListsData {
	lists: {
		[key: string]: List;
	};
}

const STORAGE_KEY = "fetchedData";
const API_URL =
	"https://raw.githubusercontent.com/jakecernet/zd-json/refs/heads/main/test1.json";

export default function Selector() {
	const [lists, setLists] = useState<ListsData["lists"]>({});
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchLists = async () => {
			try {
				// Check localStorage first
				const storedData = localStorage.getItem(STORAGE_KEY);
				if (storedData) {
					const parsedStoredData = JSON.parse(storedData);
					setLists(parsedStoredData.lists);
					setIsLoading(false);

					// Fetch new data to compare
					const response = await fetch(API_URL);
					if (!response.ok) {
						throw new Error("Failed to fetch lists");
					}
					const fetchedData: ListsData = await response.json();

					// Compare fetched data with stored data
					if (
						JSON.stringify(parsedStoredData) !==
						JSON.stringify(fetchedData)
					) {
						localStorage.setItem(
							STORAGE_KEY,
							JSON.stringify(fetchedData)
						);
						setLists(fetchedData.lists);
					}
					return;
				}

				const response = await fetch(API_URL);
				if (!response.ok) {
					throw new Error("Failed to fetch lists");
				}
				const data: ListsData = await response.json();
				setLists(data.lists);

				localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
			} catch (err) {
				setError("Error fetching lists. Please try again later.");
			} finally {
				setIsLoading(false);
			}
		};

		fetchLists();
	}, []);

	if (isLoading) {
		return <div className="loading">Loading...</div>;
	}

	if (error) {
		return <div className="error">{error}</div>;
	}

	return (
		<div>
			<nav>
				<div className="logo">
					<NavLink to="/">
						<img src={Logo} alt="logo" />
					</NavLink>
				</div>
				<div className="about">
					<NavLink to="/about">O nas</NavLink>
				</div>
			</nav>
			<main>
				<h1>Seznami</h1>
				<p>Izberi seznam, ki ga želiš izpolniti.</p>
				<div className="seznami">
					{lists && Object.entries(lists).map(([key, list]) => (
						<div key={key}>
							<NavLink
								to={`/checklist/${list.url}`}
								className="seznam">
								<h2>{list.title}</h2>
								{list.description && <p>{list.description}</p>}
							</NavLink>
						</div>
					))}
				</div>
			</main>
		</div>
	);
}
