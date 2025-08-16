import { Request, Response } from "express";
import { LEDService } from "../services/ledService";
import {
  LEDBrightnessRequest,
  LEDFillRequest,
  LEDPatternRequest,
  LEDRangeRequest,
  LEDSetRequest,
} from "../types/led.types";

export class LEDController {
  constructor(private ledService: LEDService) {}

  setLED = async (req: Request<{}, {}, LEDSetRequest>, res: Response) => {
    try {
      const { index, color } = req.body;

      if (index === undefined || !color) {
        return res.status(400).json({
          success: false,
          error: "Index and color are required",
        });
      }

      const result = await this.ledService.setPixel(index, color);
      res.json({
        success: result,
        message: result ? `Set LED ${index} to ${color}` : "Failed to set LED",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  };

  setRange = async (req: Request<{}, {}, LEDRangeRequest>, res: Response) => {
    try {
      const { start, end, color } = req.body;

      if (start === undefined || end === undefined || !color) {
        return res.status(400).json({
          success: false,
          error: "Start, end, and color are required",
        });
      }

      const result = await this.ledService.setRange(start, end, color);
      res.json({
        success: result,
        message: result
          ? `Set LEDs ${start}-${end - 1} to ${color}`
          : "Failed to set range",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  };

  setPattern = async (
    req: Request<{}, {}, LEDPatternRequest>,
    res: Response
  ) => {
    try {
      const { pattern } = req.body;

      if (!pattern || !Array.isArray(pattern)) {
        return res.status(400).json({
          success: false,
          error: "Pattern array is required",
        });
      }

      const result = await this.ledService.setPattern(pattern);
      res.json({
        success: result,
        message: result
          ? `Applied pattern to ${pattern.length} LEDs`
          : "Failed to set pattern",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  };

  fillAll = async (req: Request<{}, {}, LEDFillRequest>, res: Response) => {
    try {
      const { color } = req.body;

      if (!color) {
        return res.status(400).json({
          success: false,
          error: "Color is required",
        });
      }

      const result = await this.ledService.fillAll(color);
      res.json({
        success: result,
        message: result
          ? `Filled all LEDs with ${color}`
          : "Failed to fill LEDs",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  };

  clear = async (req: Request, res: Response) => {
    try {
      const result = await this.ledService.clear();
      res.json({
        success: result,
        message: result ? "Cleared all LEDs" : "Failed to clear LEDs",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  };

  setBrightness = async (
    req: Request<{}, {}, LEDBrightnessRequest>,
    res: Response
  ) => {
    try {
      const { brightness } = req.body;

      if (brightness === undefined) {
        return res.status(400).json({
          success: false,
          error: "Brightness is required",
        });
      }

      const result = await this.ledService.setBrightness(brightness);
      res.json({
        success: result,
        message: result
          ? `Set brightness to ${brightness}`
          : "Failed to set brightness",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  };

  getStatus = async (req: Request, res: Response) => {
    try {
      const result = await this.ledService.getStatus();
      if (result) {
        res.json(result);
      } else {
        res.status(503).json({
          success: false,
          error: "Unable to connect to LED driver",
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  };

  getConfig = async (req: Request, res: Response) => {
    try {
      const result = await this.ledService.getConfig();
      if (result) {
        res.json(result);
      } else {
        res.status(503).json({
          success: false,
          error: "Unable to get LED configuration",
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  };

  // Effects
  rainbow = async (req: Request, res: Response) => {
    try {
      const delay = parseInt(req.body.delay) || 100;
      const result = await this.ledService.rainbow(delay);
      res.json({
        success: result,
        message: result ? "Rainbow effect completed" : "Rainbow effect failed",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  };

  wave = async (req: Request, res: Response) => {
    try {
      const color = req.body.color || "#00FF00";
      const delay = parseInt(req.body.delay) || 50;
      const result = await this.ledService.wave(color, delay);
      res.json({
        success: result,
        message: result ? "Wave effect completed" : "Wave effect failed",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  };

  breathe = async (req: Request, res: Response) => {
    try {
      const color = req.body.color || "#FFFFFF";
      const duration = parseInt(req.body.duration) || 2000;

      const result = await this.ledService.breathe(color, duration);
      res.json({
        success: result,
        message: result ? "Breathe effect completed" : "Breathe effect failed",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  };

  sparkle = async (req: Request, res: Response) => {
    try {
      const color = req.body.color || "#FFFFFF";
      const count = parseInt(req.body.count) || 5;
      const duration = parseInt(req.body.duration) || 2000;

      const result = await this.ledService.sparkle(color, count, duration);
      res.json({
        success: result,
        message: result ? "Sparkle effect completed" : "Sparkle effect failed",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  };

  chase = async (req: Request, res: Response) => {
    try {
      const color = req.body.color || "#FFFFFF";
      const length = parseInt(req.body.length) || 3;
      const delay = parseInt(req.body.delay) || 100;

      const result = await this.ledService.chase(color, length, delay);
      res.json({
        success: result,
        message: result ? "Chase effect completed" : "Chase effect failed",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  };

  fadeTransition = async (req: Request, res: Response) => {
    try {
      const fromColor = req.body.fromColor || "#000000";
      const toColor = req.body.toColor || "#FFFFFF";
      const duration = parseInt(req.body.duration) || 1000;

      const result = await this.ledService.fadeTransition(
        fromColor,
        toColor,
        duration
      );
      res.json({
        success: result,
        message: result
          ? "Fade transition completed"
          : "Fade transition failed",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  };

  infiniteChase = async (req: Request, res: Response) => {
    try {
      const color = req.body.color || "#FFFFFF";
      const length = parseInt(req.body.length) || 3;
      const delay = parseInt(req.body.delay) || 100;

      const result = await this.ledService.infiniteChase(color, length, delay);
      res.json({
        success: result,
        message: result
          ? "Infinite chase effect started"
          : "Infinite chase effect failed",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  };

  stop = async (req: Request, res: Response) => {
    try {
      const result = await this.ledService.stopAnimation();
      res.json({
        success: result,
        message: result ? "LED effects stopped" : "Failed to stop LED effects",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  };
}
