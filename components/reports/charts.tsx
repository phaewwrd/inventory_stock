"use client";

import { Card, CardContent, Typography } from "@mui/material";
import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Legend,
	Line,
	LineChart,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

interface ChartCardProps {
	title: string;
	children: React.ReactNode;
}

export function ChartCard({ title, children }: ChartCardProps) {
	return (
		<Card>
			<CardContent>
				<Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
					{title}
				</Typography>
				{children}
			</CardContent>
		</Card>
	);
}

// ─── Line Chart ──────────────────────────────────────────────────────────────

interface LineChartComponentProps {
	data: Array<Record<string, string | number>>;
	xKey: string;
	lines: { key: string; color: string; name: string }[];
	height?: number;
}

export function LineChartComponent({
	data,
	xKey,
	lines,
	height = 300,
}: LineChartComponentProps) {
	const safeData = Array.isArray(data) ? data : [];

	return (
		<ResponsiveContainer width="100%" height={height}>
			<LineChart data={safeData}>
				<CartesianGrid strokeDasharray="3 3" stroke="#E5E8ED" />
				<XAxis dataKey={xKey} stroke="#59616F" style={{ fontSize: 12 }} />
				<YAxis stroke="#59616F" style={{ fontSize: 12 }} />
				<Tooltip
					formatter={(value) => (value != null ? value : 0)}
					contentStyle={{
						backgroundColor: "#FFFFFF",
						border: "1px solid #E5E8ED",
						borderRadius: 8,
					}}
				/>
				<Legend />
				{Array.isArray(lines) &&
					lines.map((line) => (
						<Line
							key={line.key}
							type="monotone"
							dataKey={line.key}
							stroke={line.color}
							strokeWidth={2}
							name={line.name}
							dot={false}
						/>
					))}
			</LineChart>
		</ResponsiveContainer>
	);
}

// ─── Bar Chart ───────────────────────────────────────────────────────────────

type BarChartData = Record<string, string | number>;

interface BarChartComponentProps {
	data: BarChartData[];
	xKey: string;
	bars: { key: string; color: string; name: string }[];
	height?: number;
	horizontal?: boolean;
}

export function BarChartComponent({
	data,
	xKey,
	bars,
	height = 300,
	horizontal = false,
}: BarChartComponentProps) {
	const safeData = Array.isArray(data) ? data : [];

	return (
		<ResponsiveContainer width="100%" height={height}>
			<BarChart data={safeData} layout={horizontal ? "vertical" : "horizontal"}>
				<CartesianGrid strokeDasharray="3 3" stroke="#E5E8ED" />
				{horizontal ? (
					<>
						<XAxis type="number" stroke="#59616F" style={{ fontSize: 12 }} />
						<YAxis
							type="category"
							dataKey={xKey}
							stroke="#59616F"
							style={{ fontSize: 12 }}
							width={120}
						/>
					</>
				) : (
					<>
						<XAxis dataKey={xKey} stroke="#59616F" style={{ fontSize: 12 }} />
						<YAxis stroke="#59616F" style={{ fontSize: 12 }} />
					</>
				)}
				<Tooltip
					formatter={(value) => (value != null ? value : 0)}
					contentStyle={{
						backgroundColor: "#FFFFFF",
						border: "1px solid #E5E8ED",
						borderRadius: 8,
					}}
				/>
				<Legend />
				{Array.isArray(bars) &&
					bars.map((bar) => (
						<Bar
							key={bar.key}
							dataKey={bar.key}
							fill={bar.color}
							name={bar.name}
							radius={[4, 4, 0, 0]}
						/>
					))}
			</BarChart>
		</ResponsiveContainer>
	);
}

// ─── Pie Chart ───────────────────────────────────────────────────────────────

interface PieChartData {
	name: string;
	value: number;
}

interface PieChartComponentProps {
	data: PieChartData[];
	colors: string[];
	height?: number;
	showLabel?: boolean;
}

export function PieChartComponent({
	data,
	colors,
	height = 300,
	showLabel = true,
}: PieChartComponentProps) {
	const safeData = Array.isArray(data) ? data : [];
	const safeColors = Array.isArray(colors) ? colors : [];

	return (
		<ResponsiveContainer width="100%" height={height}>
			<PieChart>
				<Pie
					data={safeData}
					dataKey="value"
					nameKey="name"
					cx="50%"
					cy="50%"
					outerRadius={100}
					label={
						showLabel
							? (entry) => {
									if (entry == null) return "";
									return `${entry.name ?? ""}: ${entry.value ?? 0}`;
								}
							: undefined
					}
				>
					{safeData.map((_entry, index) => (
						<Cell
							key={`cell-${
								// biome-ignore lint/suspicious/noArrayIndexKey: Using index as key is acceptable here because the data is static and not reordered.
								index
							}`}
							fill={safeColors[index % safeColors.length] ?? "#8A919E"}
						/>
					))}
				</Pie>
				<Tooltip
					formatter={(value) => (value != null ? value : 0)}
					contentStyle={{
						backgroundColor: "#FFFFFF",
						border: "1px solid #E5E8ED",
						borderRadius: 8,
					}}
				/>
				<Legend />
			</PieChart>
		</ResponsiveContainer>
	);
}

// ─── Candlestick Chart (Using BarChart as approximation) ────────────────────

interface CandlestickData {
	date: string;
	open: number;
	high: number;
	low: number;
	close: number;
}

interface CandlestickChartProps {
	data: CandlestickData[];
	height?: number;
}

export function CandlestickChart({
	data,
	height = 300,
}: CandlestickChartProps) {
	const safeData = Array.isArray(data) ? data : [];

	const processedData = safeData.map((item) => ({
		...item,
		range: item.high - item.low,
		positive: item.close >= item.open,
	}));

	return (
		<ResponsiveContainer width="100%" height={height}>
			<BarChart data={processedData}>
				<CartesianGrid strokeDasharray="3 3" stroke="#E5E8ED" />
				<XAxis dataKey="date" stroke="#59616F" style={{ fontSize: 12 }} />
				<YAxis stroke="#59616F" style={{ fontSize: 12 }} />
				<Tooltip
					contentStyle={{
						backgroundColor: "#FFFFFF",
						border: "1px solid #E5E8ED",
						borderRadius: 8,
					}}
					formatter={(value) => (value != null ? value : 0)}
				/>
				<Legend />
				<Bar dataKey="close" name="Close" radius={[4, 4, 0, 0]}>
					{processedData.map((entry, index) => (
						<Cell
							key={`cell-${
								// biome-ignore lint/suspicious/noArrayIndexKey: Using index as key is acceptable here because the data is static and not reordered.
								index
							}`}
							fill={entry.positive ? "#639922" : "#E24B4A"}
						/>
					))}
				</Bar>
			</BarChart>
		</ResponsiveContainer>
	);
}
