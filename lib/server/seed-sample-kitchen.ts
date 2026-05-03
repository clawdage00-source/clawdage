import { randomUUID } from "node:crypto";
import type { PoolClient } from "pg";

export type KitchenSeedContext = {
  userId: string;
  kitchenId: string;
};

export type SeedSampleResult = {
  ingredientsInserted: number;
  recipesInserted: number;
  menusInserted: number;
  menuItemsInserted: number;
  wasteLogsInserted: number;
};

type IngredientDef = {
  name: string;
  category: string;
  unit: string;
  sku: string;
  vendorName: string;
  parLevel: number;
  currentStock: number;
  costPerUnit: number;
};

type RecipeLineDef = { ingredientIndex: number; quantity: number; unit: string };

type RecipeDef = {
  name: string;
  instructions: string;
  targetYield: number;
  yieldUnit: string;
  lines: RecipeLineDef[];
};

const INGREDIENTS: IngredientDef[] = [
  {
    name: "Basmati rice",
    category: "Dry goods",
    unit: "kg",
    sku: "DRY-RICE-BAS-01",
    vendorName: "Metro Cash",
    parLevel: 40,
    currentStock: 78.5,
    costPerUnit: 2.45,
  },
  {
    name: "Jeera samba rice",
    category: "Dry goods",
    unit: "kg",
    sku: "DRY-RICE-JER-01",
    vendorName: "Local mill",
    parLevel: 15,
    currentStock: 22,
    costPerUnit: 1.85,
  },
  {
    name: "Chicken leg (bone-in)",
    category: "Proteins",
    unit: "kg",
    sku: "PRT-CHK-LEG-01",
    vendorName: "FreshToHome",
    parLevel: 25,
    currentStock: 34.2,
    costPerUnit: 6.2,
  },
  {
    name: "Chicken breast",
    category: "Proteins",
    unit: "kg",
    sku: "PRT-CHK-BRS-01",
    vendorName: "FreshToHome",
    parLevel: 18,
    currentStock: 12.4,
    costPerUnit: 7.1,
  },
  {
    name: "Mutton curry cut",
    category: "Proteins",
    unit: "kg",
    sku: "PRT-MTN-CUT-01",
    vendorName: "Licious",
    parLevel: 12,
    currentStock: 8.6,
    costPerUnit: 14.5,
  },
  {
    name: "Paneer (block)",
    category: "Dairy",
    unit: "kg",
    sku: "DRY-PNR-BLK-01",
    vendorName: "Milky Mist",
    parLevel: 10,
    currentStock: 14.5,
    costPerUnit: 8.9,
  },
  {
    name: "Greek yogurt",
    category: "Dairy",
    unit: "kg",
    sku: "DRY-YGT-GRK-01",
    vendorName: "Epigamia B2B",
    parLevel: 8,
    currentStock: 6.2,
    costPerUnit: 5.4,
  },
  {
    name: "Yellow onion",
    category: "Produce",
    unit: "kg",
    sku: "PRD-ONN-YEL-01",
    vendorName: "Ninjacart",
    parLevel: 30,
    currentStock: 42,
    costPerUnit: 0.45,
  },
  {
    name: "Tomato (grade A)",
    category: "Produce",
    unit: "kg",
    sku: "PRD-TOM-A-01",
    vendorName: "Ninjacart",
    parLevel: 22,
    currentStock: 18,
    costPerUnit: 0.62,
  },
  {
    name: "Ginger–garlic paste",
    category: "Prep",
    unit: "kg",
    sku: "PRP-GGP-01",
    vendorName: "Kitchen prep",
    parLevel: 6,
    currentStock: 9.5,
    costPerUnit: 3.1,
  },
  {
    name: "Green chili",
    category: "Produce",
    unit: "kg",
    sku: "PRD-GCH-01",
    vendorName: "Ninjacart",
    parLevel: 2,
    currentStock: 1.8,
    costPerUnit: 2.2,
  },
  {
    name: "Coriander bunch",
    category: "Produce",
    unit: "pcs",
    sku: "PRD-COR-01",
    vendorName: "Ninjacart",
    parLevel: 40,
    currentStock: 55,
    costPerUnit: 0.35,
  },
  {
    name: "Mint bunch",
    category: "Produce",
    unit: "pcs",
    sku: "PRD-MNT-01",
    vendorName: "Ninjacart",
    parLevel: 30,
    currentStock: 28,
    costPerUnit: 0.42,
  },
  {
    name: "Garam masala blend",
    category: "Spices",
    unit: "kg",
    sku: "SPC-GM-01",
    vendorName: "Eastern",
    parLevel: 2,
    currentStock: 3.1,
    costPerUnit: 18.5,
  },
  {
    name: "Kashmiri chili powder",
    category: "Spices",
    unit: "kg",
    sku: "SPC-KCP-01",
    vendorName: "Eastern",
    parLevel: 2,
    currentStock: 2.4,
    costPerUnit: 12.2,
  },
  {
    name: "Refined sunflower oil",
    category: "Oil & fats",
    unit: "l",
    sku: "OIL-SUN-01",
    vendorName: "Fortune B2B",
    parLevel: 35,
    currentStock: 48,
    costPerUnit: 1.55,
  },
  {
    name: "Butter (salted)",
    category: "Dairy",
    unit: "kg",
    sku: "DRY-BTR-01",
    vendorName: "Amul Pro",
    parLevel: 5,
    currentStock: 7.2,
    costPerUnit: 9.8,
  },
  {
    name: "Fresh cream",
    category: "Dairy",
    unit: "l",
    sku: "DRY-CRM-01",
    vendorName: "Milky Mist",
    parLevel: 6,
    currentStock: 4.5,
    costPerUnit: 6.4,
  },
  {
    name: "Wheat atta",
    category: "Dry goods",
    unit: "kg",
    sku: "DRY-ATTA-01",
    vendorName: "Aashirvaad",
    parLevel: 25,
    currentStock: 30,
    costPerUnit: 0.95,
  },
  {
    name: "Maida",
    category: "Dry goods",
    unit: "kg",
    sku: "DRY-MAI-01",
    vendorName: "Aashirvaad",
    parLevel: 10,
    currentStock: 11,
    costPerUnit: 0.88,
  },
  {
    name: "Potato (medium)",
    category: "Produce",
    unit: "kg",
    sku: "PRD-POT-01",
    vendorName: "Ninjacart",
    parLevel: 20,
    currentStock: 26,
    costPerUnit: 0.38,
  },
  {
    name: "Green peas (frozen)",
    category: "Frozen",
    unit: "kg",
    sku: "FRZ-PEA-01",
    vendorName: "McCain",
    parLevel: 8,
    currentStock: 10,
    costPerUnit: 2.9,
  },
  {
    name: "Cashew paste",
    category: "Prep",
    unit: "kg",
    sku: "PRP-CAS-01",
    vendorName: "In-house",
    parLevel: 3,
    currentStock: 4.2,
    costPerUnit: 14.2,
  },
  {
    name: "Coconut milk",
    category: "Dry goods",
    unit: "l",
    sku: "DRY-CCM-01",
    vendorName: "Dabur Food Service",
    parLevel: 12,
    currentStock: 15,
    costPerUnit: 2.1,
  },
  {
    name: "Cheddar cheese",
    category: "Dairy",
    unit: "kg",
    sku: "DRY-CHD-01",
    vendorName: "Britannia Dairy",
    parLevel: 4,
    currentStock: 5.5,
    costPerUnit: 11.4,
  },
  {
    name: "Iceberg lettuce",
    category: "Produce",
    unit: "kg",
    sku: "PRD-LET-01",
    vendorName: "FreshToHome",
    parLevel: 5,
    currentStock: 3.8,
    costPerUnit: 4.2,
  },
  {
    name: "Turmeric powder",
    category: "Spices",
    unit: "kg",
    sku: "SPC-TUR-01",
    vendorName: "Eastern",
    parLevel: 1.5,
    currentStock: 2,
    costPerUnit: 9.5,
  },
  {
    name: "Iodized salt",
    category: "Spices",
    unit: "kg",
    sku: "SPC-SLT-01",
    vendorName: "Tata Salt",
    parLevel: 5,
    currentStock: 8,
    costPerUnit: 0.35,
  },
];

