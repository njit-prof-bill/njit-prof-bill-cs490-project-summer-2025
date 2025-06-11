from flask import Flask
from flask_cors import CORS
from routes.upload import upload_bp

app = Flask(__name__)
CORS(app)

app.register_blueprint(upload_bp)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)