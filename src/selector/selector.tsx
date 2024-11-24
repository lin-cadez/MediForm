import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import "./selector.css";
import Logo from "../logo.jpg";
import { Info } from "lucide-react";

interface List {
	title: string;
	description: string | null;
	url: string;
}

const STORAGE_KEY = "fetchedData";
const API_URL =
	"https://raw.githubusercontent.com/jakecernet/zd-json/refs/heads/main/test1.json";

export default function Selector() {
	const [lists, setLists] = useState<{ [key: string]: List } | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchLists = async () => {
			try {
				// Check localStorage first
				const storedData = localStorage.getItem(STORAGE_KEY);
				if (storedData) {
					const parsedStoredData = JSON.parse(storedData);
					setLists(parsedStoredData);
					setIsLoading(false);

					// Fetch new data to compare
					const response = await fetch(API_URL);
					if (!response.ok) {
						throw new Error("Failed to fetch lists");
					}
					const fetchedData = await response.json();

					// Compare fetched data with stored data
					if (
						JSON.stringify(parsedStoredData) !==
						JSON.stringify(fetchedData)
					) {
						localStorage.setItem(
							STORAGE_KEY,
							JSON.stringify(fetchedData)
						);
						setLists(fetchedData);
					}
					return;
				}

				const response = await fetch(API_URL);
				if (!response.ok) {
					throw new Error("Failed to fetch lists");
				}
				const data = await response.json();
				setLists(data);

				localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
			} catch (err) {
				setError("Error fetching lists. Please try again later.");
			} finally {
				setIsLoading(false);
			}
		};

		fetchLists();
	}, []);

	const openList = (url: string) => {
		localStorage.setItem(url, JSON.stringify(lists?.[url]));
	};

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
				<div className="title">
					<h1>Seznami</h1>
				</div>
				<div className="about">
					<NavLink to="/about">
						<button>
							<Info />
						</button>
					</NavLink>
				</div>
			</nav>
			<main>
				<div className="desc">
					<p>Izberi seznam, ki ga želiš izpolniti.</p>
				</div>
				<div className="seznami">
					{lists &&
						Object.entries(lists).map(([key, list]) => (
							<div key={key}>
								<NavLink
									to={`/checklist/${list.url}`}
									className="seznam"
									onClick={() => openList(list.url)}>
									<div className="rounded-xl border bg-card text-card-foreground p-4 mb-4 shadow-md card-bg">
										<h2>{list.title}</h2>
										{list.description && (
											<p>{list.description}</p>
										)}
									</div>
								</NavLink>
							</div>
						))}
				</div>
			</main>
		</div>
	);
}
