import { useEffect, useState, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../hooks";
import { fetchRecipes, fetchRecipeById } from "../slices/recipesSlice";
import { RecipesHeader } from "../components/RecipesHeader";
import { RecipesTable } from "../components/RecipesTable";
import { RecipeDetailsPanel } from "../components/RecipeDetailsPanel";
import type { Recipe } from "../types";

export function RecipesPage() {
  const dispatch = useAppDispatch();
  const { items, currentRecipe, loading, error } = useAppSelector(
    (state) => state.recipes
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchRecipes());
  }, [dispatch]);

  useEffect(() => {
    if (selectedRecipeId) {
      dispatch(fetchRecipeById(selectedRecipeId));
    }
  }, [dispatch, selectedRecipeId]);

  const filteredItems = useMemo(() => {
    return items.filter((recipe: Recipe) => {
      const matchesSearch =
        !searchQuery ||
        recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.product.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = !statusFilter || recipe.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [items, searchQuery, statusFilter]);

  return (
    <div className="page-content" data-testid="recipes-page">
      <RecipesHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />
      {loading ? (
        <div className="loading-state">Loading recipes...</div>
      ) : error ? (
        <div className="error-state">{error}</div>
      ) : (
        <div className="recipes-layout">
          <div className="recipes-table-section">
            <RecipesTable
              items={filteredItems}
              selectedRecipeId={selectedRecipeId}
              onSelectRecipe={setSelectedRecipeId}
            />
          </div>
          {selectedRecipeId && currentRecipe && currentRecipe.id === selectedRecipeId && (
            <div className="recipes-panel-section">
              <RecipeDetailsPanel
                recipe={currentRecipe}
                onClose={() => setSelectedRecipeId(null)}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
