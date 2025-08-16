# LED Controller API

A TypeScript REST API for controlling LED strips connected to a Raspberry Pi 4B. This project consists of two main components: a Python LED driver running on the Raspberry Pi and a TypeScript API server that provides advanced control and animation features.

## 🏗️ Architecture

```
┌─────────────────┐    HTTP     ┌─────────────────┐    GPIO    ┌─────────────┐
│   TypeScript    │ ─────────► │     Python      │ ─────────► │  LED Strip  │
│   API Server    │            │   LED Driver    │            │             │
│                 │            │ (Raspberry Pi)  │            │             │
└─────────────────┘            └─────────────────┘            └─────────────┘
```

### Components

1. **Python LED Driver** ([`led_controller.py`](led_controller.py))
   - Runs on Raspberry Pi 4B
   - Controls LED strip via GPIO pin D18
   - Provides HTTP server with basic LED commands
   - Handles thread-safe LED operations

2. **TypeScript API Server** ([`src/`](src/))
   - Wraps Python driver with advanced features
   - Provides REST API with comprehensive endpoints
   - Implements complex animations and effects
   - Includes Swagger documentation

## 🚀 Features

### Basic Control
- **Individual LED Control**: Set specific LEDs to any color
- **Range Control**: Set multiple LEDs at once
- **Pattern Control**: Apply complex color patterns
- **Fill Operations**: Set all LEDs to the same color
- **Brightness Control**: Adjust overall brightness (0.0 - 1.0)
- **Clear**: Turn off all LEDs

### Advanced Effects
- **Rainbow**: Cycle through rainbow colors
- **Wave**: Moving light wave effect
- **Breathe**: Smooth fade in/out effect
- **Sparkle**: Random twinkling lights
- **Chase**: Moving chase light pattern
- **Fade Transition**: Smooth color transitions
- **Infinite Chase**: Continuous chase effect

### API Features
- RESTful API endpoints
- Interactive Swagger documentation
- CORS support for web applications
- Health check endpoints
- Real-time status monitoring

## 🛠️ Hardware Setup

### Requirements
- Raspberry Pi 4B
- NeoPixel LED strip (WS2812B/WS2811)
- Appropriate power supply for LED strip
- Jumper wires

### Wiring
```
Raspberry Pi 4B    →    LED Strip
GPIO 18 (Pin 12)   →    Data Input
5V (Pin 2)         →    Power (+5V)
Ground (Pin 6)     →    Ground (GND)
```

### LED Configuration
The default configuration in [`led_controller.py`](led_controller.py):
```python
LED_COUNT = 10        # Number of LEDs
LED_PIN = board.D18   # GPIO pin
LED_ORDER = neopixel.GRB
```

## 📦 Installation

### Raspberry Pi Setup

1. **Install Python dependencies:**
```bash
pip install board neopixel
```

2. **Run the LED driver:**
```bash
python led_controller.py
```

The Python server will start on port 8080.

### API Server Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with your Raspberry Pi IP address
```

3. **Run in development:**
```bash
npm run dev
```

4. **Build and run production:**
```bash
npm run build
npm start
```

## 🔧 Configuration

### Environment Variables
```bash
PORT=3000                          # API server port
RASPBERRY_PI_HOST=127.0.0.1  # Raspberry Pi IP address
RASPBERRY_PI_PORT=8080             # Python driver port
NODE_ENV=development               # Environment
```

### Hardware Configuration
Modify [`led_controller.py`](led_controller.py) for your setup:
```python
LED_COUNT = 10        # Change to your LED count
LED_PIN = board.D18   # Change GPIO pin if needed
```

## 📚 API Documentation

Start the server and visit: `http://localhost:3000/api-docs`

### Key Endpoints

#### Basic Control
- `POST /api/led/set` - Set individual LED
- `POST /api/led/range` - Set LED range
- `POST /api/led/fill` - Fill all LEDs
- `POST /api/led/clear` - Clear all LEDs
- `POST /api/led/brightness` - Set brightness

#### Effects
- `POST /api/led/effects/rainbow` - Rainbow effect
- `POST /api/led/effects/wave` - Wave effect
- `POST /api/led/effects/breathe` - Breathing effect
- `POST /api/led/effects/sparkle` - Sparkle effect
- `POST /api/led/effects/chase` - Chase effect
- `POST /api/led/effects/stop` - Stop all effects

#### Status
- `GET /api/led/status` - Get LED system status
- `GET /api/led/config` - Get LED configuration
- `GET /health` - API health check

### Example Usage

**Set LED to red:**
```bash
curl -X POST http://localhost:3000/api/led/set \
  -H "Content-Type: application/json" \
  -d '{"index": 0, "color": "#FF0000"}'
```

**Run rainbow effect:**
```bash
curl -X POST http://localhost:3000/api/led/effects/rainbow \
  -H "Content-Type: application/json" \
  -d '{"delay": 100}'
```

## 🏃‍♂️ Development

### Project Structure
```
led_controller_api/
├── src/
│   ├── config/           # Swagger configuration
│   ├── controllers/      # Express route controllers
│   ├── routes/          # API route definitions
│   ├── services/        # LED service logic
│   ├── types/           # TypeScript type definitions
│   └── index.ts         # Main application entry
├── led_controller.py    # Python LED driver
├── package.json
├── tsconfig.json
└── README.md
```

### Type Definitions
See [`src/types/led.types.ts`](src/types/led.types.ts) for complete type definitions including:
- `LEDPattern` - LED color patterns
- `LEDResponse` - API responses
- `LEDCommand` - Hardware commands
- Request/Response interfaces

### Services
The [`LEDService`](src/services/ledService.ts) class handles:
- Communication with Python driver
- Animation management
- Request queuing for thread safety
- Color utilities and effects

## 🔍 Troubleshooting

### Common Issues

1. **Cannot connect to Raspberry Pi:**
   - Check IP address in `.env` file
   - Ensure Python driver is running
   - Verify network connectivity

2. **LEDs not responding:**
   - Check wiring connections
   - Verify GPIO permissions on Pi
   - Check power supply capacity

3. **Permission errors on Raspberry Pi:**
   ```bash
   sudo python led_controller.py
   ```

### Debugging
- Check API logs for connection errors
- Use `/health` endpoint to verify connectivity
- Monitor Python driver output for hardware issues