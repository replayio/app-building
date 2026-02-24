App: Production Hub
Initial Prompt: Production planning software for a small business manufacturing goods.  The software needs separate pages to track recipes, a calendar to schedule production runs, view information about each production run including the recipe / amounts of raw materials used, and track equipment that is available and required by different recipes.  There must be a calendar page.  There must be a run details page.  The app connects to separate apps for tracking inventory and scheduling deliveries so that the the production runs show forecasts for the amounts of materials which will be available.

Pages:

1. RecipesPage (/recipes)
   Description: Page for managing manufacturing recipes. Layout likely includes a table or list of recipes with columns such as recipe name, product, version, and status. There should be controls to add, edit, and delete recipes. Selecting a recipe opens its detailed view (either inline, separate page, or modal). Each recipe contains a breakdown of raw materials and quantities required per production unit, plus possible notes or instructions. Filtering and search for recipes by name or product should be available. This page is focused on defining and maintaining the standard recipes used in production runs.
   Mockup: https://utfs.io/f/g4w5SXU7E8KdlrMSeznvLlgzebcKqNs0DmihQTtVZ9rv61UO

2. CalendarPage (/calendar)
   Description: Calendar view to schedule and visualize production runs over time. The main layout is a calendar (daily/weekly/monthly views) showing each scheduled production run as an event or block. Users can click on a date to create a new production run or select an existing run to open its details page or modal. Each event shows key info such as product/recipe name, quantity, and status. The page includes navigation controls to move between weeks/months, and may integrate data from external inventory and delivery scheduling apps to visually indicate availability constraints (e.g., color coding runs with material shortages). Drag-and-drop or editing of events may be used to reschedule runs. This page is the central hub for planning when production runs occur.
   Mockup: https://utfs.io/f/g4w5SXU7E8KdTvUTHD7IfSRxAhcbzPKXQNjVd4MGOspvJ9t0

3. RunDetailsPage (/runs/:runId)
   Description: Detailed view for a specific production run. The layout includes sections for: (1) High-level run info (run ID, date/time, product, associated recipe, planned quantity, status). (2) Recipe and raw materials section listing each material required, the amount needed for the planned quantity, and units. (3) Forecast/availability section showing projected inventory levels for each material at the time of the run, based on data from the separate inventory tracking and delivery scheduling apps. This may include columns like required amount, forecast available amount, shortage/excess, and any pending delivery details. (4) equipment the run will require and availability. Users can adjust quantities, confirm or cancel the run, and view links to related records in the external apps. All information about the selected production run, including recipe and material usage, is visible here.
   Mockup: https://utfs.io/f/g4w5SXU7E8KdBdqSYEMnmAIsi8awdrfjCvQq9WMFZL56Dg2e

4. RecipeDetailsPage (/recipe/:recipeId)
   Description: Information about a recipe for a manufacturing process including its title, description, raw materials and amounts required per batch, the products and amounts that will result, and the equipment that the recipe requires.  The equipment refers to data managed on a separate equipment page.
   Mockup: https://utfs.io/f/g4w5SXU7E8KdCzFQ0GJin1BPSFeJzG2d6mrcMXaToqOAuZVW

5. EquipmentPage (/equipment)
   Description: Describes all the equipment available for production runs.  Each equipment entry has a title, description, and count of available units.  Show this information in a table with an "add equipment" button
   Mockup: https://utfs.io/f/g4w5SXU7E8KdJluhrxNZbHCjsqLm4pSDyh2UeXVR73uoa8Pf

6. EquipmentDetailsPage (/equipment/:id)
   Description: Details about a piece of manufacturing equipment.  Title, description, optional photo.  Comment system for adding notes over time.
   Mockup: https://utfs.io/f/g4w5SXU7E8Kdrrtx7jY1UySfpKLziNW8uXr9g70HQMeB4I5w
