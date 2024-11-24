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

export default function Selector() {
	const [lists, setLists] = useState<{ [key: string]: List } | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const allLists = [
		"https://raw.githubusercontent.com/jakecernet/zd-json/refs/heads/main/test1.json",
		"https://raw.githubusercontent.com/jakecernet/zd-json/refs/heads/main/test2.json",
	];

	useEffect(() => {
		const fetchLists = async () => {
			try {
				const storedData = localStorage.getItem(STORAGE_KEY);
				let fetchedLists: { [key: string]: List } = storedData
					? JSON.parse(storedData)
					: {};

				for (const url of allLists) {
					const response = await fetch(url);
					if (!response.ok) {
						throw new Error(`Failed to fetch list from ${url}`);
					}
					const fetchedData = await response.json();
					fetchedLists = { ...fetchedLists, ...fetchedData };
				}

				localStorage.setItem(STORAGE_KEY, JSON.stringify(fetchedLists));
				setLists(fetchedLists);
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
