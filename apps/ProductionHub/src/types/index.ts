/** Equipment status */
export type EquipmentStatus = "Operational" | "Maintenance" | "Decommissioned";

/** An equipment entry */
export interface Equipment {
  id: string;
  name: string;
  description: string;
  available_units: number;
  status: EquipmentStatus;
  model: string;
  serial_number: string;
  location: string;
  manufacturer: string;
  installation_date: string | null;
  photo_url: string;
  created_at: string;
  updated_at: string;
}

/** A maintenance note on equipment */
export interface EquipmentNote {
  id: string;
  equipment_id: string;
  author_name: string;
  author_role: string;
  text: string;
  created_at: string;
}

/** Recipe status */
export type RecipeStatus = "Active" | "Draft" | "Archived";

/** A recipe for manufacturing */
export interface Recipe {
  id: string;
  name: string;
  product: string;
  version: string;
  status: RecipeStatus;
  description: string;
  instructions: string;
  created_at: string;
  updated_at: string;
}

/** A material required by a recipe */
export interface RecipeMaterial {
  id: string;
  recipe_id: string;
  material_name: string;
  quantity: number;
  unit: string;
}

/** A product output from a recipe */
export interface RecipeProduct {
  id: string;
  recipe_id: string;
  product_name: string;
  amount: string;
}

/** Equipment required by a recipe */
export interface RecipeEquipment {
  id: string;
  recipe_id: string;
  equipment_id: string;
  equipment_name?: string;
}

/** Production run status */
export type RunStatus =
  | "Scheduled"
  | "Confirmed"
  | "In Progress"
  | "On Track"
  | "Material Shortage"
  | "Pending Approval"
  | "Cancelled"
  | "Completed";

/** A production run */
export interface ProductionRun {
  id: string;
  recipe_id: string;
  recipe_name?: string;
  product_name?: string;
  start_date: string;
  end_date: string;
  planned_quantity: number;
  unit: string;
  status: RunStatus;
  notes: string;
  created_at: string;
  updated_at: string;
}

/** Forecast data for a material in a production run */
export interface RunForecast {
  id: string;
  run_id: string;
  material_name: string;
  required_amount: number;
  forecast_available: number;
  unit: string;
  pending_delivery: string;
}

/** Equipment assigned to a production run */
export interface RunEquipmentItem {
  id: string;
  run_id: string;
  equipment_id: string;
  equipment_name: string;
  status: string;
  notes: string;
}

/** Full production run detail with related data */
export interface RunDetail extends ProductionRun {
  materials: RecipeMaterial[];
  forecasts: RunForecast[];
  equipment: RunEquipmentItem[];
}
