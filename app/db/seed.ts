import { randomUUID } from "node:crypto";
import { toDateString } from "@/lib/helper";
import { db } from ".";
import {
	categories,
	productLots,
	products,
	stockMovements,
	user,
} from "./schema";

/**
 * =========================
 * 1. CATEGORY SEED
 * =========================
 */
const categorySeeds = [
	{ id: "grains_rice", productname: "ข้าว/ธัญพืช", description: "Rice & grains" },
	{ id: "noodles_pasta", productname: "เส้น/บะหมี่", description: "Noodles" },
	{ id: "seasoning", productname: "เครื่องปรุง", description: "Seasoning" },
	{ id: "canned_food", productname: "อาหารกระป๋อง", description: "Canned food" },
	{ id: "beverages", productname: "เครื่องดื่ม", description: "Drinks" },
	{ id: "dairy", productname: "นม/ผลิตภัณฑ์นม", description: "Dairy" },
	{ id: "bakery_snacks", productname: "ขนม/เบเกอรี่", description: "Bakery" },
	{ id: "frozen_food", productname: "วัตถุดิบแช่แข็ง", description: "Frozen food" },
	{ id: "dry_food", productname: "ของแห้ง/สำเร็จรูป", description: "Dry food" },
];

/**
 * =========================
 * ADMIN USER
 * =========================
 */
const adminId = randomUUID();

/**
 * =========================
 * PRODUCT RAW DATA
 * =========================
 */
const rawProducts = [
	["FD0001", "grains_rice", "ข้าวหอมมะลิ", "5 กก.", "ถุง", 48, 21, 0, "หมดสต็อก"],
	["FD0002", "grains_rice", "ข้าวเหนียว", "5 กก.", "ถุง", 90, 35, 55, "ปกติ"],
	["FD0003", "grains_rice", "ข้าวกล้อง", "2 กก.", "ถุง", 77, 28, 244, "ปกติ"],
	["FD0004", "grains_rice", "ข้าวไรซ์เบอร์รี่", "2 กก.", "ถุง", 46, 63, 190, "ปกติ"],
	["FD0005", "grains_rice", "โอ๊ตมีล", "1 กก.", "ถุง", 42, 57, 250, "ปกติ"],
	[
		"FD0006",
		"grains_rice",
		"ซีเรียลธัญพืช",
		"500 กรัม",
		"กล่อง",
		128,
		22,
		139,
		"ปกติ",
	],
	[
		"FD0007",
		"noodles_pasta",
		"เส้นสปาเกตตี",
		"500 กรัม",
		"แพ็ค",
		27,
		25,
		0,
		"หมดสต็อก",
	],
	[
		"FD0008",
		"noodles_pasta",
		"เส้นมักกะโรนี",
		"500 กรัม",
		"แพ็ค",
		75,
		34,
		179,
		"ปกติ",
	],
	[
		"FD0009",
		"noodles_pasta",
		"เส้นหมี่อบแห้ง",
		"400 กรัม",
		"แพ็ค",
		149,
		58,
		248,
		"ปกติ",
	],
	[
		"FD0010",
		"noodles_pasta",
		"บะหมี่กึ่งสำเร็จรูป",
		"60 กรัม",
		"ซอง",
		26,
		55,
		93,
		"ปกติ",
	],
	["FD0011", "noodles_pasta", "วุ้นเส้น", "200 กรัม", "แพ็ค", 70, 65, 81, "ปกติ"],
	[
		"FD0012",
		"noodles_pasta",
		"เส้นก๋วยเตี๋ยวอบแห้ง",
		"500 กรัม",
		"แพ็ค",
		127,
		34,
		303,
		"ปกติ",
	],

	["FD0013", "seasoning", "น้ำปลา", "700 มล.", "ขวด", 75, 57, 58, "ปกติ"],
	["FD0014", "seasoning", "ซีอิ๊วขาว", "700 มล.", "ขวด", 53, 71, 315, "ปกติ"],
	["FD0015", "seasoning", "ซอสหอยนางรม", "600 มล.", "ขวด", 18, 68, 284, "ปกติ"],
	["FD0016", "seasoning", "ซอสมะเขือเทศ", "500 กรัม", "ขวด", 38, 64, 327, "ปกติ"],
	["FD0017", "seasoning", "ซอสพริก", "500 กรัม", "ขวด", 72, 41, 192, "ปกติ"],
	["FD0018", "seasoning", "น้ำตาลทราย", "1 กก.", "ถุง", 53, 29, 216, "ปกติ"],
	["FD0019", "seasoning", "เกลือป่น", "500 กรัม", "ถุง", 45, 68, 260, "ปกติ"],
	["FD0020", "seasoning", "พริกไทยป่น", "100 กรัม", "ขวด", 61, 26, 96, "ปกติ"],
	["FD0021", "seasoning", "ผงปรุงรส", "850 กรัม", "ถุง", 29, 44, 114, "ปกติ"],

	[
		"FD0022",
		"canned_food",
		"ปลากระป๋อง",
		"155 กรัม",
		"กระป๋อง",
		44,
		42,
		279,
		"ปกติ",
	],
	[
		"FD0023",
		"canned_food",
		"ทูน่ากระป๋อง",
		"185 กรัม",
		"กระป๋อง",
		108,
		58,
		327,
		"ปกติ",
	],
	[
		"FD0024",
		"canned_food",
		"ข้าวโพดหวานกระป๋อง",
		"340 กรัม",
		"กระป๋อง",
		87,
		71,
		221,
		"ปกติ",
	],
	[
		"FD0025",
		"canned_food",
		"ถั่วแดงกระป๋อง",
		"400 กรัม",
		"กระป๋อง",
		31,
		66,
		144,
		"ปกติ",
	],
	[
		"FD0026",
		"canned_food",
		"ผลไม้รวมกระป๋อง",
		"565 กรัม",
		"กระป๋อง",
		137,
		54,
		318,
		"ปกติ",
	],
	[
		"FD0027",
		"canned_food",
		"นมข้นหวานกระป๋อง",
		"380 กรัม",
		"กระป๋อง",
		51,
		79,
		109,
		"ปกติ",
	],

	["FD0028", "beverages", "น้ำดื่ม", "600 มล.", "ขวด", 32, 50, 238, "ปกติ"],
	["FD0029", "beverages", "น้ำแร่", "500 มล.", "ขวด", 43, 77, 267, "ปกติ"],
	["FD0030", "beverages", "น้ำผลไม้กล่อง", "200 มล.", "กล่อง", 31, 113, 374, "ปกติ"],
	["FD0031", "beverages", "ชาเขียว", "500 มล.", "ขวด", 20, 48, 246, "ปกติ"],
	[
		"FD0032",
		"beverages",
		"กาแฟกระป๋อง",
		"180 มล.",
		"กระป๋อง",
		10,
		69,
		115,
		"ปกติ",
	],
	["FD0033", "beverages", "นมถั่วเหลือง", "300 มล.", "กล่อง", 26, 50, 278, "ปกติ"],
	["FD0034", "beverages", "เกลือแร่", "500 มล.", "ขวด", 22, 52, 83, "ปกติ"],

	["FD0035", "dairy", "นมยูเอชที", "1 ลิตร", "กล่อง", 117, 37, 256, "ปกติ"],
	["FD0036", "dairy", "นมเปรี้ยว", "180 มล.", "ขวด", 136, 60, 120, "ปกติ"],
	["FD0037", "dairy", "โยเกิร์ต", "135 กรัม", "ถ้วย", 113, 30, 193, "ปกติ"],
	["FD0038", "dairy", "ชีสแผ่น", "200 กรัม", "แพ็ค", 114, 42, 59, "ปกติ"],
	["FD0039", "dairy", "เนยสด", "227 กรัม", "ก้อน", 73, 62, 98, "ปกติ"],
	["FD0040", "dairy", "ครีมเทียม", "400 กรัม", "ถุง", 88, 64, 123, "ปกติ"],
];

