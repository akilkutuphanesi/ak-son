import os
import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv

# .env dosyasını oku (zaten database.py'de varsa bu satırı atlayabilirsin)
load_dotenv()

# Cloudinary Yapılandırması
cloudinary.config( 
  cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME"), 
  api_key = os.getenv("CLOUDINARY_API_KEY"), 
  api_secret = os.getenv("CLOUDINARY_API_SECRET"),
  secure = True
)