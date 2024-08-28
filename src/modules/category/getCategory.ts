import { CategoryModel } from ".";

export const getCategory = async () => {
  const category = await CategoryModel.find().lean();
  return category;
};
