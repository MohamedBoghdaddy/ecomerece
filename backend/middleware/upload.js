import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "shop_products",
    allowed_formats: ["jpg", "jpeg", "png"],
  },
});

export default multer({ storage });
