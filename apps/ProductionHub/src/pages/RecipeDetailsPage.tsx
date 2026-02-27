import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks";
import { fetchRecipeById, clearCurrentRecipe } from "../slices/recipesSlice";
import { RecipeDetailHeader } from "../components/RecipeDetailHeader";
import { DescriptionCard } from "../components/DescriptionCard";
import { ProductsOutputTable } from "../components/ProductsOutputTable";
import { RawMaterialsCard } from "../components/RawMaterialsCard";
import { EquipmentRequiredList } from "../components/EquipmentRequiredList";

export function RecipeDetailsPage() {
  const { recipeId } = useParams<{ recipeId: string }>();
  const dispatch = useAppDispatch();
  const { currentRecipe, loading, error } = useAppSelector(
    (state) => state.recipes
  );

  useEffect(() => {
    if (recipeId) {
      dispatch(fetchRecipeById(recipeId));
    }
    return () => {
      dispatch(clearCurrentRecipe());
    };
  }, [dispatch, recipeId]);

  if (loading) {
    return (
      <div data-testid="recipe-details-page" className="page-content">
        <div className="loading-state">Loading recipe details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div data-testid="recipe-details-page" className="page-content">
        <div className="error-state">{error}</div>
      </div>
    );
  }

  if (!currentRecipe) {
    return (
      <div data-testid="recipe-details-page" className="page-content">
        <div className="loading-state">Loading...</div>
      </div>
    );
  }

  return (
    <div data-testid="recipe-details-page">
      <RecipeDetailHeader recipe={currentRecipe} />
      <div className="page-content">
        <div className="recipe-details-grid">
          <DescriptionCard description={currentRecipe.description} />
          <ProductsOutputTable products={currentRecipe.products} />
          <RawMaterialsCard materials={currentRecipe.materials} />
          <EquipmentRequiredList equipment={currentRecipe.equipment} />
        </div>
      </div>
    </div>
  );
}
