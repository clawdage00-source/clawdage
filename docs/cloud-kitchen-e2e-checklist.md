# Cloud Kitchen E2E Checklist

## Setup
- Run DB migration for `db/migrations/20260426_cloud_kitchen_features.sql`.
- Login with a kitchen user having role `admin` or `manager`.

## Ingredients
- Create ingredient with unit, par level, and cost.
- Search ingredient by partial name.
- Enable low stock filter and verify only below-par items show.
- Archive and unarchive ingredient.

## Recipes
- Create recipe with yield and instruction text.
- Add multiple ingredient lines.
- Verify theoretical cost appears in list.
- Open recipe detail and verify line-level cost context.

## Batches
- Start batch from an existing recipe.
- Confirm batch opens with `in_progress` status and expected yield.
- Close batch with actual yield and waste quantity.
- Verify status changes to `completed` and values are persisted.

## Menus
- Create a menu with channel and service window.
- Add recipe-linked items with sell price.
- Open detail and verify margin snapshot (price - recipe cost).
- Verify menu list shows item count.

## Security / Access
- Verify viewer role cannot create/update/archive records.
- Verify kitchen user cannot access records from another kitchen.

## Error / Empty / Loading UX
- Confirm all module pages show loading state.
- Confirm friendly empty state when no records exist.
- Confirm API errors are shown as human-readable messages.
