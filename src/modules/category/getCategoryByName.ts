import { CategoryModel } from ".";
/**
 * 
 * @param name category name
 * @returns return category by name
 */
export const getCategoryByName = async (name: string) => {
  const category = await CategoryModel.findOne({ name });
  
  return category;
};
