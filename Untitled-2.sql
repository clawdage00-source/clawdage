CREATE TABLE "kitchens" (
  "id" uuid PRIMARY KEY,
  "name" varchar,
  "address" text,
  "city" varchar,
  "created_at" timestamp
);

CREATE TABLE "users" (
  "id" uuid PRIMARY KEY,
  "kitchen_id" uuid,
  "full_name" varchar,
  "email" varchar UNIQUE,
  "role" varchar,
  "created_at" timestamp
);

CREATE TABLE "virtual_brands" (
  "id" uuid PRIMARY KEY,
  "kitchen_id" uuid,
  "brand_name" varchar,
  "is_active" boolean DEFAULT true,
  "created_at" timestamp
);

CREATE TABLE "ingredients" (
  "id" uuid PRIMARY KEY,
  "kitchen_id" uuid,
  "name" varchar,
  "category" varchar,
  "unit" varchar,
  "min_stock_level" decimal,
  "current_stock" decimal DEFAULT 0,
  "cost_per_unit" decimal,
  "updated_at" timestamp
);

CREATE TABLE "ingredient_batches" (
  "id" uuid PRIMARY KEY,
  "ingredient_id" uuid,
  "quantity" decimal,
  "expiry_date" date,
  "received_at" timestamp,
  "status" varchar
);

CREATE TABLE "vendors" (
  "id" uuid PRIMARY KEY,
  "kitchen_id" uuid,
  "vendor_name" varchar,
  "contact_number" varchar,
  "category" varchar
);

CREATE TABLE "menu_items" (
  "id" uuid PRIMARY KEY,
  "brand_id" uuid,
  "name" varchar,
  "price" decimal,
  "created_at" timestamp
);

CREATE TABLE "recipes" (
  "id" uuid PRIMARY KEY,
  "menu_item_id" uuid,
  "ingredient_id" uuid,
  "quantity_required" decimal
);

CREATE TABLE "sales_records" (
  "id" uuid PRIMARY KEY,
  "kitchen_id" uuid,
  "menu_item_id" uuid,
  "quantity_sold" integer,
  "sale_date" date,
  "source" varchar,
  "created_at" timestamp
);

CREATE TABLE "forecasts" (
  "id" uuid PRIMARY KEY,
  "kitchen_id" uuid,
  "ingredient_id" uuid,
  "predicted_quantity" decimal,
  "forecast_date" date,
  "confidence_score" decimal,
  "created_at" timestamp
);

CREATE TABLE "alerts" (
  "id" uuid PRIMARY KEY,
  "kitchen_id" uuid,
  "type" varchar,
  "message" text,
  "status" varchar,
  "channel" varchar,
  "sent_at" timestamp
);

CREATE TABLE "waste_logs" (
  "id" uuid PRIMARY KEY,
  "kitchen_id" uuid,
  "ingredient_id" uuid,
  "quantity_wasted" decimal,
  "reason" varchar,
  "waste_date" date
);

COMMENT ON COLUMN "ingredients"."min_stock_level" IS 'Trigger alert when stock falls below this';

COMMENT ON COLUMN "ingredients"."cost_per_unit" IS 'Last purchase price per unit';

COMMENT ON COLUMN "recipes"."quantity_required" IS 'Amount of ingredient used for 1 unit of this dish';

COMMENT ON COLUMN "sales_records"."source" IS 'Manual entry or CSV Import';

COMMENT ON COLUMN "forecasts"."confidence_score" IS 'AI confidence 0.0 to 1.0';

COMMENT ON COLUMN "alerts"."type" IS 'low_stock, expiry_warning, overstock';

COMMENT ON COLUMN "alerts"."status" IS 'pending, sent, failed';

COMMENT ON COLUMN "alerts"."channel" IS 'whatsapp, email';

COMMENT ON COLUMN "waste_logs"."reason" IS 'spoiled, spilled, burnt, returned';

ALTER TABLE "users" ADD FOREIGN KEY ("kitchen_id") REFERENCES "kitchens" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "virtual_brands" ADD FOREIGN KEY ("kitchen_id") REFERENCES "kitchens" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "ingredients" ADD FOREIGN KEY ("kitchen_id") REFERENCES "kitchens" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "ingredient_batches" ADD FOREIGN KEY ("ingredient_id") REFERENCES "ingredients" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "vendors" ADD FOREIGN KEY ("kitchen_id") REFERENCES "kitchens" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "menu_items" ADD FOREIGN KEY ("brand_id") REFERENCES "virtual_brands" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "recipes" ADD FOREIGN KEY ("menu_item_id") REFERENCES "menu_items" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "recipes" ADD FOREIGN KEY ("ingredient_id") REFERENCES "ingredients" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "sales_records" ADD FOREIGN KEY ("kitchen_id") REFERENCES "kitchens" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "sales_records" ADD FOREIGN KEY ("menu_item_id") REFERENCES "menu_items" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "forecasts" ADD FOREIGN KEY ("kitchen_id") REFERENCES "kitchens" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "forecasts" ADD FOREIGN KEY ("ingredient_id") REFERENCES "ingredients" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "alerts" ADD FOREIGN KEY ("kitchen_id") REFERENCES "kitchens" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "waste_logs" ADD FOREIGN KEY ("kitchen_id") REFERENCES "kitchens" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "waste_logs" ADD FOREIGN KEY ("ingredient_id") REFERENCES "ingredients" ("id") DEFERRABLE INITIALLY IMMEDIATE;
