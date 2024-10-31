import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import "./selector.css";
import Logo from "../logo.jpg";

interface Category {
	title: string;
	description: string | null;
	url: string;
}

interface CategoriesData {
	categories: {
		[key: string]: Category;
	};
}

const STORAGE_KEY = "fetchedData";
const API_URL =
	"https://raw.githubusercontent.com/jakecernet/zd-json/refs/heads/main/test1.json";

export default function Selector() {
	const [categories, setCategories] = useState<CategoriesData["categories"]>(
		{}
	);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchCategories = async () => {
			try {
				// Check localStorage first
				const storedData = localStorage.getItem(STORAGE_KEY);
				if (storedData) {
					setCategories(JSON.parse(storedData).categories);
					setIsLoading(false);
					return;
				}

				const response = await fetch(API_URL);
				if (!response.ok) {
					throw new Error("Failed to fetch categories");
				}
				const data: CategoriesData = await response.json();
				setCategories(data.categories);

				localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
			} catch (err) {
				setError("Error fetching categories. Please try again later.");
			} finally {
				setIsLoading(false);
			}
		};

		fetchCategories();
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
					{Object.entries(categories).map(([key, category]) => (
						<div key={key}>
							<NavLink
								to={`/checklist/${category.url}`}
								className="seznam">
								<h2>{category.title}</h2>
								{category.description && (
									<p>{category.description}</p>
								)}
							</NavLink>
						</div>
					))}
				</div>
			</main>
		</div>
	);
}
