from flask import Flask
from config import UPLOAD_FOLDER
from routes.upload import upload_bp

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Register Blueprints
app.register_blueprint(upload_bp)

if __name__ == '__main__':
    app.run(debug=True)