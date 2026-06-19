import requests
from requests.auth import HTTPBasicAuth

# Razorpay credentials
KEY_ID = "rzp_live_T3SvY8NjuZoIUd"
KEY_SECRET = "bsxmo2VYs096qguHVb8E26oR" 

url = "https://api.razorpay.com/v1/orders"

# Razorpay amounts are in "paise". 50000 paise = 500 INR
payload = {
    "amount": 50000, 
    "currency": "INR",
    "receipt": "test_receipt_001"
}

print("Creating Razorpay Test Order...")
response = requests.post(
    url,
    json=payload,
    auth=HTTPBasicAuth(KEY_ID, KEY_SECRET)
)

if response.status_code == 200:
    data = response.json()
    print("\n✅ SUCCESS! Order created.")
    print(f"Order ID: {data.get('id')}")
    print("\nIn the real app, we pass this Order ID to the frontend to open the Razorpay checkout!")
else:
    print("\n❌ FAILED!")
    print(f"Status Code: {response.status_code}")
    print(response.json())
