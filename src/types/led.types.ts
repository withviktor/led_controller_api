export interface LEDPattern {
  index: number;
  color: string;
}

export interface LEDResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface LEDStatus {
  success: boolean;
  led_count: number;
  brightness: number;
  message: string;
}

export interface LEDCommand {
  command: string;
  index?: number;
  color?: string;
  start?: number;
  end?: number;
  pattern?: LEDPattern[];
  brightness?: number;
}

export interface LEDSetRequest {
  index: number;
  color: string;
}

export interface LEDRangeRequest {
  start: number;
  end: number;
  color: string;
}

export interface LEDPatternRequest {
  pattern: LEDPattern[];
}

export interface LEDBrightnessRequest {
  brightness: number;
}

export interface LEDFillRequest {
  color: string;
}