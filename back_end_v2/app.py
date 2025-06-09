from flask import Flask
from flask_cors import CORS

from config import UPLOAD_FOLDER
from routes.upload import upload_bp

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Connect frontend with backend
CORS(app)

# Register Blueprints
app.register_blueprint(upload_bp)

if __name__ == '__main__':
    app.run(debug=True)