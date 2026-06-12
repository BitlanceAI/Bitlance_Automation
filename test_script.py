import requests

url = "http://localhost:8001/api/blog/generate"
# Let's bypass auth in our test script by setting the auth header to a valid key or we temporarily disable it in auth_middleware.py
