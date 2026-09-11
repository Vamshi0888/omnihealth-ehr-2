#!/usr/bin/env python3
"""
OmniHealth EHR - High-Performance Local & Production HTTP Server
Serves the web application and provides REST APIs for records sync.
"""

import http.server
import socketserver
import os
import json
import mimetypes
import sys

# Ensure correct MIME types
mimetypes.add_type("application/javascript", ".js")
mimetypes.add_type("text/css", ".css")
mimetypes.add_type("image/png", ".png")
mimetypes.add_type("image/jpeg", ".jpg")
mimetypes.add_type("image/svg+xml", ".svg")
mimetypes.add_type("application/json", ".json")

PORT = int(os.environ.get("PORT", 8080))
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
DATA_FILE = os.path.join(DATA_DIR, "records.json")

os.makedirs(DATA_DIR, exist_ok=True)

class OmniHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def end_headers(self):
        # Enable CORS and disable aggressive caching for local dev
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        if self.path == "/api/health":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            resp = {
                "status": "healthy",
                "service": "OmniHealth EHR",
                "version": "1.0.0",
                "hospitals": ["Mayo Clinic", "Apollo Hospitals", "Johns Hopkins Medicine", "Mount Sinai"]
            }
            self.wfile.write(json.dumps(resp, indent=2).encode("utf-8"))
            return

        if self.path == "/api/records":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            if os.path.exists(DATA_FILE):
                with open(DATA_FILE, "r", encoding="utf-8") as f:
                    content = f.read()
                self.wfile.write(content.encode("utf-8"))
            else:
                self.wfile.write(b'{"status": "empty", "message": "No server saved records yet"}')
            return

        # Fallback to standard static file serving
        return super().do_GET()

    def do_POST(self):
        if self.path == "/api/records":
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length)
            try:
                parsed = json.loads(body.decode("utf-8"))
                with open(DATA_FILE, "w", encoding="utf-8") as f:
                    json.dump(parsed, f, indent=2)
                
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"success": True, "savedAt": os.path.getmtime(DATA_FILE)}).encode("utf-8"))
            except Exception as e:
                self.send_response(400)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode("utf-8"))
            return

        self.send_response(404)
        self.end_headers()

def run():
    port = PORT
    for attempt in range(5):
        try:
            handler = OmniHTTPRequestHandler
            socketserver.TCPServer.allow_reuse_address = True
            with socketserver.TCPServer(("", port), handler) as httpd:
                print(f"==================================================")
                print(f" OmniHealth EHR Live Server Running")
                print(f" Local URL: http://localhost:{port}")
                print(f" Health Check: http://localhost:{port}/api/health")
                print(f" Directory: {BASE_DIR}")
                print(f"==================================================")
                sys.stdout.flush()
                httpd.serve_forever()
        except OSError as e:
            if "Address already in use" in str(e):
                port += 1
            else:
                raise e

if __name__ == "__main__":
    run()
