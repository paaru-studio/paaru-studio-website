#!/usr/bin/env python3
"""
Test Cloudinary authentication
"""

import os
import requests
from dotenv import load_dotenv

load_dotenv()

cloud_name = os.getenv('CLOUDINARY_CLOUD_NAME')
api_key = os.getenv('CLOUDINARY_API_KEY')
api_secret = os.getenv('CLOUDINARY_API_SECRET')

print(f"Cloud Name: {cloud_name}")
print(f"API Key: {api_key}")
print(f"API Secret: {api_secret[:10]}...")

# Test authenticated endpoint
url = f"https://api.cloudinary.com/v1_1/{cloud_name}/resources/image?max_results=1"
response = requests.get(url, auth=(api_key, api_secret))

print(f"\nStatus Code: {response.status_code}")
print(f"Response: {response.json() if response.ok else response.text}")
