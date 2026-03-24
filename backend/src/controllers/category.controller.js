import * as categoryService from "../services/category.service.js";

export async function listCategories(_req, res) {
  const data = await categoryService.getCategories();
  res.status(200).json({ data });
}
