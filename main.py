"""Application entrypoint (API only).

This Flask app exposes only JSON endpoints via the registered blueprint in
``api.py``. The React SPA is served separately by Vite (dev) or any static
file server (prod build). Opening ``/`` returns lightweight API metadata.
"""

from flask import Flask, jsonify
from api import api_bp

app = Flask(__name__)
app.secret_key = 'dev-secret-change-me'  # TODO: load from environment variable
app.register_blueprint(api_bp, url_prefix='/api')

@app.get('/')
def index():
    """Return a simple capability document.

    Useful as a quick smoke‑test and human-friendly start page so users do
    not think the service is broken when visiting the root in a browser.
    """
    return jsonify({
        'app': 'Transplant Link API',
        'status': 'ok',
        'auth': {'login': '/api/auth/login', 'me': '/api/auth/me'},
        'resources': ['/api/users', '/api/donors', '/api/patients'],
        'stats': '/api/stats/summary'
    })

if __name__ == '__main__':
    app.run(debug=True)