const RECIPES: RecipeDef[] = [
  {
    name: "Hyderabad chicken biryani (10 portions)",
    instructions: "Marinate chicken, layer rice, dum 45m. Hold above 63°C service.",
    targetYield: 10,
    yieldUnit: "portion",
    lines: [
      { ingredientIndex: 0, quantity: 1.8, unit: "kg" },
      { ingredientIndex: 2, quantity: 2.4, unit: "kg" },
      { ingredientIndex: 7, quantity: 0.8, unit: "kg" },
      { ingredientIndex: 15, quantity: 0.35, unit: "l" },
    ],
  },
  {
    name: "Paneer tikka masala (8 portions)",
    instructions: "Char paneer, makhani base, finish with cream.",
    targetYield: 8,
    yieldUnit: "portion",
    lines: [
      { ingredientIndex: 5, quantity: 1.2, unit: "kg" },
      { ingredientIndex: 8, quantity: 1.4, unit: "kg" },
      { ingredientIndex: 17, quantity: 0.25, unit: "l" },
      { ingredientIndex: 15, quantity: 0.12, unit: "l" },
    ],
  },
  {
    name: "Mutton rogan josh (6 portions)",
    instructions: "Slow braise mutton with browned onions and spice mix.",
    targetYield: 6,
    yieldUnit: "portion",
    lines: [
      { ingredientIndex: 4, quantity: 1.6, unit: "kg" },
      { ingredientIndex: 7, quantity: 0.9, unit: "kg" },
      { ingredientIndex: 13, quantity: 0.04, unit: "kg" },
      { ingredientIndex: 15, quantity: 0.2, unit: "l" },
    ],
  },
  {
    name: "Chicken kathi roll (12 rolls)",
    instructions: "Paratha, tikka strips, onions, chutney, wrap tight.",
    targetYield: 12,
    yieldUnit: "roll",
    lines: [
      { ingredientIndex: 18, quantity: 1.5, unit: "kg" },
      { ingredientIndex: 3, quantity: 1.8, unit: "kg" },
      { ingredientIndex: 7, quantity: 0.4, unit: "kg" },
      { ingredientIndex: 16, quantity: 0.15, unit: "kg" },
    ],
  },
  {
    name: "Veg protein bowl (10 bowls)",
    instructions: "Grains, peas, potato tikki, yogurt dressing.",
    targetYield: 10,
    yieldUnit: "bowl",
    lines: [
      { ingredientIndex: 20, quantity: 1.2, unit: "kg" },
      { ingredientIndex: 21, quantity: 0.6, unit: "kg" },
      { ingredientIndex: 6, quantity: 0.8, unit: "kg" },
      { ingredientIndex: 25, quantity: 0.3, unit: "kg" },
    ],
  },
  {
    name: "Dal makhani (5L tub)",
    instructions: "Overnight urad simulation — long simmer with butter finish.",
    targetYield: 5,
    yieldUnit: "l",
    lines: [
      { ingredientIndex: 0, quantity: 0.6, unit: "kg" },
      { ingredientIndex: 16, quantity: 0.25, unit: "kg" },
      { ingredientIndex: 17, quantity: 0.4, unit: "l" },
      { ingredientIndex: 8, quantity: 0.5, unit: "kg" },
    ],
  },
  {
    name: "Butter naan set (16 pcs)",
    instructions: "Tandoor 90s each, brush butter post-bake.",
    targetYield: 16,
    yieldUnit: "pc",
    lines: [
      { ingredientIndex: 19, quantity: 1.4, unit: "kg" },
      { ingredientIndex: 16, quantity: 0.2, unit: "kg" },
      { ingredientIndex: 6, quantity: 0.15, unit: "kg" },
    ],
  },
  {
    name: "Hyderabadi veg biryani (10 portions)",
    instructions: "Fried veg, yogurt marinade layer, mint finish.",
    targetYield: 10,
    yieldUnit: "portion",
    lines: [
      { ingredientIndex: 1, quantity: 1.6, unit: "kg" },
      { ingredientIndex: 20, quantity: 0.9, unit: "kg" },
      { ingredientIndex: 21, quantity: 0.4, unit: "kg" },
      { ingredientIndex: 12, quantity: 8, unit: "pcs" },
    ],
  },
  {
    name: "Grilled chicken meal (8 meals)",
    instructions: "Sous-vide optional; finish grill; side salad.",
    targetYield: 8,
    yieldUnit: "meal",
    lines: [
      { ingredientIndex: 3, quantity: 2, unit: "kg" },
      { ingredientIndex: 25, quantity: 0.6, unit: "kg" },
      { ingredientIndex: 15, quantity: 0.08, unit: "l" },
    ],
  },
  {
    name: "Malai paneer bowl (8 bowls)",
    instructions: "Mild cashew base, paneer cubes, fenugreek hint.",
    targetYield: 8,
    yieldUnit: "bowl",
    lines: [
      { ingredientIndex: 5, quantity: 1.1, unit: "kg" },
      { ingredientIndex: 22, quantity: 0.2, unit: "kg" },
      { ingredientIndex: 17, quantity: 0.2, unit: "l" },
    ],
  },
  {
    name: "Chicken tikka starter (15 skewers)",
    instructions: "Yogurt marinade 4h, charbroil, lemon finish.",
    targetYield: 15,
    yieldUnit: "skewer",
    lines: [
      { ingredientIndex: 3, quantity: 1.5, unit: "kg" },
      { ingredientIndex: 6, quantity: 0.35, unit: "kg" },
      { ingredientIndex: 9, quantity: 0.2, unit: "kg" },
      { ingredientIndex: 14, quantity: 0.03, unit: "kg" },
    ],
  },
  {
    name: "Cheese corn sandwich (20 halves)",
    instructions: "Maida crumb crust optional; grill melt.",
    targetYield: 20,
    yieldUnit: "half",
    lines: [
      { ingredientIndex: 19, quantity: 0.8, unit: "kg" },
      { ingredientIndex: 23, quantity: 0.35, unit: "kg" },
      { ingredientIndex: 21, quantity: 0.5, unit: "kg" },
    ],
  },
  {
    name: "Coconut veg stew + appam (8 sets)",
    instructions: "Stew coconut forward; appam batter separate station.",
    targetYield: 8,
    yieldUnit: "set",
    lines: [
      { ingredientIndex: 23, quantity: 1.2, unit: "l" },
      { ingredientIndex: 20, quantity: 0.7, unit: "kg" },
      { ingredientIndex: 10, quantity: 0.05, unit: "kg" },
    ],
  },
  {
    name: "Keema pav slider tray (24 pcs)",
    instructions: "Reduce keema dry; butter pav toast.",
    targetYield: 24,
    yieldUnit: "pc",
    lines: [
      { ingredientIndex: 4, quantity: 1.2, unit: "kg" },
      { ingredientIndex: 18, quantity: 0.5, unit: "kg" },
      { ingredientIndex: 7, quantity: 0.35, unit: "kg" },
    ],
  },
  {
    name: "Corporate veg thali (15 thalis)",
    instructions: "Portion control 6 bowls + bread basket.",
    targetYield: 15,
    yieldUnit: "thali",
    lines: [
      { ingredientIndex: 20, quantity: 1.5, unit: "kg" },
      { ingredientIndex: 21, quantity: 0.5, unit: "kg" },
      { ingredientIndex: 6, quantity: 0.4, unit: "kg" },
      { ingredientIndex: 18, quantity: 0.6, unit: "kg" },
    ],
  },
  {
    name: "Corporate non-veg thali (15 thalis)",
    instructions: "Protein split chicken/mutton gravies.",
    targetYield: 15,
    yieldUnit: "thali",
    lines: [
      { ingredientIndex: 2, quantity: 1.4, unit: "kg" },
      { ingredientIndex: 4, quantity: 0.8, unit: "kg" },
      { ingredientIndex: 0, quantity: 0.9, unit: "kg" },
      { ingredientIndex: 18, quantity: 0.5, unit: "kg" },
    ],
  },
  {
    name: "Midnight maggi melt bowl (12 bowls)",
    instructions: "Induction noodles, cheese pull, optional chili oil.",
    targetYield: 12,
    yieldUnit: "bowl",
    lines: [
      { ingredientIndex: 23, quantity: 0.25, unit: "kg" },
      { ingredientIndex: 21, quantity: 0.3, unit: "kg" },
      { ingredientIndex: 10, quantity: 0.02, unit: "kg" },
    ],
  },
  {
    name: "Chicken Caesar-ish salad (10 salads)",
    instructions: "Cold chain 4°C; dress to order.",
    targetYield: 10,
    yieldUnit: "salad",
    lines: [
      { ingredientIndex: 3, quantity: 1.1, unit: "kg" },
      { ingredientIndex: 25, quantity: 0.9, unit: "kg" },
      { ingredientIndex: 17, quantity: 0.15, unit: "l" },
    ],
  },
];

