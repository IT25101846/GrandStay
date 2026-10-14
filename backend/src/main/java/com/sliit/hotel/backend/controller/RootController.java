package com.sliit.hotel.backend.controller;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class RootController {

    @GetMapping(value = "/", produces = MediaType.TEXT_HTML_VALUE)
    public String getRootInfo() {
        return """
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <title>Hotel Reservation API</title>
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0b0f17; color: #e2e8f0; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; }
                    .card { background: #131b2e; border: 1px solid #1e293b; border-radius: 12px; padding: 2.5rem; max-width: 600px; width: 90%; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
                    h1 { color: #d4af37; margin-top: 0; font-size: 1.8rem; }
                    p { line-height: 1.6; color: #94a3b8; }
                    .badge { background: #064e3b; color: #34d399; padding: 4px 10px; border-radius: 20px; font-size: 0.85rem; font-weight: 600; display: inline-block; margin-bottom: 1rem; }
                    .btn { display: inline-block; background: #d4af37; color: #0b0f17; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; margin-top: 1rem; transition: background 0.2s; }
                    .btn:hover { background: #e6c86e; }
                    .endpoints { background: #0f172a; border-radius: 8px; padding: 1rem; margin-top: 1.5rem; border: 1px solid #1e293b; }
                    .endpoints li { margin-bottom: 0.5rem; color: #cbd5e1; font-family: monospace; }
                </style>
            </head>
            <body>
                <div class="card">
                    <span class="badge">&#10003; Backend API Online</span>
                    <h1>Hotel Reservation System API</h1>
                    <p>The Spring Boot backend is active and connected to SQL Server database <code>hotel_db</code>.</p>
                    <p>To view the full user interface, open the React application:</p>
                    <a href="http://localhost:5173" class="btn" target="_blank">Open Web Application &rarr;</a>
                    
                    <div class="endpoints">
                        <strong>Public API Endpoints:</strong>
                        <ul>
                            <li><a href="/api/v1/venues" style="color: #60a5fa;">GET /api/v1/venues</a></li>
                            <li><a href="/api/v1/venues/available" style="color: #60a5fa;">GET /api/v1/venues/available</a></li>
                            <li><a href="/api/v1/packages" style="color: #60a5fa;">GET /api/v1/packages</a></li>
                        </ul>
                    </div>
                </div>
            </body>
            </html>
            """;
    }

    @GetMapping("/api/v1/health")
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(Map.of(
            "status", "UP",
            "service", "Hotel Reservation Backend",
            "version", "1.0.0"
        ));
    }
}
