import { Category, CategoryModel } from ".";
/**
 *
 * @param _id category _id
 * @returns return populated category
 */
export const getPopulatedCategoryById = async (_id: string) => {
  const category: Category = await CategoryModel.findById(_id).populate({
    path: "serviceIds",
    select: "-__v",
  });

  return category ? new Category(category) : null;
};