const MENU_BLUEPRINTS: Array<{
  name: string;
  channel: string;
  serviceWindow: string;
  isPublished: boolean;
  /** recipe indices and sell prices (INR-style) */
  items: Array<{ recipeIndex: number; sellPrice: number }>;
}> = [
  {
    name: "Swiggy — North Indian lunch",
    channel: "swiggy",
    serviceWindow: "lunch",
    isPublished: true,
    items: [
      { recipeIndex: 0, sellPrice: 269 },
      { recipeIndex: 6, sellPrice: 49 },
      { recipeIndex: 5, sellPrice: 189 },
    ],
  },
  {
    name: "Zomato — Biryani focus",
    channel: "zomato",
    serviceWindow: "dinner",
    isPublished: true,
    items: [
      { recipeIndex: 0, sellPrice: 289 },
      { recipeIndex: 7, sellPrice: 239 },
      { recipeIndex: 10, sellPrice: 319 },
    ],
  },
  {
    name: "In-house — corporate veg",
    channel: "inhouse",
    serviceWindow: "lunch",
    isPublished: true,
    items: [
      { recipeIndex: 14, sellPrice: 420 },
      { recipeIndex: 4, sellPrice: 249 },
      { recipeIndex: 7, sellPrice: 229 },
    ],
  },
  {
    name: "Magicpin — snack combos",
    channel: "magicpin",
    serviceWindow: "all_day",
    isPublished: false,
    items: [
      { recipeIndex: 11, sellPrice: 159 },
      { recipeIndex: 16, sellPrice: 139 },
      { recipeIndex: 3, sellPrice: 179 },
    ],
  },
  {
    name: "Swiggy — rolls & wraps",
    channel: "swiggy",
    serviceWindow: "late_night",
    isPublished: true,
    items: [
      { recipeIndex: 3, sellPrice: 169 },
      { recipeIndex: 11, sellPrice: 149 },
    ],
  },
  {
    name: "Zomato — premium curries",
    channel: "zomato",
    serviceWindow: "dinner",
    isPublished: true,
    items: [
      { recipeIndex: 1, sellPrice: 299 },
      { recipeIndex: 2, sellPrice: 349 },
      { recipeIndex: 9, sellPrice: 279 },
    ],
  },
  {
    name: "Blinkit quick meals (virtual)",
    channel: "blinkit",
    serviceWindow: "all_day",
    isPublished: true,
    items: [
      { recipeIndex: 16, sellPrice: 129 },
      { recipeIndex: 11, sellPrice: 119 },
      { recipeIndex: 6, sellPrice: 99 },
    ],
  },
  {
    name: "In-house — airline veg",
    channel: "inhouse",
    serviceWindow: "lunch",
    isPublished: false,
    items: [
      { recipeIndex: 14, sellPrice: 395 },
      { recipeIndex: 7, sellPrice: 265 },
    ],
  },
  {
    name: "Swiggy — protein bowls",
    channel: "swiggy",
    serviceWindow: "dinner",
    isPublished: true,
    items: [
      { recipeIndex: 8, sellPrice: 319 },
      { recipeIndex: 4, sellPrice: 259 },
      { recipeIndex: 17, sellPrice: 289 },
    ],
  },
  {
    name: "Zomato — South spread",
    channel: "zomato",
    serviceWindow: "lunch",
    isPublished: true,
    items: [
      { recipeIndex: 12, sellPrice: 249 },
      { recipeIndex: 7, sellPrice: 219 },
      { recipeIndex: 6, sellPrice: 45 },
    ],
  },
  {
    name: "Swiggy — keema & pav",
    channel: "swiggy",
    serviceWindow: "dinner",
    isPublished: true,
    items: [
      { recipeIndex: 13, sellPrice: 299 },
      { recipeIndex: 6, sellPrice: 39 },
    ],
  },
  {
    name: "In-house — non-veg corporate",
    channel: "inhouse",
    serviceWindow: "lunch",
    isPublished: true,
    items: [
      { recipeIndex: 15, sellPrice: 480 },
      { recipeIndex: 0, sellPrice: 295 },
      { recipeIndex: 5, sellPrice: 265 },
    ],
  },
  {
    name: "Zomato — starters flight",
    channel: "zomato",
    serviceWindow: "dinner",
    isPublished: false,
    items: [
      { recipeIndex: 10, sellPrice: 329 },
      { recipeIndex: 11, sellPrice: 169 },
    ],
  },
  {
    name: "Magicpin — thali value",
    channel: "magicpin",
    serviceWindow: "lunch",
    isPublished: true,
    items: [
      { recipeIndex: 14, sellPrice: 299 },
      { recipeIndex: 5, sellPrice: 219 },
      { recipeIndex: 1, sellPrice: 249 },
    ],
  },
  {
    name: "Swiggy — dal & bread",
    channel: "swiggy",
    serviceWindow: "all_day",
    isPublished: true,
    items: [
      { recipeIndex: 5, sellPrice: 199 },
      { recipeIndex: 6, sellPrice: 55 },
      { recipeIndex: 7, sellPrice: 229 },
    ],
  },
  {
    name: "Zomato — salad lane",
    channel: "zomato",
    serviceWindow: "lunch",
    isPublished: true,
    items: [{ recipeIndex: 17, sellPrice: 269 }],
  },
  {
    name: "In-house — banquet non-veg",
    channel: "inhouse",
    serviceWindow: "dinner",
    isPublished: true,
    items: [
      { recipeIndex: 15, sellPrice: 520 },
      { recipeIndex: 2, sellPrice: 389 },
      { recipeIndex: 1, sellPrice: 329 },
    ],
  },
  {
    name: "Swiggy — coconut veg night",
    channel: "swiggy",
    serviceWindow: "late_night",
    isPublished: false,
    items: [
      { recipeIndex: 12, sellPrice: 259 },
      { recipeIndex: 7, sellPrice: 209 },
    ],
  },
  {
    name: "Zomato — cheese & corn",
    channel: "zomato",
    serviceWindow: "all_day",
    isPublished: true,
    items: [
      { recipeIndex: 11, sellPrice: 149 },
      { recipeIndex: 16, sellPrice: 119 },
    ],
  },
  {
    name: "Aggregator — mixed bestsellers",
    channel: "swiggy",
    serviceWindow: "all_day",
    isPublished: true,
    items: [
      { recipeIndex: 0, sellPrice: 279 },
      { recipeIndex: 1, sellPrice: 289 },
      { recipeIndex: 3, sellPrice: 169 },
      { recipeIndex: 8, sellPrice: 299 },
      { recipeIndex: 10, sellPrice: 319 },
    ],
  },
];

