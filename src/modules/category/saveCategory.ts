import { Category, CategoryModel } from ".";
/**
 *
 * @param category
 * @returns null or Category class
 */
export const saveCategory = async (category: Category) => {
  await new CategoryModel(category.toJSON()).save();
  return category ? new Category(category) : null;
};
