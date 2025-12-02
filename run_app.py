import webbrowser
import os
from main import app

PORT = int(os.environ.get('PORT', 3000))

if __name__ == '__main__':
    print(f"Server running at http://localhost:{PORT}")
    print("Press Ctrl+C to stop the server")
    if os.environ.get('PORT') is None:
        webbrowser.open(f'http://localhost:{PORT}')
    app.run(host='0.0.0.0', port=PORT, debug=False)
