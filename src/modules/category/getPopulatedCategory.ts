import { CategoryModel } from ".";
/**
 * 
 * @returns populated category 
 */
export const getPopulatedCategory = async () => {
  const category = await CategoryModel.find().populate({
    path: "serviceIds",
    select: "-__v",
  });

  return category;
};