import requests
import pytest

def test_get_user_info():
    # API endpoint
    base_url = "https://api.lovdata.no"
    endpoint = "/v1/structuredRules/list"
    
    # Make the GET request
    headers = {
       "X-API-Key": "mbtbr06z899g9j4z"
   }
    response = requests.get(f"{base_url}{endpoint}", headers=headers)
    
    # Assert successful response
    # Print the response
    print(response.status_code)
    if response.status_code == 200:
        print("Response:", response.text)
    else:
        print(f"Error: {response.status_code}", response.text)

def test_get_structured_rules_list():
    # API endpoint
    base_url = "https://api.lovdata.no"
    endpoint = "/v1/structuredRules/list"
    
    # Make the GET request
    headers = {
        "X-API-Key": "mbtbr06z899g9j4z",
        "Accept": "application/json"  # Explicitly request JSON response
    }
    response = requests.get(f"{base_url}{endpoint}", headers=headers)
    
    # Print the response details
    print(f"Status Code: {response.status_code}")
    print(f"Content-Type: {response.headers.get('Content-Type', 'Not specified')}")
    print(f"Raw Response: {response.text[:200]}...")  # Print first 200 chars of response
    
    # Try to parse as JSON if possible
    if response.status_code == 200:
        try:
            data = response.json()
            print("\nLegal Sources:")
            for base in data.get('bases', []):
                print(f"\nBase: {base.get('base')}")
                print(f"Description: {base.get('description')}")
        except requests.exceptions.JSONDecodeError:
            print("\nCould not parse response as JSON. Raw response:")
            print(response.text)
    else:
        print(f"Error: {response.status_code}", response.text)

# test_get_user_info()
test_get_structured_rules_list()