"use client";

import { useEffect, useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import SingleSelectInput from "./SingleSelectComponent";
import MultiSelectInput from "./MultiSelectInput";
import ExportSVG from "../export.svg";
import Pdf from "../pdf.svg";
import Excel from "../excel.svg";
import "./checklist.css";

interface Element {
	title: string;
	unit: string | null;
	value: string | number | boolean | null;
	hint: string | null;
	type: string;
	options?: string[];
	option_type?: "one" | "multiple";
}

interface Subcategory {
	title: string;
	description: string | null;
	elements: Record<string, Element>;
}

interface Category {
	title: string;
	description: string;
	url: string;
	subcategories: Record<string, Subcategory>;
}

interface List {
	title: string;
	description: string;
	url: string;
	categories: Record<string, Category>;
}

interface ListsData {
	lists: Record<string, List>;
}

export default function Checklist() {
	const [list, setList] = useState<List | null>(null);
	const [formData, setFormData] = useState<Record<string, any>>({});

	useEffect(() => {
		const fetchData = () => {
			const path = window.location.pathname;
			const urlSegment = path.split("/checklist/")[1];

			const storedData = localStorage.getItem("fetchedData");
			if (storedData) {
				const data: ListsData = JSON.parse(storedData);

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

	const handleInputChange = (
		categoryId: string,
		subcategoryId: string,
		elementId: string,
		value: any
	) => {
		setFormData((prevData) => ({
			...prevData,
			[categoryId]: {
				...prevData[categoryId],
				[subcategoryId]: {
					...prevData[categoryId]?.[subcategoryId],
					[elementId]: value,
				},
			},
		}));
	};

	const renderElement = (
		categoryId: string,
		subcategoryId: string,
		elementId: string,
		element: Element
	) => {
		switch (element.type) {
			case "str":
				if (element.options && element.option_type === "one") {
					return (
						<SingleSelectInput
							predefinedOptions={element.options}
							value={
								formData[categoryId]?.[subcategoryId]?.[
									elementId
								] || ""
							}
							onChange={(value) =>
								handleInputChange(
									categoryId,
									subcategoryId,
									elementId,
									value
								)
							}
						/>
					);
				} else if (
					element.options &&
					element.option_type === "multiple"
				) {
					return (
						<MultiSelectInput
							predefinedOptions={element.options}
							value={
								formData[categoryId]?.[subcategoryId]?.[
									elementId
								] || []
							}
							onChange={(value) =>
								handleInputChange(
									categoryId,
									subcategoryId,
									elementId,
									value
								)
							}
						/>
					);
				} else {
					return (
						<Input
							type="text"
							value={
								formData[categoryId]?.[subcategoryId]?.[
									elementId
								] || ""
							}
							onChange={(e) =>
								handleInputChange(
									categoryId,
									subcategoryId,
									elementId,
									e.target.value
								)
							}
							placeholder={element.hint || ""}
						/>
					);
				}
			case "int":
				return (
					<Input
						type="number"
						value={
							formData[categoryId]?.[subcategoryId]?.[
								elementId
							] || ""
						}
						onChange={(e) =>
							handleInputChange(
								categoryId,
								subcategoryId,
								elementId,
								parseInt(e.target.value, 10)
							)
						}
						placeholder={element.hint || ""}
					/>
				);
			case "bool":
				return (
					<Checkbox
						checked={
							formData[categoryId]?.[subcategoryId]?.[
								elementId
							] || false
						}
						onCheckedChange={(checked) =>
							handleInputChange(
								categoryId,
								subcategoryId,
								elementId,
								checked
							)
						}
					/>
				);
			default:
				return null;
		}
	};

	if (!list) {
		return <div className="loading">Loading...</div>;
	}

	return (
		<div className="checklist-page">
			<Drawer>
				<nav>
					<NavLink to="/" end>
						<button className="back-button">
							<ArrowLeft />
						</button>
					</NavLink>
					<h1>{list.title}</h1>
					<DrawerTrigger>
						<img
							src={ExportSVG}
							alt="export"
							className="export-icon"
						/>
					</DrawerTrigger>
				</nav>
				<div className="description">
					<p>{list.description}</p>
				</div>
				<div className="content">
					{Object.entries(list.categories).map(
						([categoryId, category]) => (
							<div key={categoryId} className="category">
								<h2>{category.title}</h2>
								<p>{category.description}</p>
								{Object.entries(category.subcategories).map(
									([subcategoryId, subcategory]) => (
										<div
											key={subcategoryId}
											className="subcategory">
											<h3>{subcategory.title}</h3>
											{subcategory.description && (
												<p>{subcategory.description}</p>
											)}
											{Object.entries(
												subcategory.elements
											).map(([elementId, element]) => (
												<div
													key={elementId}
													className="element">
													<Label htmlFor={elementId}>
														{element.title}
													</Label>
													<div className="input-wrapper">
														{renderElement(
															categoryId,
															subcategoryId,
															elementId,
															element
														)}
														{element.unit && (
															<span className="unit">
																{element.unit}
															</span>
														)}
													</div>
												</div>
											))}
										</div>
									)
								)}
							</div>
						)
					)}
				</div>
				<div className="export">
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
								<button className="export-button">
									Izvozi kot PDF{" "}
									<img
										src={Pdf}
										alt="pdf"
										className="export-icon"
									/>
								</button>
								<button className="export-button">
									Izvozi kot Excel{" "}
									<img
										src={Excel}
										alt="excel"
										className="export-icon"
									/>
								</button>
							</div>
						</div>
					</DrawerContent>
				</div>
			</Drawer>
		</div>
	);
}
