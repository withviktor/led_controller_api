import { Router } from "express";
import { LEDController } from "../controllers/ledController";

export function createLEDRoutes(ledController: LEDController): Router {
  const router = Router();

  /**
   * @swagger
   * /api/led/set:
   *   post:
   *     summary: Set a single LED color
   *     tags: [Basic Control]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/LEDSetRequest'
   *     responses:
   *       200:
   *         description: LED set successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/SuccessResponse'
   *       400:
   *         description: Bad request
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  router.post("/set", ledController.setLED);

  /**
   * @swagger
   * /api/led/range:
   *   post:
   *     summary: Set a range of LEDs to the same color
   *     tags: [Basic Control]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/LEDRangeRequest'
   *     responses:
   *       200:
   *         description: LED range set successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/SuccessResponse'
   */
  router.post("/range", ledController.setRange);

  /**
   * @swagger
   * /api/led/pattern:
   *   post:
   *     summary: Set LEDs according to a color pattern
   *     tags: [Basic Control]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/LEDPatternRequest'
   *     responses:
   *       200:
   *         description: Pattern applied successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/SuccessResponse'
   */
  router.post("/pattern", ledController.setPattern);

  /**
   * @swagger
   * /api/led/fill:
   *   post:
   *     summary: Fill all LEDs with the same color
   *     tags: [Basic Control]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/LEDFillRequest'
   *     responses:
   *       200:
   *         description: All LEDs filled successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/SuccessResponse'
   */
  router.post("/fill", ledController.fillAll);

  /**
   * @swagger
   * /api/led/clear:
   *   post:
   *     summary: Turn off all LEDs
   *     tags: [Basic Control]
   *     responses:
   *       200:
   *         description: All LEDs cleared successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/SuccessResponse'
   */
  router.post("/clear", ledController.clear);

  /**
   * @swagger
   * /api/led/brightness:
   *   post:
   *     summary: Set LED brightness
   *     tags: [Basic Control]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/LEDBrightnessRequest'
   *     responses:
   *       200:
   *         description: Brightness set successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/SuccessResponse'
   */
  router.post("/brightness", ledController.setBrightness);

  /**
   * @swagger
   * /api/led/status:
   *   get:
   *     summary: Get LED system status
   *     tags: [Status]
   *     responses:
   *       200:
   *         description: Status retrieved successfully
   *       503:
   *         description: Unable to connect to LED driver
   */
  router.get("/status", ledController.getStatus);

  /**
   * @swagger
   * /api/led/config:
   *   get:
   *     summary: Get LED configuration
   *     tags: [Status]
   *     responses:
   *       200:
   *         description: Configuration retrieved successfully
   *       503:
   *         description: Unable to get LED configuration
   */
  router.get("/config", ledController.getConfig);

  /**
   * @swagger
   * /api/led/effects/rainbow:
   *   post:
   *     summary: Run rainbow effect
   *     tags: [Effects]
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               delay:
   *                 type: integer
   *                 description: Delay between colors in milliseconds
   *                 example: 100
   *     responses:
   *       200:
   *         description: Rainbow effect completed
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/SuccessResponse'
   */
  router.post("/effects/rainbow", ledController.rainbow);

  /**
   * @swagger
   * /api/led/effects/wave:
   *   post:
   *     summary: Run wave effect
   *     tags: [Effects]
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               color:
   *                 type: string
   *                 example: '#00FF00'
   *               delay:
   *                 type: integer
   *                 example: 50
   *     responses:
   *       200:
   *         description: Wave effect completed
   */
  router.post("/effects/wave", ledController.wave);

  /**
   * @swagger
   * /api/led/effects/breathe:
   *   post:
   *     summary: Run breathe effect
   *     tags: [Effects]
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               color:
   *                 type: string
   *                 example: '#FFFFFF'
   *               duration:
   *                 type: integer
   *                 example: 2000
   *     responses:
   *       200:
   *         description: Breathe effect completed
   */
  router.post("/effects/breathe", ledController.breathe);

  /**
   * @swagger
   * /api/led/effects/sparkle:
   *   post:
   *     summary: Run sparkle effect
   *     tags: [Effects]
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               color:
   *                 type: string
   *                 example: '#FFFFFF'
   *               count:
   *                 type: integer
   *                 example: 5
   *               duration:
   *                 type: integer
   *                 example: 2000
   *     responses:
   *       200:
   *         description: Sparkle effect completed
   */
  router.post("/effects/sparkle", ledController.sparkle);

  /**
   * @swagger
   * /api/led/effects/chase:
   *   post:
   *     summary: Run chase effect
   *     tags: [Effects]
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               color:
   *                 type: string
   *                 example: '#FFFFFF'
   *               length:
   *                 type: integer
   *                 example: 3
   *               delay:
   *                 type: integer
   *                 example: 100
   *     responses:
   *       200:
   *         description: Chase effect completed
   */
  router.post("/effects/chase", ledController.chase);

  /**
   * @swagger
   * /api/led/effects/fade:
   *   post:
   *     summary: Run fade transition effect
   *     tags: [Effects]
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               fromColor:
   *                 type: string
   *                 example: '#000000'
   *               toColor:
   *                 type: string
   *                 example: '#FFFFFF'
   *               duration:
   *                 type: integer
   *                 example: 1000
   *     responses:
   *       200:
   *         description: Fade transition completed
   */
  router.post("/effects/fade", ledController.fadeTransition);

  /**
   * @swagger
   * /api/led/effects/infinite-chase:
   *   post:
   *     summary: Run infinite chase effect
   *     tags: [Effects]
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               color:
   *                 type: string
   *                 example: '#FFFFFF'
   *               length:
   *                 type: integer
   *                 example: 3
   *               delay:
   *                 type: integer
   *                 example: 100
   *     responses:
   *       200:
   *         description: Infinite chase effect started
   */
  router.post("/effects/infinite-chase", ledController.infiniteChase);
  /**
   * @swagger
   * /api/led/effects/stop:
   *   post:
   *     summary: Stop all LED effects
   *     tags: [Effects]
   *     responses:
   *       200:
   *         description: LED effects stopped
   */
  router.post("/effects/stop", ledController.stop);

  return router;
}
