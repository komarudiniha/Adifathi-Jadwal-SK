import requests
import sys
import json
from datetime import datetime

class AdifathiAPITester:
    def __init__(self, base_url="https://skmanager-1.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.created_resources = {
            'schools': [],
            'teachers': [],
            'subjects': [],
            'classes': [],
            'academic_years': [],
            'additional_tasks': []
        }

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
        print(f"   Method: {method}")
        if data:
            print(f"   Data: {json.dumps(data, indent=2)}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            print(f"   Response Status: {response.status_code}")
            
            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    if isinstance(response_data, dict) and 'id' in response_data:
                        print(f"   Response ID: {response_data['id']}")
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Error: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_authentication(self):
        """Test authentication endpoints"""
        print("\n" + "="*50)
        print("TESTING AUTHENTICATION")
        print("="*50)
        
        # Test login with correct credentials
        success, response = self.run_test(
            "Login with correct credentials",
            "POST",
            "auth/login",
            200,
            data={"username": "admin", "password": "Adifathi2020"}
        )
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            print(f"   Token received: {self.token[:20]}...")
            
            # Test /auth/me endpoint
            me_success, me_response = self.run_test(
                "Get current user info",
                "GET",
                "auth/me",
                200
            )
            
            if me_success:
                print(f"   User info: {me_response}")
            
            return True
        else:
            print("❌ Authentication failed - cannot proceed with other tests")
            return False
        
        # Test login with wrong credentials
        self.run_test(
            "Login with wrong credentials",
            "POST",
            "auth/login",
            401,
            data={"username": "admin", "password": "wrongpassword"}
        )

    def test_schools_crud(self):
        """Test school CRUD operations"""
        print("\n" + "="*50)
        print("TESTING SCHOOLS CRUD")
        print("="*50)
        
        # Create school
        school_data = {
            "name": "SMP Adifathi Jakarta",
            "npsn": "12345678",
            "address": "Jl. Merdeka No. 123, Jakarta"
        }
        
        success, response = self.run_test(
            "Create School",
            "POST",
            "schools",
            200,
            data=school_data
        )
        
        school_id = None
        if success and 'id' in response:
            school_id = response['id']
            self.created_resources['schools'].append(school_id)
            print(f"   Created school ID: {school_id}")
        
        # Get all schools
        self.run_test(
            "Get All Schools",
            "GET",
            "schools",
            200
        )
        
        # Update school
        if school_id:
            updated_data = {
                "name": "SMP Adifathi Jakarta Updated",
                "npsn": "12345678",
                "address": "Jl. Merdeka No. 123, Jakarta Selatan"
            }
            
            self.run_test(
                "Update School",
                "PUT",
                f"schools/{school_id}",
                200,
                data=updated_data
            )
        
        # Delete school (we'll keep it for integration tests)
        # if school_id:
        #     self.run_test(
        #         "Delete School",
        #         "DELETE",
        #         f"schools/{school_id}",
        #         200
        #     )

    def test_teachers_crud(self):
        """Test teacher CRUD operations"""
        print("\n" + "="*50)
        print("TESTING TEACHERS CRUD")
        print("="*50)
        
        # Create teacher
        teacher_data = {
            "name": "Budi Santoso",
            "nip_nuptk": "198505152010011001",
            "tmt": "2023-07-01",
            "education": "S1",
            "major": "Matematika"
        }
        
        success, response = self.run_test(
            "Create Teacher",
            "POST",
            "teachers",
            200,
            data=teacher_data
        )
        
        teacher_id = None
        if success and 'id' in response:
            teacher_id = response['id']
            self.created_resources['teachers'].append(teacher_id)
            print(f"   Created teacher ID: {teacher_id}")
        
        # Get all teachers
        self.run_test(
            "Get All Teachers",
            "GET",
            "teachers",
            200
        )
        
        # Update teacher
        if teacher_id:
            updated_data = {
                "name": "Budi Santoso Updated",
                "nip_nuptk": "198505152010011001",
                "tmt": "2023-07-01",
                "education": "S2",
                "major": "Matematika"
            }
            
            self.run_test(
                "Update Teacher",
                "PUT",
                f"teachers/{teacher_id}",
                200,
                data=updated_data
            )

    def test_subjects_crud(self):
        """Test subject CRUD operations"""
        print("\n" + "="*50)
        print("TESTING SUBJECTS CRUD")
        print("="*50)
        
        # Create subject
        subject_data = {
            "code": "MAT",
            "name": "Matematika",
            "time_allocation": 4
        }
        
        success, response = self.run_test(
            "Create Subject",
            "POST",
            "subjects",
            200,
            data=subject_data
        )
        
        subject_id = None
        if success and 'id' in response:
            subject_id = response['id']
            self.created_resources['subjects'].append(subject_id)
        
        # Get all subjects
        self.run_test(
            "Get All Subjects",
            "GET",
            "subjects",
            200
        )

    def test_classes_crud(self):
        """Test class CRUD operations"""
        print("\n" + "="*50)
        print("TESTING CLASSES CRUD")
        print("="*50)
        
        # Create class
        class_data = {
            "level": "VII",
            "group": "A",
            "name": "VII-A"
        }
        
        success, response = self.run_test(
            "Create Class",
            "POST",
            "classes",
            200,
            data=class_data
        )
        
        class_id = None
        if success and 'id' in response:
            class_id = response['id']
            self.created_resources['classes'].append(class_id)
        
        # Get all classes
        self.run_test(
            "Get All Classes",
            "GET",
            "classes",
            200
        )

    def test_academic_years_crud(self):
        """Test academic year CRUD operations"""
        print("\n" + "="*50)
        print("TESTING ACADEMIC YEARS CRUD")
        print("="*50)
        
        # Create academic year
        academic_year_data = {
            "school_year": "2023/2024",
            "semester": "Gasal",
            "curriculum": "Kurikulum Merdeka",
            "max_time_allocation": 40
        }
        
        success, response = self.run_test(
            "Create Academic Year",
            "POST",
            "academic-years",
            200,
            data=academic_year_data
        )
        
        academic_year_id = None
        if success and 'id' in response:
            academic_year_id = response['id']
            self.created_resources['academic_years'].append(academic_year_id)
        
        # Get all academic years
        self.run_test(
            "Get All Academic Years",
            "GET",
            "academic-years",
            200
        )

    def test_additional_tasks_crud(self):
        """Test additional task CRUD operations"""
        print("\n" + "="*50)
        print("TESTING ADDITIONAL TASKS CRUD")
        print("="*50)
        
        # Create additional task
        task_data = {
            "name": "Wali Kelas",
            "equivalent_hours": 2
        }
        
        success, response = self.run_test(
            "Create Additional Task",
            "POST",
            "additional-tasks",
            200,
            data=task_data
        )
        
        task_id = None
        if success and 'id' in response:
            task_id = response['id']
            self.created_resources['additional_tasks'].append(task_id)
        
        # Get all additional tasks
        self.run_test(
            "Get All Additional Tasks",
            "GET",
            "additional-tasks",
            200
        )

    def test_dashboard_stats(self):
        """Test dashboard statistics"""
        print("\n" + "="*50)
        print("TESTING DASHBOARD STATS")
        print("="*50)
        
        success, response = self.run_test(
            "Get Dashboard Stats",
            "GET",
            "dashboard/stats",
            200
        )
        
        if success:
            print(f"   Dashboard stats: {response}")

    def test_error_handling(self):
        """Test error handling scenarios"""
        print("\n" + "="*50)
        print("TESTING ERROR HANDLING")
        print("="*50)
        
        # Test unauthorized access (without token)
        old_token = self.token
        self.token = None
        
        self.run_test(
            "Unauthorized access to schools",
            "GET",
            "schools",
            401
        )
        
        # Restore token
        self.token = old_token
        
        # Test invalid resource ID
        self.run_test(
            "Get non-existent school",
            "PUT",
            "schools/invalid-id",
            404,
            data={"name": "Test", "npsn": "123", "address": "Test"}
        )

def main():
    print("🚀 Starting Adifathi Jadwal SK API Tests")
    print("="*60)
    
    tester = AdifathiAPITester()
    
    # Run authentication tests first
    if not tester.test_authentication():
        print("\n❌ Authentication failed - stopping tests")
        return 1
    
    # Run all CRUD tests
    tester.test_schools_crud()
    tester.test_teachers_crud()
    tester.test_subjects_crud()
    tester.test_classes_crud()
    tester.test_academic_years_crud()
    tester.test_additional_tasks_crud()
    
    # Test dashboard
    tester.test_dashboard_stats()
    
    # Test error handling
    tester.test_error_handling()
    
    # Print final results
    print("\n" + "="*60)
    print("📊 FINAL TEST RESULTS")
    print("="*60)
    print(f"Tests Run: {tester.tests_run}")
    print(f"Tests Passed: {tester.tests_passed}")
    print(f"Tests Failed: {tester.tests_run - tester.tests_passed}")
    print(f"Success Rate: {(tester.tests_passed/tester.tests_run)*100:.1f}%")
    
    if tester.created_resources['schools']:
        print(f"\nCreated Schools: {len(tester.created_resources['schools'])}")
    if tester.created_resources['teachers']:
        print(f"Created Teachers: {len(tester.created_resources['teachers'])}")
    if tester.created_resources['subjects']:
        print(f"Created Subjects: {len(tester.created_resources['subjects'])}")
    if tester.created_resources['classes']:
        print(f"Created Classes: {len(tester.created_resources['classes'])}")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())