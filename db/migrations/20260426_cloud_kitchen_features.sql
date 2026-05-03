CREATE TABLE IF NOT EXISTS "recipes_v2" (
  "id" uuid PRIMARY KEY,
  "kitchen_id" uuid NOT NULL REFERENCES "kitchens" ("id") ON DELETE CASCADE,
  "name" varchar NOT NULL,
  "instructions" text,
  "target_yield" decimal NOT NULL DEFAULT 1,
  "yield_unit" varchar NOT NULL DEFAULT 'portion',
  "version" integer NOT NULL DEFAULT 1,
  "is_archived" boolean NOT NULL DEFAULT false,
  "created_by" uuid REFERENCES "users" ("id") ON DELETE SET NULL,
  "created_at" timestamp NOT NULL DEFAULT NOW(),
  "updated_at" timestamp NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "recipe_ingredients_v2" (
  "id" uuid PRIMARY KEY,
  "recipe_id" uuid NOT NULL REFERENCES "recipes_v2" ("id") ON DELETE CASCADE,
  "ingredient_id" uuid NOT NULL REFERENCES "ingredients" ("id") ON DELETE RESTRICT,
  "quantity" decimal NOT NULL,
  "unit" varchar NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT NOW(),
  "updated_at" timestamp NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "menus_v2" (
  "id" uuid PRIMARY KEY,
  "kitchen_id" uuid NOT NULL REFERENCES "kitchens" ("id") ON DELETE CASCADE,
  "name" varchar NOT NULL,
  "channel" varchar NOT NULL DEFAULT 'inhouse',
  "service_window" varchar NOT NULL DEFAULT 'all_day',
  "is_published" boolean NOT NULL DEFAULT false,
  "is_archived" boolean NOT NULL DEFAULT false,
  "created_by" uuid REFERENCES "users" ("id") ON DELETE SET NULL,
  "created_at" timestamp NOT NULL DEFAULT NOW(),
  "updated_at" timestamp NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "menu_items_v2" (
  "id" uuid PRIMARY KEY,
  "menu_id" uuid NOT NULL REFERENCES "menus_v2" ("id") ON DELETE CASCADE,
  "recipe_id" uuid NOT NULL REFERENCES "recipes_v2" ("id") ON DELETE RESTRICT,
  "sell_price" decimal NOT NULL,
  "is_available" boolean NOT NULL DEFAULT true,
  "created_at" timestamp NOT NULL DEFAULT NOW(),
  "updated_at" timestamp NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "production_batches" (
  "id" uuid PRIMARY KEY,
  "kitchen_id" uuid NOT NULL REFERENCES "kitchens" ("id") ON DELETE CASCADE,
  "recipe_id" uuid NOT NULL REFERENCES "recipes_v2" ("id") ON DELETE RESTRICT,
  "status" varchar NOT NULL DEFAULT 'planned',
  "expected_yield" decimal NOT NULL,
  "actual_yield" decimal,
  "waste_quantity" decimal NOT NULL DEFAULT 0,
  "per_unit_cost_snapshot" decimal NOT NULL DEFAULT 0,
  "notes" text,
  "started_at" timestamp,
  "completed_at" timestamp,
  "created_by" uuid REFERENCES "users" ("id") ON DELETE SET NULL,
  "created_at" timestamp NOT NULL DEFAULT NOW(),
  "updated_at" timestamp NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "batch_ingredient_usage" (
  "id" uuid PRIMARY KEY,
  "batch_id" uuid NOT NULL REFERENCES "production_batches" ("id") ON DELETE CASCADE,
  "ingredient_id" uuid NOT NULL REFERENCES "ingredients" ("id") ON DELETE RESTRICT,
  "planned_quantity" decimal NOT NULL DEFAULT 0,
  "actual_quantity" decimal,
  "unit" varchar NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT NOW(),
  "updated_at" timestamp NOT NULL DEFAULT NOW()
);

ALTER TABLE "ingredients"
  ADD COLUMN IF NOT EXISTS "sku" varchar,
  ADD COLUMN IF NOT EXISTS "vendor_name" varchar,
  ADD COLUMN IF NOT EXISTS "par_level" decimal,
  ADD COLUMN IF NOT EXISTS "is_archived" boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "created_by" uuid REFERENCES "users" ("id") ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS "created_at" timestamp NOT NULL DEFAULT NOW();

CREATE INDEX IF NOT EXISTS "idx_recipes_v2_kitchen_id" ON "recipes_v2" ("kitchen_id");
CREATE INDEX IF NOT EXISTS "idx_recipe_ingredients_v2_recipe_id" ON "recipe_ingredients_v2" ("recipe_id");
CREATE INDEX IF NOT EXISTS "idx_menus_v2_kitchen_id" ON "menus_v2" ("kitchen_id");
CREATE INDEX IF NOT EXISTS "idx_menu_items_v2_menu_id" ON "menu_items_v2" ("menu_id");
CREATE INDEX IF NOT EXISTS "idx_batches_kitchen_id" ON "production_batches" ("kitchen_id");
