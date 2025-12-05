import Favorite from "../models/favoriteModel.js";

const USER_ID = "guest1";

// GET favorites
export const getFavorites = async (req, res) => {
  const fav = await Favorite.findOne({ userId: USER_ID }).populate("products");
  res.json(fav || { userId: USER_ID, products: [] });
};

// ADD to favorites
export const addFavorite = async (req, res) => {
  const { productId } = req.body;

  let fav = await Favorite.findOne({ userId: USER_ID });
  if (!fav) fav = await Favorite.create({ userId: USER_ID, products: [] });

  if (!fav.products.includes(productId)) {
    fav.products.push(productId);
    await fav.save();
  }

  res.json(fav);
};

// REMOVE from favorites
export const removeFavorite = async (req, res) => {
  const { productId } = req.body;

  let fav = await Favorite.findOne({ userId: USER_ID });
  if (!fav) return res.json({});

  fav.products = fav.products.filter((id) => id.toString() !== productId);

  await fav.save();

  res.json(fav);
};
