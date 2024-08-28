import { Category, CategoryModel } from ".";
/**
 *
 * @param _id
 * @returns relevant category record | null
 */
export const getCategoryById = async (_id: string) => {
  const category = await CategoryModel.findById(_id);

  return category ? new Category(category) : null;
};
