import requests

url = "http://localhost:8001/api/v1/seo/generate"
# We don't have an API key, so if it fails with 401, we will know.
payload = {
  "audience": "Property Investors and First-time Homebuyers",
  "image_option": "auto",
  "industry": "Real Estate",
  "keywords": "Pune real estate, property investment Pune, best places to invest in Pune",
  "language": "English",
  "length": "Medium (500-1000 words)",
  "style": "Professional and Data-driven",
  "topic": "Why Pune is the Best City for Real Estate Investment in 2026",
  "company_name": "Pune Horizon Realtors",
  "brand_context_data": {
    "company_overview": "We are a boutique real estate consultancy in Pune operating since 2015, specializing in high-yield pre-leased commercial properties and premium residential complexes.",
    "unique_selling_proposition": "We provide access to off-market inventory in Koregaon Park and Kalyani Nagar that isn't listed anywhere online."
  }
}

response = requests.post(url, json=payload)
print(f"Status Code: {response.status_code}")
print(f"Response: {response.text}")
