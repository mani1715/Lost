import requests
import sys
import json
from datetime import datetime

class RentEaseAPITester:
    def __init__(self, base_url="http://localhost:8001"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.user_id = None
        self.listing_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_json = response.json()
                    print(f"   Response: {json.dumps(response_json, indent=2)[:200]}...")
                    return True, response_json
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_response = response.json()
                    print(f"   Error: {error_response}")
                except:
                    print(f"   Error: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_health_check(self):
        """Test API health check"""
        return self.run_test("Health Check", "GET", "api", 200)

    def test_register(self):
        """Test user registration"""
        timestamp = datetime.now().strftime('%H%M%S')
        success, response = self.run_test(
            "User Registration",
            "POST",
            "api/auth/register",
            200,
            data={
                "name": f"Test User {timestamp}",
                "email": f"testuser{timestamp}@test.com",
                "password": "testpass123"
            }
        )
        if success and 'token' in response:
            self.token = response['token']
            self.user_id = response['user']['id']
            return True
        return False

    def test_select_role(self):
        """Test role selection"""
        success, response = self.run_test(
            "Select Role (OWNER)",
            "POST",
            "api/user/select-role",
            200,
            data={"role": "OWNER"}
        )
        return success

    def test_get_me(self):
        """Test get current user"""
        return self.run_test("Get Current User", "GET", "api/user/me", 200)

    def test_create_listing(self):
        """Test creating a listing"""
        success, response = self.run_test(
            "Create Listing",
            "POST",
            "api/listings",
            200,
            data={
                "title": "Test Property",
                "type": "apartment",
                "price": 25000,
                "squareFeet": 1200,
                "facilities": ["WiFi", "Parking", "AC"],
                "addressText": "Test Location, Mumbai",
                "description": "A beautiful test property",
                "bedrooms": 2,
                "bathrooms": 2,
                "images": ["https://example.com/image1.jpg"],
                "status": "available"
            }
        )
        if success and 'listing' in response:
            self.listing_id = response['listing']['id']
            return True
        return False

    def test_get_listings(self):
        """Test getting all listings"""
        return self.run_test("Get All Listings", "GET", "api/listings", 200)

    def test_get_listings_with_status_filter(self):
        """Test getting listings with availability status filter"""
        # Test filtering by available status
        success1, _ = self.run_test("Get Available Listings", "GET", "api/listings?status=available", 200)
        
        # Test filtering by rented status  
        success2, _ = self.run_test("Get Rented Listings", "GET", "api/listings?status=rented", 200)
        
        return success1 and success2

    def test_get_single_listing(self):
        """Test getting a single listing"""
        if not self.listing_id:
            print("❌ No listing ID available for testing")
            return False
            
        return self.run_test("Get Single Listing", "GET", f"api/listings/{self.listing_id}", 200)

    def test_update_listing_status(self):
        """Test updating listing status"""
        if not self.listing_id:
            print("❌ No listing ID available for testing")
            return False
            
        success, response = self.run_test(
            "Update Listing Status to Rented",
            "PUT",
            f"api/listings/{self.listing_id}",
            200,
            data={
                "title": "Test Property",
                "type": "apartment",
                "price": 25000,
                "squareFeet": 1200,
                "facilities": ["WiFi", "Parking", "AC"],
                "addressText": "Test Location, Mumbai",
                "description": "A beautiful test property",
                "bedrooms": 2,
                "bathrooms": 2,
                "images": ["https://example.com/image1.jpg"],
                "status": "rented"  # Change status to rented
            }
        )
        return success

    def test_owner_listings(self):
        """Test getting owner's listings"""
        return self.run_test("Get Owner Listings", "GET", "api/owner/listings", 200)

def main():
    print("🚀 Starting RentEase API Tests")
    print("=" * 50)
    
    tester = RentEaseAPITester()
    
    # Test sequence
    tests = [
        ("Health Check", tester.test_health_check),
        ("User Registration", tester.test_register),
        ("Select Role", tester.test_select_role),
        ("Get Current User", tester.test_get_me),
        ("Create Listing", tester.test_create_listing),
        ("Get All Listings", tester.test_get_listings),
        ("Get Listings with Status Filter", tester.test_get_listings_with_status_filter),
        ("Get Single Listing", tester.test_get_single_listing),
        ("Update Listing Status", tester.test_update_listing_status),
        ("Get Owner Listings", tester.test_owner_listings),
    ]
    
    failed_tests = []
    
    for test_name, test_func in tests:
        try:
            success = test_func()
            if not success:
                failed_tests.append(test_name)
        except Exception as e:
            print(f"❌ {test_name} failed with exception: {e}")
            failed_tests.append(test_name)
    
    print("\n" + "=" * 50)
    print("📊 Test Results Summary:")
    print(f"Tests Run: {tester.tests_run}")
    print(f"Tests Passed: {tester.tests_passed}")
    print(f"Tests Failed: {len(failed_tests)}")
    print(f"Success Rate: {(tester.tests_passed / tester.tests_run * 100):.1f}%")
    
    if failed_tests:
        print(f"\n❌ Failed Tests: {', '.join(failed_tests)}")
        return 1
    else:
        print("\n✅ All tests passed!")
        return 0

if __name__ == "__main__":
    sys.exit(main())