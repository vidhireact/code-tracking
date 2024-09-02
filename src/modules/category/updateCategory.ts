import { Category, CategoryModel } from ".";
/**
 * 
 * @param category category with ID
 * @returns return update category
 */
export const updateCategory = async (category: Category) => {
    await CategoryModel.findByIdAndUpdate(category._id, category.toJSON());
    return category ? new Category(category) : null;
};