import requests
import sys
import json
<<<<<<< HEAD
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
=======
import base64
from datetime import datetime
from io import BytesIO
from PIL import Image

class LostFoundAPITester:
    def __init__(self, base_url="https://findit-9.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def create_test_image(self):
        """Create a simple test image in base64 format"""
        # Create a simple colored rectangle image
        img = Image.new('RGB', (200, 150), color='red')
        buffer = BytesIO()
        img.save(buffer, format='JPEG')
        buffer.seek(0)
        return buffer.getvalue()

    def test_api_root(self):
        """Test API root endpoint"""
        try:
            response = requests.get(f"{self.api_url}/")
            success = response.status_code == 200
            details = f"Status: {response.status_code}, Response: {response.text}"
            self.log_test("API Root", success, details)
            return success
        except Exception as e:
            self.log_test("API Root", False, str(e))
            return False

    def test_get_lost_items(self):
        """Test GET /api/items/lost"""
        try:
            response = requests.get(f"{self.api_url}/items/lost")
            success = response.status_code == 200
            if success:
                data = response.json()
                details = f"Status: {response.status_code}, Items count: {len(data)}"
            else:
                details = f"Status: {response.status_code}, Response: {response.text}"
            self.log_test("GET Lost Items", success, details)
            return success, response.json() if success else []
        except Exception as e:
            self.log_test("GET Lost Items", False, str(e))
            return False, []

    def test_get_found_items(self):
        """Test GET /api/items/found"""
        try:
            response = requests.get(f"{self.api_url}/items/found")
            success = response.status_code == 200
            if success:
                data = response.json()
                details = f"Status: {response.status_code}, Items count: {len(data)}"
            else:
                details = f"Status: {response.status_code}, Response: {response.text}"
            self.log_test("GET Found Items", success, details)
            return success, response.json() if success else []
        except Exception as e:
            self.log_test("GET Found Items", False, str(e))
            return False, []

    def test_create_lost_item(self):
        """Test POST /api/items/lost"""
        try:
            # Test data
            data = {
                'title': 'Test Lost iPhone',
                'category': 'Electronics',
                'description': 'Black iPhone 15 Pro lost in Central Park',
                'location': 'Central Park, NYC',
                'date': '2024-01-15',
                'owner_name': 'John Doe',
                'owner_email': 'john@example.com',
                'owner_phone': '+1234567890'
            }
            
            # Create test image
            image_data = self.create_test_image()
            files = {'image': ('test_image.jpg', image_data, 'image/jpeg')}
            
            response = requests.post(f"{self.api_url}/items/lost", data=data, files=files)
            success = response.status_code == 200
            
            if success:
                item_data = response.json()
                details = f"Status: {response.status_code}, Item ID: {item_data.get('id', 'N/A')}"
                return success, item_data
            else:
                details = f"Status: {response.status_code}, Response: {response.text}"
                self.log_test("POST Lost Item", success, details)
                return success, None
                
        except Exception as e:
            self.log_test("POST Lost Item", False, str(e))
            return False, None

    def test_create_found_item(self):
        """Test POST /api/items/found"""
        try:
            # Test data
            data = {
                'title': 'Found iPhone',
                'category': 'Electronics',
                'description': 'Found black iPhone near the fountain',
                'location': 'Central Park, NYC',
                'date': '2024-01-16',
                'owner_name': 'Jane Smith',
                'owner_email': 'jane@example.com',
                'owner_phone': '+1987654321'
            }
            
            # Create test image
            image_data = self.create_test_image()
            files = {'image': ('test_image.jpg', image_data, 'image/jpeg')}
            
            response = requests.post(f"{self.api_url}/items/found", data=data, files=files)
            success = response.status_code == 200
            
            if success:
                item_data = response.json()
                details = f"Status: {response.status_code}, Item ID: {item_data.get('id', 'N/A')}"
                return success, item_data
            else:
                details = f"Status: {response.status_code}, Response: {response.text}"
                self.log_test("POST Found Item", success, details)
                return success, None
                
        except Exception as e:
            self.log_test("POST Found Item", False, str(e))
            return False, None

    def test_get_item_by_id(self, item_id):
        """Test GET /api/items/{item_id}"""
        try:
            response = requests.get(f"{self.api_url}/items/{item_id}")
            success = response.status_code == 200
            if success:
                details = f"Status: {response.status_code}, Item retrieved successfully"
            else:
                details = f"Status: {response.status_code}, Response: {response.text}"
            self.log_test("GET Item by ID", success, details)
            return success
        except Exception as e:
            self.log_test("GET Item by ID", False, str(e))
            return False

    def test_delete_item(self, item_id):
        """Test DELETE /api/items/{item_id}"""
        try:
            response = requests.delete(f"{self.api_url}/items/{item_id}")
            success = response.status_code == 200
            if success:
                details = f"Status: {response.status_code}, Item deleted successfully"
            else:
                details = f"Status: {response.status_code}, Response: {response.text}"
            self.log_test("DELETE Item", success, details)
            return success
        except Exception as e:
            self.log_test("DELETE Item", False, str(e))
            return False

    def test_create_item_without_image(self):
        """Test creating item without image"""
        try:
            data = {
                'title': 'Test Lost Wallet',
                'category': 'Accessories',
                'description': 'Brown leather wallet',
                'location': 'Times Square',
                'date': '2024-01-17',
                'owner_name': 'Bob Wilson',
                'owner_email': 'bob@example.com'
            }
            
            response = requests.post(f"{self.api_url}/items/lost", data=data)
            success = response.status_code == 200
            
            if success:
                item_data = response.json()
                details = f"Status: {response.status_code}, Item ID: {item_data.get('id', 'N/A')}"
                return success, item_data
            else:
                details = f"Status: {response.status_code}, Response: {response.text}"
                self.log_test("POST Item Without Image", success, details)
                return success, None
                
        except Exception as e:
            self.log_test("POST Item Without Image", False, str(e))
            return False, None

    def run_all_tests(self):
        """Run comprehensive API tests"""
        print("🚀 Starting Lost & Found API Tests...")
        print("=" * 50)
        
        # Test basic endpoints
        if not self.test_api_root():
            print("❌ API Root failed - stopping tests")
            return False
            
        # Test GET endpoints
        self.test_get_lost_items()
        self.test_get_found_items()
        
        # Test POST endpoints with image
        lost_success, lost_item = self.test_create_lost_item()
        if lost_success and lost_item:
            self.log_test("POST Lost Item", True, f"Item ID: {lost_item.get('id')}")
            
            # Test GET by ID
            self.test_get_item_by_id(lost_item['id'])
            
            # Test DELETE
            self.test_delete_item(lost_item['id'])
        
        found_success, found_item = self.test_create_found_item()
        if found_success and found_item:
            self.log_test("POST Found Item", True, f"Item ID: {found_item.get('id')}")
        
        # Test POST without image
        no_image_success, no_image_item = self.test_create_item_without_image()
        if no_image_success and no_image_item:
            self.log_test("POST Item Without Image", True, f"Item ID: {no_image_item.get('id')}")
        
        # Print summary
        print("\n" + "=" * 50)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return True
        else:
            print("⚠️  Some tests failed")
            return False

def main():
    tester = LostFoundAPITester()
    success = tester.run_all_tests()
    
    # Save detailed results
    with open('/app/backend_test_results.json', 'w') as f:
        json.dump({
            'timestamp': datetime.now().isoformat(),
            'total_tests': tester.tests_run,
            'passed_tests': tester.tests_passed,
            'success_rate': f"{(tester.tests_passed/tester.tests_run)*100:.1f}%" if tester.tests_run > 0 else "0%",
            'results': tester.test_results
        }, f, indent=2)
    
    return 0 if success else 1
>>>>>>> e17768b1f796c0c35dcd889004bc97173ab086fc

if __name__ == "__main__":
    sys.exit(main())