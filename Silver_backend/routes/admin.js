
import { Router } from "express";
import adminAuth from "../middleware/adminAuth.js";
import * as adminAuthController from "../controllers/adminAuthController.js";
import * as adminImageController from "../controllers/adminImageController.js";

const router = Router();

router.post("/seed", adminAuthController.seedAdmin); // run once then remove or protect
router.post("/login", adminAuthController.loginAdmin);
router.post("/logout", adminAuthController.logoutAdmin);

router.get("/cloudinary/sign", adminAuth, adminImageController.getCloudinarySignature);
router.post("/upload", adminAuth, adminImageController.uploadServer); // server-side
router.post("/images", adminAuth, adminImageController.createImageRecord);
router.get("/images", adminAuth, adminImageController.listImages);
router.delete("/images/:id", adminAuth, adminImageController.deleteImage);

export default router;
