import { BusinessModel } from ".";

export const getBusiness = async (page, limit) => {
  const skip = (page - 1) * limit;

  const business = await BusinessModel.find()
    .skip(skip)
    .limit(limit)
    .sort({ _id: -1 });

  return business;
};
