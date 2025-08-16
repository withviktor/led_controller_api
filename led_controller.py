import board
import neopixel
from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import time
import threading
from queue import Queue, Empty
import signal
import sys

# LED Configuration
LED_COUNT = 10
LED_PIN = board.D18
LED_ORDER = neopixel.GRB

# Initialize LED strip
pixels = neopixel.NeoPixel(
    LED_PIN, LED_COUNT, brightness=0.5, auto_write=False, pixel_order=LED_ORDER
)

def hex_to_rgb(hex_color):
    """Convert hex color to RGB tuple"""
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

class LEDDriverHandler(BaseHTTPRequestHandler):
    # Thread-safe LED operations
    _led_lock = threading.Lock()
    _command_queue = Queue()
    _processing_thread = None
    _shutdown_flag = threading.Event()
    
    @classmethod
    def start_processing_thread(cls):
        """Start the LED command processing thread"""
        if cls._processing_thread is None or not cls._processing_thread.is_alive():
            cls._processing_thread = threading.Thread(
                target=cls._process_commands, 
                daemon=True
            )
            cls._processing_thread.start()
    
    @classmethod
    def _process_commands(cls):
        """Process LED commands in a separate thread"""
        while not cls._shutdown_flag.is_set():
            try:
                # Get command with timeout
                command_data = cls._command_queue.get(timeout=0.1)
                
                with cls._led_lock:
                    try:
                        cls._execute_led_command(command_data)
                    except Exception as e:
                        print(f"Error executing LED command: {e}")
                    finally:
                        cls._command_queue.task_done()
                        
            except Empty:
                continue
            except Exception as e:
                print(f"Error in command processing thread: {e}")
    
    @classmethod
    def _execute_led_command(cls, command_data):
        """Execute a single LED command"""
        command = command_data['command']
        data = command_data['data']
        
        if command == 'set_pixel':
            index = data.get('index')
            color = data.get('color', '#000000')
            
            if index is not None and 0 <= index < LED_COUNT:
                pixels[index] = hex_to_rgb(color)
                
        elif command == 'set_pixels':
            pixel_data = data.get('pixels', [])
            for pixel in pixel_data:
                index = pixel.get('index')
                color = pixel.get('color', '#000000')
                if index is not None and 0 <= index < LED_COUNT:
                    pixels[index] = hex_to_rgb(color)
                    
        elif command == 'show':
            pixels.show()
            
        elif command == 'set_brightness':
            brightness = data.get('brightness', 0.5)
            brightness = max(0.0, min(1.0, brightness))
            pixels.brightness = brightness
    
    @classmethod
    def shutdown_processing(cls):
        """Shutdown the processing thread"""
        cls._shutdown_flag.set()
        if cls._processing_thread and cls._processing_thread.is_alive():
            cls._processing_thread.join(timeout=1.0)

    def _send_cors_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')

    def do_OPTIONS(self):
        self.send_response(200)
        self._send_cors_headers()
        self.end_headers()

    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length)
        
        try:
            data = json.loads(post_data.decode('utf-8'))
            command = data.get('command')
            response = {'success': True}
            
            if command in ['set_pixel', 'set_pixels', 'show', 'set_brightness']:
                # Queue the command for processing
                command_data = {
                    'command': command,
                    'data': data
                }
                self._command_queue.put(command_data)
                
                if command == 'set_pixel':
                    response['message'] = f"Queued set pixel {data.get('index')} to {data.get('color')}"
                elif command == 'set_pixels':
                    response['message'] = f"Queued set {len(data.get('pixels', []))} pixels"
                elif command == 'show':
                    response['message'] = "Queued LED update"
                elif command == 'set_brightness':
                    response['message'] = f"Queued brightness to {data.get('brightness')}"
                    
            elif command == 'get_config':
                # Return hardware configuration immediately
                with self._led_lock:
                    response.update({
                        'led_count': LED_COUNT,
                        'brightness': pixels.brightness,
                        'pin': str(LED_PIN),
                    })
                    
            else:
                raise ValueError(f"Unknown command: {command}")
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self._send_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps(response).encode())
            
        except Exception as e:
            error_response = {'success': False, 'error': str(e)}
            self.send_response(400)
            self.send_header('Content-type', 'application/json')
            self._send_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps(error_response).encode())

    def do_GET(self):
        if self.path == '/status':
            with self._led_lock:
                status = {
                    'success': True,
                    'led_count': LED_COUNT,
                    'brightness': pixels.brightness,
                    'pin': str(LED_PIN),
                    'queue_size': self._command_queue.qsize(),
                    'message': 'LED Driver is running'
                }
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self._send_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps(status).encode())
        else:
            self.send_response(404)
            self.end_headers()

    def log_message(self, format, *args):
        print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] {format % args}")

def signal_handler(sig, frame):
    """Handle shutdown signals"""
    print("\nShutting down LED Driver...")
    LEDDriverHandler.shutdown_processing()
    
    # Turn off all LEDs
    with LEDDriverHandler._led_lock:
        pixels.fill((0, 0, 0))
        pixels.show()
    
    sys.exit(0)

if __name__ == '__main__':
    # Set up signal handlers
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    PORT = 8080
    
    # Start the LED processing thread
    LEDDriverHandler.start_processing_thread()
    
    server = HTTPServer(('0.0.0.0', PORT), LEDDriverHandler)
    print(f"LED Driver running on port {PORT}")
    print(f"Hardware: {LED_COUNT} LEDs on pin {LED_PIN}")
    print("Press Ctrl+C to shutdown")
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        signal_handler(signal.SIGINT, None)
    finally:
        LEDDriverHandler.shutdown_processing()
        server.shutdown()