/**
 * =========================
 * LOT GENERATOR
 * =========================
 */
function generateLots(productId: string, qty: number, cost: number) {
	const first = Math.floor(qty * 0.4);
	const second = qty - first;

	return [
		{
			id: randomUUID(),
			productId,
			lotNo: `LOT-${productId}-001`,
			expiryDate: toDateString(new Date("2027-01-01")),
			receivedDate: toDateString(new Date("2026-01-01")),
			quantity: first,
			remainingQty: first,
			unitCost: cost.toString(),
		},
		{
			id: randomUUID(),
			productId,
			lotNo: `LOT-${productId}-002`,
			expiryDate: toDateString(new Date("2027-03-01")),
			receivedDate: toDateString(new Date("2026-03-01")),
			quantity: second,
			remainingQty: second,
			unitCost: cost.toString(),
		},
	];
}

/**
 * =========================
 * SEED FUNCTION (SAFE)
 * =========================
 */
async function seed() {
	console.log("🌱 Starting seed...");
	console.log("DB:", process.env.DATABASE_URL);

	await db.transaction(async (tx) => {
		// USER
		await tx.insert(user).values({
			id: adminId,
			name: "Admin",
			email: "admin@system.com",
			disabled: false,
			role: "OWNER",
			emailVerified: true,
		});

		// CATEGORIES
		await tx.insert(categories).values(categorySeeds);

		// PRODUCTS
		for (const p of rawProducts) {
			const [sku, categoryId, name, size, unit, cost, minStock, stock, status] =
				p as any;

			const productId = randomUUID();

			await tx.insert(products).values({
				id: productId,
				sku,
				categoryId,
				name,
				size,
				unit,
				latestCost: cost.toString(),
				minimumStock: minStock,
				isActive: status !== "หมดสต็อก",
				note: "Seeded data",
			});

			if (stock > 0) {
				const lots = generateLots(productId, stock, cost);

				await tx.insert(productLots).values(lots);

				let balance = 0;

				for (const lot of lots) {
					balance += lot.quantity;

					await tx.insert(stockMovements).values({
						id: randomUUID(),
						productId,
						lotId: lot.id,
						movementType: "receive",
						quantity: lot.quantity,
						balanceAfter: balance,
						remark: "Initial seed receive",
						createdBy: adminId,
					});
				}
			}
		}
	});

	console.log("✅ Seed completed successfully");
}

seed().catch((e) => {
	console.error("❌ Seed failed:", e);
	process.exit(1);
});
