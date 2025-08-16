import axios, { AxiosResponse } from "axios";

interface PixelData {
  index: number;
  color: string;
}

interface LEDDriverResponse {
  success: boolean;
  message?: string;
  error?: string;
  led_count?: number;
  brightness?: number;
  pin?: string;
}

export class LEDService {
  private baseUrl: string;
  private ledCount: number = 0;
  private currentBrightness: number = 0.5;
  private requestQueue: Promise<any> = Promise.resolve();
  private currentAnimation: string | null = null;
  private animationController: AbortController | null = null;

  constructor(host: string, port: number) {
    this.baseUrl = `http://${host}:${port}`;
    this.initializeConfig();
  }

  private async initializeConfig() {
    try {
      const config = await this.getConfig();
      if (config) {
        this.ledCount = config.led_count || 0;
        this.currentBrightness = config.brightness || 0.5;
      }
    } catch (error) {
      console.error("Failed to initialize LED config:", error);
    }
  }

  private async queueRequest<T>(operation: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.requestQueue = this.requestQueue
        .then(async () => {
          try {
            const result = await operation();
            resolve(result);
          } catch (error) {
            reject(error);
          }
        })
        .catch(() => {}); // Prevent queue from breaking
    });
  }

  private async sendDriverCommand(command: any): Promise<LEDDriverResponse> {
    return this.queueRequest(async () => {
      try {
        const response: AxiosResponse<LEDDriverResponse> = await axios.post(
          this.baseUrl,
          command,
          {
            headers: { "Content-Type": "application/json" },
            timeout: 1000, // Reduced timeout for animations
          }
        );
        return response.data;
      } catch (error) {
        console.error("LED Driver Error:", error);
        if (axios.isAxiosError(error)) {
          return {
            success: false,
            error: error.response?.data?.error || error.message,
          };
        }
        return { success: false, error: "Unknown error occurred" };
      }
    });
  }

  async getConfig(): Promise<LEDDriverResponse | null> {
    try {
      const result = await this.sendDriverCommand({ command: "get_config" });
      return result;
    } catch (error) {
      return null;
    }
  }

  async getStatus(): Promise<LEDDriverResponse | null> {
    try {
      const response = await axios.get(`${this.baseUrl}/status`);
      return response.data;
    } catch (error) {
      return null;
    }
  }

  // Basic hardware operations
  async setPixel(index: number, color: string): Promise<boolean> {
    const result = await this.sendDriverCommand({
      command: "set_pixel",
      index,
      color,
    });

    if (result.success) {
      await this.show();
    }

    return result.success;
  }

  async setPixels(pixels: PixelData[]): Promise<boolean> {
    const result = await this.sendDriverCommand({
      command: "set_pixels",
      pixels,
    });

    if (result.success) {
      await this.show();
    }

    return result.success;
  }

  private async setPixelsWithoutShow(pixels: PixelData[]): Promise<boolean> {
    const result = await this.sendDriverCommand({
      command: "set_pixels",
      pixels,
    });
    return result.success;
  }

  async show(): Promise<boolean> {
    const result = await this.sendDriverCommand({ command: "show" });
    return result.success;
  }

  async setBrightness(brightness: number): Promise<boolean> {
    const result = await this.sendDriverCommand({
      command: "set_brightness",
      brightness: Math.max(0, Math.min(1, brightness)),
    });

    if (result.success) {
      this.currentBrightness = brightness;
      await this.show();
    }

    return result.success;
  }

  // Animation control
  private stopCurrentAnimation() {
    if (this.animationController) {
      this.animationController.abort();
    }
    this.currentAnimation = null;
  }

  private checkAnimationAborted(): boolean {
    return this.animationController?.signal.aborted || false;
  }

  // High-level logic operations
  async clear(): Promise<boolean> {
    const config = await this.getConfig();
    if (!config || !config.led_count) return false;

    const pixels: PixelData[] = [];
    for (let i = 0; i < config.led_count; i++) {
      pixels.push({ index: i, color: "#000000" });
    }

    return await this.setPixels(pixels);
  }

  async fillAll(color: string): Promise<boolean> {
    const config = await this.getConfig();
    if (!config || !config.led_count) return false;

    const pixels: PixelData[] = [];
    for (let i = 0; i < config.led_count; i++) {
      pixels.push({ index: i, color });
    }

    return await this.setPixels(pixels);
  }

  async setRange(start: number, end: number, color: string): Promise<boolean> {
    const config = await this.getConfig();
    if (!config || !config.led_count) return false;

    const pixels: PixelData[] = [];
    const safeStart = Math.max(0, start);
    const safeEnd = Math.min(config.led_count, end);

    for (let i = safeStart; i < safeEnd; i++) {
      pixels.push({ index: i, color });
    }

    return await this.setPixels(pixels);
  }

  async setPattern(pattern: PixelData[]): Promise<boolean> {
    const config = await this.getConfig();
    if (!config || !config.led_count) return false;

    // Filter out invalid indices
    const validPattern = pattern.filter(
      (p) => p.index >= 0 && p.index < config.led_count!
    );

    return await this.setPixels(validPattern);
  }

  // Advanced effects
  async rainbow(delay: number = 100): Promise<boolean> {
    this.stopCurrentAnimation();
    this.currentAnimation = "rainbow";
    this.animationController = new AbortController();

    try {
      const config = await this.getConfig();
      if (!config || !config.led_count) return false;

      const colors = [
        "#FF0000",
        "#FF7F00",
        "#FFFF00",
        "#00FF00",
        "#0000FF",
        "#4B0082",
        "#9400D3",
      ];

      for (const color of colors) {
        if (this.checkAnimationAborted()) break;

        await this.fillAll(color);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }

      return true;
    } finally {
      this.currentAnimation = null;
      this.animationController = null;
    }
  }

  async wave(color: string, delay: number = 50): Promise<boolean> {
    this.stopCurrentAnimation();
    this.currentAnimation = "wave";
    this.animationController = new AbortController();

    try {
      const config = await this.getConfig();
      if (!config || !config.led_count) return false;

      for (let i = 0; i < config.led_count; i++) {
        if (this.checkAnimationAborted()) break;

        // Create all pixels array
        const pixels: PixelData[] = [];
        for (let j = 0; j < config.led_count; j++) {
          pixels.push({
            index: j,
            color: j === i ? color : "#000000",
          });
        }

        await this.setPixelsWithoutShow(pixels);
        await this.show();
        await new Promise((resolve) => setTimeout(resolve, delay));
      }

      return true;
    } finally {
      this.currentAnimation = null;
      this.animationController = null;
    }
  }

  async breathe(color: string, duration: number = 2000): Promise<boolean> {
    this.stopCurrentAnimation();
    this.currentAnimation = "breathe";
    this.animationController = new AbortController();

    try {
      const steps = 50;
      const stepDelay = duration / (steps * 2);

      // Fade in
      for (let i = 0; i <= steps; i++) {
        if (this.checkAnimationAborted()) break;

        const brightness = i / steps;
        await this.setBrightness(brightness);
        await this.fillAll(color);
        await new Promise((resolve) => setTimeout(resolve, stepDelay));
      }

      // Fade out
      for (let i = steps; i >= 0; i--) {
        if (this.checkAnimationAborted()) break;

        const brightness = i / steps;
        await this.setBrightness(brightness);
        await new Promise((resolve) => setTimeout(resolve, stepDelay));
      }

      return true;
    } finally {
      this.currentAnimation = null;
      this.animationController = null;
    }
  }

  async sparkle(
    color: string,
    count: number = 5,
    duration: number = 2000
  ): Promise<boolean> {
    this.stopCurrentAnimation();
    this.currentAnimation = "sparkle";
    this.animationController = new AbortController();

    try {
      const config = await this.getConfig();
      if (!config || !config.led_count) return false;

      const endTime = Date.now() + duration;

      while (Date.now() < endTime && !this.checkAnimationAborted()) {
        // Create all pixels array
        const pixels: PixelData[] = [];

        // Set all to black first
        for (let i = 0; i < config.led_count; i++) {
          pixels.push({ index: i, color: "#000000" });
        }

        // Light up random LEDs
        for (let i = 0; i < count; i++) {
          const randomIndex = Math.floor(Math.random() * config.led_count);
          pixels[randomIndex] = { index: randomIndex, color };
        }

        await this.setPixelsWithoutShow(pixels);
        await this.show();
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      await this.clear();
      return true;
    } finally {
      this.currentAnimation = null;
      this.animationController = null;
    }
  }

  async chase(
    color: string,
    length: number = 3,
    delay: number = 100
  ): Promise<boolean> {
    this.stopCurrentAnimation();
    this.currentAnimation = "chase";
    this.animationController = new AbortController();

    try {
      const config = await this.getConfig();
      if (!config || !config.led_count) return false;

      for (let start = 0; start < config.led_count + length; start++) {
        if (this.checkAnimationAborted()) break;

        // Prepare all pixels in one go
        const pixels: PixelData[] = [];

        // Set all to black first
        for (let i = 0; i < config.led_count; i++) {
          pixels.push({ index: i, color: "#000000" });
        }

        // Then set the chase pixels
        for (let i = 0; i < length; i++) {
          const index = start + i;
          if (index < config.led_count) {
            pixels[index] = { index, color };
          }
        }

        await this.setPixelsWithoutShow(pixels);
        await this.show();
        await new Promise((resolve) => setTimeout(resolve, delay));
      }

      return true;
    } finally {
      this.currentAnimation = null;
      this.animationController = null;
    }
  }

  // Utility methods
  async fadeTransition(
    fromColor: string,
    toColor: string,
    duration: number = 1000
  ): Promise<boolean> {
    this.stopCurrentAnimation();
    this.currentAnimation = "fadeTransition";
    this.animationController = new AbortController();

    try {
      const config = await this.getConfig();
      if (!config || !config.led_count) return false;

      const steps = 50;
      const stepDelay = duration / steps;

      const fromRgb = this.hexToRgb(fromColor);
      const toRgb = this.hexToRgb(toColor);

      for (let step = 0; step <= steps; step++) {
        if (this.checkAnimationAborted()) break;

        const ratio = step / steps;
        const r = Math.round(fromRgb.r + (toRgb.r - fromRgb.r) * ratio);
        const g = Math.round(fromRgb.g + (toRgb.g - fromRgb.g) * ratio);
        const b = Math.round(fromRgb.b + (toRgb.b - fromRgb.b) * ratio);

        const interpolatedColor = this.rgbToHex(r, g, b);
        await this.fillAll(interpolatedColor);
        await new Promise((resolve) => setTimeout(resolve, stepDelay));
      }

      return true;
    } finally {
      this.currentAnimation = null;
      this.animationController = null;
    }
  }

  async infiniteChase(
    color: string,
    length: number = 3,
    delay: number = 100
  ): Promise<boolean> {
    this.stopCurrentAnimation();
    this.currentAnimation = "infiniteChase";
    this.animationController = new AbortController();

    try {
      const config = await this.getConfig();
      if (!config || !config.led_count) return false;

      while (!this.checkAnimationAborted()) {
        for (let start = 0; start < config.led_count + length; start++) {
          if (this.checkAnimationAborted()) break;

          // Prepare all pixels in one go
          const pixels: PixelData[] = [];

          // Set all to black first
          for (let i = 0; i < config.led_count; i++) {
            pixels.push({ index: i, color: "#000000" });
          }

          // Then set the chase pixels
          for (let i = 0; i < length; i++) {
            const index = start + i;
            if (index < config.led_count) {
              pixels[index] = { index, color };
            }
          }

          await this.setPixelsWithoutShow(pixels);
          await this.show();
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }

      return true;
    } finally {
      this.currentAnimation = null;
      this.animationController = null;
    }
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 0, g: 0, b: 0 };
  }

  private rgbToHex(r: number, g: number, b: number): string {
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }

  // Public method to stop any running animation
  async stopAnimation(): Promise<boolean> {
    this.stopCurrentAnimation();
    await this.clear();

    return Promise.resolve(true);
  }

  // Get current animation status
  getCurrentAnimation(): string | null {
    return this.currentAnimation;
  }
}
