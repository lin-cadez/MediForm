"use client";

import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { ArrowLeft, ChevronDown, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@/components/ui/drawer";
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
	const [openCategories, setOpenCategories] = useState<
		Record<string, boolean>
	>({});

	const fetchData = () => {
		const path = window.location.pathname;
		const urlSegment = path.split("/checklist/")[1];

		const storedData = localStorage.getItem(urlSegment);
		if (storedData) {
			setList(JSON.parse(storedData));
			return;
		}
	};

	useEffect(() => {
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

	const toggleCategory = (categoryId: string) => {
		setOpenCategories((prevState) => ({
			...prevState,
			[categoryId]: !prevState[categoryId],
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
						<div className="w-full max-w-md mx-auto pt-4 pb-4">
							<div className="border rounded-md p-2 w-full">
								<Input
									type="text"
									className="placeholder_fix"
									style={{ border: 0, boxShadow: "none" }}
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
							</div>
						</div>
					);
				}
			case "bool":
				return (
					<div className="py-4 flex items-center space-x-2">
						<Checkbox
							className="w-6 h-6 shadow-4"
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
					</div>
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
				<nav className="navbar">
					<NavLink to="/" end>
						<ArrowLeft />
					</NavLink>
					<div className="title">
						<h1 title={list.title}>
							{list.title.length > 12
								? `${list.title.substring(0, 12)}...`
								: list.title}
						</h1>
					</div>
					<DrawerTrigger asChild>
						<img src={ExportSVG} alt="export" className="h-6" />
					</DrawerTrigger>
				</nav>
				<div className="content">
					{Object.entries(list.categories).map(
						([categoryId, category]) => (
							<Card
								key={categoryId}
								className="p-4 mb-4 shadow-md card-bg">
								<CardHeader
									className="flex items-left justify-between"
									onClick={() => toggleCategory(categoryId)}>
									<CardTitle className="flex items-center text-lg font-semibold">
										<div className="icon-container">
											{openCategories[categoryId] ? (
												<ChevronDown size={24} />
											) : (
												<ChevronRight size={24} />
											)}
										</div>
										<span className="title-text">
											{category.title}
										</span>
									</CardTitle>
								</CardHeader>
								{openCategories[categoryId] && (
									<CardContent className="category-content">
										<p className="opacity-50 mb-4">
											{category.description}
										</p>
										{Object.entries(
											category.subcategories
										).map(
											([subcategoryId, subcategory]) => (
												<div
													key={subcategoryId}
													className="subcategory mb-4">
													<h3 className="font-semibold">
														{subcategory.title}
													</h3>
													{subcategory.description && (
														<p className="text-sm opacity-75 mb-2">
															{
																subcategory.description
															}
														</p>
													)}
													{Object.entries(
														subcategory.elements
													).map(
														([
															elementId,
															element,
														]) => (
															<div
																key={elementId}
																className="element mb-4">
																<Label
																	htmlFor={
																		elementId
																	}>
																	{
																		element.title
																	}
																</Label>
																<div className="input-wrapper flex items-center space-x-2">
																	{renderElement(
																		categoryId,
																		subcategoryId,
																		elementId,
																		element
																	)}
																	{element.unit && (
																		<span className="unit text-gray-500">
																			{
																				element.unit
																			}
																		</span>
																	)}
																</div>
															</div>
														)
													)}
												</div>
											)
										)}
									</CardContent>
								)}
							</Card>
						)
					)}
				</div>
				<DrawerContent>
					<DrawerHeader>
						<DrawerTitle>Možnosti izvoza</DrawerTitle>
					</DrawerHeader>
					<div className="p-4">
						<DrawerDescription>
							Izberi format izvoza tvojega seznama opravil.
						</DrawerDescription>
						<div className="export-buttons mt-4">
							<button className="export-button">
								Izvozi kot PDF{" "}
								<img
									src={Pdf}
									alt="pdf"
									className="inline ml-2"
								/>
							</button>
							<button className="export-button">
								Izvozi kot Excel{" "}
								<img
									src={Excel}
									alt="excel"
									className="inline ml-2"
								/>
							</button>
						</div>
					</div>
				</DrawerContent>
			</Drawer>
		</div>
	);
}
