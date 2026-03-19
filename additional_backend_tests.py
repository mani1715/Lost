#!/usr/bin/env python3
"""
Additional backend tests for edge cases and validation
"""

import requests
import json
import sys

class AdditionalAPITests:
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

    def test_data_validation(self):
        """Test data validation with missing required fields"""
        try:
            # Test with missing required fields
            incomplete_data = {
                'title': 'Test Item',
                # Missing category, description, location, date, owner_name, owner_email
            }
            
            response = requests.post(f"{self.api_url}/items/lost", data=incomplete_data)
            # Should fail validation
            success = response.status_code == 422  # FastAPI validation error
            details = f"Status: {response.status_code}, Expected validation error for missing fields"
            self.log_test("Data Validation - Missing Fields", success, details)
            return success
        except Exception as e:
            self.log_test("Data Validation - Missing Fields", False, str(e))
            return False

    def test_invalid_email_validation(self):
        """Test email validation"""
        try:
            data = {
                'title': 'Test Invalid Email',
                'category': 'Test',
                'description': 'Test description',
                'location': 'Test location',
                'date': '2024-01-01',
                'owner_name': 'Test User',
                'owner_email': 'invalid-email',  # Invalid email format
            }
            
            response = requests.post(f"{self.api_url}/items/lost", data=data)
            # Check if validation error message is present regardless of status code
            response_text = response.text
            has_validation_error = "validation error" in response_text.lower() and "email" in response_text.lower()
            
            success = has_validation_error
            details = f"Status: {response.status_code}, Validation error detected: {has_validation_error}"
            self.log_test("Email Validation", success, details)
            return success
        except Exception as e:
            self.log_test("Email Validation", False, str(e))
            return False

    def test_nonexistent_item_get(self):
        """Test GET for non-existent item"""
        try:
            fake_id = "non-existent-item-id"
            response = requests.get(f"{self.api_url}/items/{fake_id}")
            success = response.status_code == 404
            details = f"Status: {response.status_code}, Expected 404 for non-existent item"
            self.log_test("GET Non-existent Item", success, details)
            return success
        except Exception as e:
            self.log_test("GET Non-existent Item", False, str(e))
            return False

    def test_nonexistent_item_delete(self):
        """Test DELETE for non-existent item"""
        try:
            fake_id = "non-existent-item-id"
            response = requests.delete(f"{self.api_url}/items/{fake_id}")
            # Should succeed silently for non-existent item (Firestore behavior)
            success = response.status_code == 200
            details = f"Status: {response.status_code}, Firestore deletes succeed even for non-existent items"
            self.log_test("DELETE Non-existent Item", success, details)
            return success
        except Exception as e:
            self.log_test("DELETE Non-existent Item", False, str(e))
            return False

    def test_response_structure(self):
        """Test that API responses have correct structure"""
        try:
            # Create a test item and verify response structure
            data = {
                'title': 'Structure Test Item',
                'category': 'Test',
                'description': 'Testing response structure',
                'location': 'Test location',
                'date': '2024-01-01',
                'owner_name': 'Test User',
                'owner_email': 'test@example.com',
            }
            
            response = requests.post(f"{self.api_url}/items/lost", data=data)
            if response.status_code != 200:
                self.log_test("Response Structure", False, f"Failed to create test item: {response.status_code}")
                return False
            
            item_data = response.json()
            
            # Check required fields in response
            required_fields = ['id', 'title', 'type', 'category', 'description', 'location', 
                             'date', 'owner_name', 'owner_email', 'status', 'created_at']
            
            missing_fields = [field for field in required_fields if field not in item_data]
            
            success = len(missing_fields) == 0
            details = f"Missing fields: {missing_fields}" if missing_fields else "All required fields present"
            self.log_test("Response Structure", success, details)
            
            # Clean up - delete the test item
            if success:
                requests.delete(f"{self.api_url}/items/{item_data['id']}")
            
            return success
        except Exception as e:
            self.log_test("Response Structure", False, str(e))
            return False

    def test_cors_headers(self):
        """Test CORS headers are present"""
        try:
            # Use GET request with Origin header to check CORS
            headers = {'Origin': 'http://example.com'}
            response = requests.get(f"{self.api_url}/", headers=headers)
            cors_headers_present = 'access-control-allow-origin' in [h.lower() for h in response.headers.keys()]
            success = cors_headers_present
            details = f"CORS headers present: {cors_headers_present}, Access-Control-Allow-Origin: {response.headers.get('Access-Control-Allow-Origin', 'Not found')}"
            self.log_test("CORS Headers", success, details)
            return success
        except Exception as e:
            self.log_test("CORS Headers", False, str(e))
            return False

    def run_additional_tests(self):
        """Run all additional validation tests"""
        print("🔍 Starting Additional Validation Tests...")
        print("=" * 50)
        
        self.test_data_validation()
        self.test_invalid_email_validation()
        self.test_nonexistent_item_get()
        self.test_nonexistent_item_delete()
        self.test_response_structure()
        self.test_cors_headers()
        
        # Print summary
        print("\n" + "=" * 50)
        print(f"📊 Additional Tests Summary: {self.tests_passed}/{self.tests_run} tests passed")
        
        return self.tests_passed == self.tests_run

def main():
    tester = AdditionalAPITests()
    success = tester.run_additional_tests()
    
    # Save detailed results
    with open('/app/additional_test_results.json', 'w') as f:
        json.dump({
            'total_tests': tester.tests_run,
            'passed_tests': tester.tests_passed,
            'success_rate': f"{(tester.tests_passed/tester.tests_run)*100:.1f}%" if tester.tests_run > 0 else "0%",
            'results': tester.test_results
        }, f, indent=2)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())