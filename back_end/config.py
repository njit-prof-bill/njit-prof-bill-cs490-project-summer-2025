import os

# Where the uploaded files should be stored
UPLOAD_FOLDER = 'uploads'

# Create the folder if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Allowed file extensions for upload
ALLOWED_EXTENSIONS = {'pdf', 'docx', 'txt', 'md', 'odt'}