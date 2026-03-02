const express = require("express");
const router = express.Router();

// Import controller (pastikan module.exports di controller berbentuk object)
const populerController = require("../controllers/komikPopulerController");

/**
 * @swagger
 * /api/v1/komik-populer/all:
 *   get:
 *     summary: Get all popular comics
 *     tags: [Comics]
 *     responses:
 *       200:
 *         description: Success
 */
router.get("/all", populerController.getAllPopuler);

/**
 * @swagger
 * /api/v1/komik-populer/manga:
 *   get:
 *     summary: Get popular Manga
 *     tags: [Comics]
 *     responses:
 *       200:
 *         description: Success
 */
router.get("/manga", populerController.getMangaPopuler);

/**
 * @swagger
 * /api/v1/komik-populer/manhwa:
 *   get:
 *     summary: Get popular Manhwa
 *     tags: [Comics]
 *     responses:
 *       200:
 *         description: Success
 */
router.get("/manhwa", populerController.getManhwaPopuler);

/**
 * @swagger
 * /api/v1/komik-populer/manhua:
 *   get:
 *     summary: Get popular Manhua
 *     tags: [Comics]
 *     responses:
 *       200:
 *         description: Success
 */
router.get("/manhua", populerController.getManhuaPopuler);

module.exports = router;
