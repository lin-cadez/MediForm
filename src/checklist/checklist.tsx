"use client";

import { useEffect, useState } from "react";
import { generatePdfFromJson } from "./pdfGenerator";
import { NavLink } from "react-router-dom";
import { ArrowLeft, ChevronRight } from "lucide-react";
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
import { motion, AnimatePresence } from "framer-motion";
import "./checklist.css";
import Logo from "../logotip_vegova_brez_naziva_leze.png";

interface JsonData {
	title: string;
	description: string;
	categories: Record<
		string,
		{
			title: string;
			description: string;
			subcategories: Record<
				string,
				{
					title: string;
					description: string | null;
					elements: Record<
						string,
						{
							title: string;
							unit: string | null;
							value: string | boolean | string[] | null;
							hint: string | null;
						}
					>;
				}
			>;
		}
	>;
}

interface Element {
	title: string;
	unit: string | null;
	value: string | number | boolean | string[] | null;
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

export default function Checklist() {
	const [list, setList] = useState<List | null>(null);
	const [formData, setFormData] = useState<Record<string, any>>({});
	const [openCategories, setOpenCategories] = useState<
		Record<string, boolean>
	>({});
	const [isOpen, setIsOpen] = useState(false);

	const updateLocalStorage = (newList: List) => {
		const path = window.location.pathname;
		const urlSegment = path.split("/checklist/")[1];
		localStorage.setItem(urlSegment, JSON.stringify(newList));
	};

	const castToArray = (value: any): string[] => {
		return Array.isArray(value) ? value : [];
	};

	const fetchData = async () => {
		const urlSegment = window.location.pathname.split("/checklist/")[1];

		const storedData = localStorage.getItem(urlSegment);
		if (storedData) {
			// Parse and cast values in the stored data
			const parsedData: List = JSON.parse(storedData);

			// Ensure all multi-select elements have their `value` cast to arrays
			Object.values(parsedData.categories).forEach((category) => {
				Object.values(category.subcategories).forEach((subcategory) => {
					Object.entries(subcategory.elements).forEach(
						([, element]) => {
							if (element.option_type === "multiple") {
								// Ensure the value is cast to an array
								element.value = castToArray(element.value);
							}
						}
					);
				});
			});

			setList(parsedData);
			return;
		}

		try {
			const response = await fetch(
				"https://raw.githubusercontent.com/jakecernet/zd-json/refs/heads/main/test1.json"
			);
			if (!response.ok) {
				throw new Error("Failed to fetch the data.");
			}
			const data: List = await response.json();

			// Cast values in the fetched data
			Object.values(data.categories).forEach((category) => {
				Object.values(category.subcategories).forEach((subcategory) => {
					Object.entries(subcategory.elements).forEach(
						([, element]) => {
							if (element.option_type === "multiple") {
								// Ensure the value is cast to an array
								element.value = castToArray(element.value);
							}
						}
					);
				});
			});

			setList(data);
			updateLocalStorage(data);
		} catch (error) {
			console.error("Error fetching data:", error);
		}
	};

	const handleInputChange = (
		categoryId: string,
		subcategoryId: string,
		elementId: string,
		value: any
	) => {
		setFormData((prevData) => {
			const newFormData = {
				...prevData,
				[categoryId]: {
					...prevData[categoryId],
					[subcategoryId]: {
						...prevData[categoryId]?.[subcategoryId],
						[elementId]: value,
					},
				},
			};

			// Update the list state
			setList((prevList) => {
				if (!prevList) return null;
				const newList = {
					...prevList,
					categories: {
						...prevList.categories,
						[categoryId]: {
							...prevList.categories[categoryId],
							subcategories: {
								...prevList.categories[categoryId]
									.subcategories,
								[subcategoryId]: {
									...prevList.categories[categoryId]
										.subcategories[subcategoryId],
									elements: {
										...prevList.categories[categoryId]
											.subcategories[subcategoryId]
											.elements,
										[elementId]: {
											...prevList.categories[categoryId]
												.subcategories[subcategoryId]
												.elements[elementId],
											value: value,
										},
									},
								},
							},
						},
					},
				};

				updateLocalStorage(newList);
				return newList;
			});

			return newFormData;
		});
	};

	useEffect(() => {
		fetchData();
	}, []);

	const toggleCategory = (categoryId: string) => {
		setOpenCategories((prevState) => ({
			...prevState,
			[categoryId]: !prevState[categoryId],
		}));
	};

	// rendera vse elemente v podkategoriji
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
								] ??
								element.value ??
								""
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
								Array.isArray(element.value)
									? element.value
									: []
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
										] ??
										element.value ??
										""
									}
									onChange={(e) =>
										handleInputChange(
											categoryId,
											subcategoryId,
											elementId,
											e.target.value
										)
									}
									placeholder={
										element.value ? "" : element.hint || ""
									}
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
								] ??
								element.value ??
								false
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

	const success = document.querySelector(".success");

	const openSuccess = () => {
		if (success) {
			success.classList.add("show");
			const urlSegment = window.location.pathname.split("/checklist/")[1];
			localStorage.removeItem(urlSegment);
			setTimeout(() => {
				closeSuccess();
			}, 3000);
		}
	};

	const closeSuccess = () => {
		if (success) {
			success.classList.remove("show");
		}
	};

	const exportPdf = async () => {
		setIsOpen(false);

		try {
			const pdfBlob = await generatePdfFromJson(list as JsonData);
			const link = document.createElement("a");
			link.href = URL.createObjectURL(pdfBlob);
			link.download = "example.pdf";
			link.click();

			openSuccess();
		} catch (error) {
			console.error("Error generating PDF:", error);
		}
	};

	const exportExcel = () => {
		setIsOpen(false);
		openSuccess();
	};

	const categoryVariants = {
		hidden: { opacity: 0, height: 0 },
		visible: { opacity: 1, height: "auto" },
	};

	return (
		<div className="checklist-page">
			<Drawer open={isOpen} onOpenChange={setIsOpen}>
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
					<DrawerTrigger asChild onClick={() => closeSuccess()}>
						<img src={ExportSVG} alt="export" className="h-6" />
					</DrawerTrigger>
				</nav>
				<div className="content">
					{Object.entries(list.categories).map(
						([categoryId, category]) => (
							<Card className="p-4 mb-4 shadow-md card-bg">
								<CardHeader
									className="flex items-left justify-between cursor-pointer"
									onClick={() => toggleCategory(categoryId)}>
									<CardTitle className="flex items-center text-lg font-semibold">
										<motion.div
											className="icon-container"
											animate={{
												rotate: openCategories[
													categoryId
												]
													? 90
													: 0,
											}}
											transition={{ duration: 0.3 }}>
											<ChevronRight size={24} />
										</motion.div>
										<span className="title-text">
											{category.title}
										</span>
									</CardTitle>
								</CardHeader>
								<AnimatePresence>
									{openCategories[categoryId] && (
										<motion.div
											variants={categoryVariants}
											initial="hidden"
											animate="visible"
											exit="hidden"
											transition={{ duration: 0.3 }}>
											<CardContent className="category-content">
												<p className="opacity-50 mb-4">
													{category.description}
												</p>
												{Object.entries(
													category.subcategories
												).map(
													([
														subcategoryId,
														subcategory,
													]) => (
														<motion.div
															key={subcategoryId}
															className="subcategory mb-4"
															initial={{
																opacity: 0,
															}}
															animate={{
																opacity: 1,
															}}
															transition={{
																duration: 0.3,
																delay: 0.1,
															}}>
															<h3 className="font-semibold">
																{
																	subcategory.title
																}
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
																	<motion.div
																		key={
																			elementId
																		}
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
																	</motion.div>
																)
															)}
														</motion.div>
													)
												)}
											</CardContent>
										</motion.div>
									)}
								</AnimatePresence>
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
							<button
								className="export-button"
								onClick={exportPdf}>
								Izvozi kot PDF{" "}
								<img
									src={Pdf}
									alt="pdf"
									className="inline ml-2"
								/>
							</button>
							<button
								className="export-button"
								onClick={exportExcel}>
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
				<div className="success">
					<p>Seznam je bil uspešno izvožen.</p>
					<img src={Logo} alt="logo" />
				</div>
			</Drawer>
		</div>
	);
}