const WASTE_REASONS = [
  "Spoilage — cold chain gap",
  "Prep trim & peel waste",
  "Burnt batch — grill overshoot",
  "Customer return — packaging damage",
  "Expired — FIFO miss",
  "Spill during saucing",
  "Overproduction — forecast error",
  "QC reject — texture",
  "Staff meal allocation",
  "Delivery delay — held too long",
  "Temperature abuse — blast chiller",
  "Broken seal — repack loss",
];

function formatLocalDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function mulberry32(seed: number) {
  return function next() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export async function seedSampleKitchenData(
  client: PoolClient,
  context: KitchenSeedContext,
): Promise<SeedSampleResult> {
  const seedBase = [...context.kitchenId.replace(/-/g, "")].reduce(
    (acc, ch) => acc + ch.charCodeAt(0),
    0,
  );
  const rnd = mulberry32((seedBase % 2147483646) + 1);

  const ingredientIds: string[] = [];
  const now = new Date();

  for (const def of INGREDIENTS) {
    const id = randomUUID();
    ingredientIds.push(id);
    await client.query(
      `
      INSERT INTO "ingredients"
        (id, kitchen_id, name, category, unit, sku, vendor_name, par_level, current_stock, cost_per_unit, is_archived, created_by, created_at, updated_at)
      VALUES
        ($1::uuid, $2::uuid, $3, $4, $5, $6, $7, $8, $9, $10, false, $11::uuid, $12, $12)
      `,
      [
        id,
        context.kitchenId,
        def.name,
        def.category,
        def.unit,
        def.sku,
        def.vendorName,
        def.parLevel,
        def.currentStock,
        def.costPerUnit,
        context.userId,
        now,
      ],
    );
  }

  const recipeIds: string[] = [];
  for (const recipe of RECIPES) {
    const recipeId = randomUUID();
    recipeIds.push(recipeId);
    await client.query(
      `
      INSERT INTO "recipes_v2"
        (id, kitchen_id, name, instructions, target_yield, yield_unit, version, is_archived, created_by, created_at, updated_at)
      VALUES
        ($1::uuid, $2::uuid, $3, $4, $5, $6, 1, false, $7::uuid, NOW(), NOW())
      `,
      [
        recipeId,
        context.kitchenId,
        recipe.name,
        recipe.instructions,
        recipe.targetYield,
        recipe.yieldUnit,
        context.userId,
      ],
    );
    for (const line of recipe.lines) {
      await client.query(
        `
        INSERT INTO "recipe_ingredients_v2" (id, recipe_id, ingredient_id, quantity, unit, created_at, updated_at)
        VALUES ($1::uuid, $2::uuid, $3::uuid, $4, $5, NOW(), NOW())
        `,
        [randomUUID(), recipeId, ingredientIds[line.ingredientIndex], line.quantity, line.unit],
      );
    }
  }

  let menuItemsInserted = 0;
  let menusInserted = 0;

  for (const blueprint of MENU_BLUEPRINTS) {
    const menuId = randomUUID();
    await client.query(
      `
      INSERT INTO "menus_v2"
        (id, kitchen_id, name, channel, service_window, is_published, is_archived, created_by, created_at, updated_at)
      VALUES
        ($1::uuid, $2::uuid, $3, $4, $5, $6, false, $7::uuid, NOW(), NOW())
      `,
      [
        menuId,
        context.kitchenId,
        blueprint.name,
        blueprint.channel,
        blueprint.serviceWindow,
        blueprint.isPublished,
        context.userId,
      ],
    );
    menusInserted += 1;

    for (const item of blueprint.items) {
      await client.query(
        `
        INSERT INTO "menu_items_v2" (id, menu_id, recipe_id, sell_price, is_available, created_at, updated_at)
        VALUES ($1::uuid, $2::uuid, $3::uuid, $4, $5, NOW(), NOW())
        `,
        [
          randomUUID(),
          menuId,
          recipeIds[item.recipeIndex],
          item.sellPrice,
          rnd() > 0.08,
        ],
      );
      menuItemsInserted += 1;
    }
  }

  let wasteLogsInserted = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let dayOffset = 0; dayOffset < 30; dayOffset += 1) {
    const d = new Date(today);
    d.setDate(d.getDate() - dayOffset);
    const dateStr = formatLocalDate(d);
    const entriesThisDay = 3 + Math.floor(rnd() * 4);
    for (let e = 0; e < entriesThisDay; e += 1) {
      const ingIdx = Math.floor(rnd() * ingredientIds.length);
      const qty = Math.round((0.15 + rnd() * 9.5) * 100) / 100;
      const reason = WASTE_REASONS[Math.floor(rnd() * WASTE_REASONS.length)] ?? WASTE_REASONS[0];
      await client.query(
        `
        INSERT INTO "waste_logs" (id, kitchen_id, ingredient_id, quantity_wasted, reason, waste_date)
        VALUES ($1::uuid, $2::uuid, $3::uuid, $4, $5, $6::date)
        `,
        [randomUUID(), context.kitchenId, ingredientIds[ingIdx], qty, reason, dateStr],
      );
      wasteLogsInserted += 1;
    }
  }

  return {
    ingredientsInserted: INGREDIENTS.length,
    recipesInserted: RECIPES.length,
    menusInserted,
    menuItemsInserted,
    wasteLogsInserted,
  };
}
