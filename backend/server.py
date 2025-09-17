from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import jwt
from passlib.context import CryptContext

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="Adifathi Jadwal SK API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security
SECRET_KEY = "adifathi_secret_key_2020"
ALGORITHM = "HS256"
security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Authentication Models
class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    name: str
    role: str = "admin"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# School Data Models
class School(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    npsn: str
    address: str
    principal: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Teacher(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    nip_nuptk: str
    tmt: str  # Tanggal Mulai Tugas
    education: str
    major: str  # Jurusan
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Subject(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    code: str
    name: str
    time_allocation: int  # JP (Jam Pelajaran)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Class(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    level: str  # VII, VIII, IX
    group: str  # A, B, C, etc
    name: str
    homeroom_teacher: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AcademicYear(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    school_year: str  # 2023/2024
    semester: str  # Gasal/Genap
    curriculum: str  # Kurikulum 2013, Kurikulum Merdeka, etc
    max_time_allocation: int  # JP
    is_active: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AdditionalTask(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    equivalent_hours: int  # JP equivalent
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Create Request Models
class SchoolCreate(BaseModel):
    name: str
    npsn: str
    address: str

class TeacherCreate(BaseModel):
    name: str
    nip_nuptk: str
    tmt: str
    education: str
    major: str

class SubjectCreate(BaseModel):
    code: str
    name: str
    time_allocation: int

class ClassCreate(BaseModel):
    level: str
    group: str
    name: str

class AcademicYearCreate(BaseModel):
    school_year: str
    semester: str
    curriculum: str
    max_time_allocation: int

class AdditionalTaskCreate(BaseModel):
    name: str
    equivalent_hours: int

# Authentication Functions
def create_access_token(data: dict):
    return jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        return payload
    except jwt.PyJWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

# Authentication Routes
@api_router.post("/auth/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    # Simple hardcoded authentication
    if request.username == "admin" and request.password == "Adifathi2020":
        token_data = {"sub": request.username, "role": "admin"}
        access_token = create_access_token(token_data)
        
        user_data = {
            "id": str(uuid.uuid4()),
            "username": "admin",
            "name": "Administrator",
            "role": "admin"
        }
        
        return LoginResponse(
            access_token=access_token,
            user=user_data
        )
    else:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Username atau password salah"
        )

@api_router.get("/auth/me")
async def get_current_user(token_data: dict = Depends(verify_token)):
    return {
        "username": token_data.get("sub"),
        "role": token_data.get("role"),
        "name": "Administrator"
    }

# School Routes
@api_router.post("/schools", response_model=School)
async def create_school(school: SchoolCreate, token_data: dict = Depends(verify_token)):
    school_dict = school.dict()
    school_obj = School(**school_dict)
    await db.schools.insert_one(school_obj.dict())
    return school_obj

@api_router.get("/schools", response_model=List[School])
async def get_schools(token_data: dict = Depends(verify_token)):
    schools = await db.schools.find().to_list(1000)
    return [School(**school) for school in schools]

@api_router.put("/schools/{school_id}", response_model=School)
async def update_school(school_id: str, school: SchoolCreate, token_data: dict = Depends(verify_token)):
    school_dict = school.dict()
    await db.schools.update_one({"id": school_id}, {"$set": school_dict})
    updated_school = await db.schools.find_one({"id": school_id})
    if not updated_school:
        raise HTTPException(status_code=404, detail="School not found")
    return School(**updated_school)

@api_router.delete("/schools/{school_id}")
async def delete_school(school_id: str, token_data: dict = Depends(verify_token)):
    result = await db.schools.delete_one({"id": school_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="School not found")
    return {"message": "School deleted successfully"}

# Teacher Routes
@api_router.post("/teachers", response_model=Teacher)
async def create_teacher(teacher: TeacherCreate, token_data: dict = Depends(verify_token)):
    teacher_dict = teacher.dict()
    teacher_obj = Teacher(**teacher_dict)
    await db.teachers.insert_one(teacher_obj.dict())
    return teacher_obj

@api_router.get("/teachers", response_model=List[Teacher])
async def get_teachers(token_data: dict = Depends(verify_token)):
    teachers = await db.teachers.find().to_list(1000)
    return [Teacher(**teacher) for teacher in teachers]

@api_router.put("/teachers/{teacher_id}", response_model=Teacher)
async def update_teacher(teacher_id: str, teacher: TeacherCreate, token_data: dict = Depends(verify_token)):
    teacher_dict = teacher.dict()
    await db.teachers.update_one({"id": teacher_id}, {"$set": teacher_dict})
    updated_teacher = await db.teachers.find_one({"id": teacher_id})
    if not updated_teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    return Teacher(**updated_teacher)

@api_router.delete("/teachers/{teacher_id}")
async def delete_teacher(teacher_id: str, token_data: dict = Depends(verify_token)):
    result = await db.teachers.delete_one({"id": teacher_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Teacher not found")
    return {"message": "Teacher deleted successfully"}

# Subject Routes
@api_router.post("/subjects", response_model=Subject)
async def create_subject(subject: SubjectCreate, token_data: dict = Depends(verify_token)):
    subject_dict = subject.dict()
    subject_obj = Subject(**subject_dict)
    await db.subjects.insert_one(subject_obj.dict())
    return subject_obj

@api_router.get("/subjects", response_model=List[Subject])
async def get_subjects(token_data: dict = Depends(verify_token)):
    subjects = await db.subjects.find().to_list(1000)
    return [Subject(**subject) for subject in subjects]

@api_router.put("/subjects/{subject_id}", response_model=Subject)
async def update_subject(subject_id: str, subject: SubjectCreate, token_data: dict = Depends(verify_token)):
    subject_dict = subject.dict()
    await db.subjects.update_one({"id": subject_id}, {"$set": subject_dict})
    updated_subject = await db.subjects.find_one({"id": subject_id})
    if not updated_subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    return Subject(**updated_subject)

@api_router.delete("/subjects/{subject_id}")
async def delete_subject(subject_id: str, token_data: dict = Depends(verify_token)):
    result = await db.subjects.delete_one({"id": subject_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Subject not found")
    return {"message": "Subject deleted successfully"}

# Class Routes
@api_router.post("/classes", response_model=Class)
async def create_class(class_data: ClassCreate, token_data: dict = Depends(verify_token)):
    class_dict = class_data.dict()
    class_obj = Class(**class_dict)
    await db.classes.insert_one(class_obj.dict())
    return class_obj

@api_router.get("/classes", response_model=List[Class])
async def get_classes(token_data: dict = Depends(verify_token)):
    classes = await db.classes.find().to_list(1000)
    return [Class(**class_data) for class_data in classes]

@api_router.put("/classes/{class_id}", response_model=Class)
async def update_class(class_id: str, class_data: ClassCreate, token_data: dict = Depends(verify_token)):
    class_dict = class_data.dict()
    await db.classes.update_one({"id": class_id}, {"$set": class_dict})
    updated_class = await db.classes.find_one({"id": class_id})
    if not updated_class:
        raise HTTPException(status_code=404, detail="Class not found")
    return Class(**updated_class)

@api_router.delete("/classes/{class_id}")
async def delete_class(class_id: str, token_data: dict = Depends(verify_token)):
    result = await db.classes.delete_one({"id": class_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Class not found")
    return {"message": "Class deleted successfully"}

# Academic Year Routes
@api_router.post("/academic-years", response_model=AcademicYear)
async def create_academic_year(academic_year: AcademicYearCreate, token_data: dict = Depends(verify_token)):
    academic_year_dict = academic_year.dict()
    academic_year_obj = AcademicYear(**academic_year_dict)
    await db.academic_years.insert_one(academic_year_obj.dict())
    return academic_year_obj

@api_router.get("/academic-years", response_model=List[AcademicYear])
async def get_academic_years(token_data: dict = Depends(verify_token)):
    academic_years = await db.academic_years.find().to_list(1000)
    return [AcademicYear(**academic_year) for academic_year in academic_years]

@api_router.put("/academic-years/{academic_year_id}", response_model=AcademicYear)
async def update_academic_year(academic_year_id: str, academic_year: AcademicYearCreate, token_data: dict = Depends(verify_token)):
    academic_year_dict = academic_year.dict()
    await db.academic_years.update_one({"id": academic_year_id}, {"$set": academic_year_dict})
    updated_academic_year = await db.academic_years.find_one({"id": academic_year_id})
    if not updated_academic_year:
        raise HTTPException(status_code=404, detail="Academic Year not found")
    return AcademicYear(**updated_academic_year)

@api_router.delete("/academic-years/{academic_year_id}")
async def delete_academic_year(academic_year_id: str, token_data: dict = Depends(verify_token)):
    result = await db.academic_years.delete_one({"id": academic_year_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Academic Year not found")
    return {"message": "Academic Year deleted successfully"}

# Additional Task Routes
@api_router.post("/additional-tasks", response_model=AdditionalTask)
async def create_additional_task(task: AdditionalTaskCreate, token_data: dict = Depends(verify_token)):
    task_dict = task.dict()
    task_obj = AdditionalTask(**task_dict)
    await db.additional_tasks.insert_one(task_obj.dict())
    return task_obj

@api_router.get("/additional-tasks", response_model=List[AdditionalTask])
async def get_additional_tasks(token_data: dict = Depends(verify_token)):
    tasks = await db.additional_tasks.find().to_list(1000)
    return [AdditionalTask(**task) for task in tasks]

@api_router.put("/additional-tasks/{task_id}", response_model=AdditionalTask)
async def update_additional_task(task_id: str, task: AdditionalTaskCreate, token_data: dict = Depends(verify_token)):
    task_dict = task.dict()
    await db.additional_tasks.update_one({"id": task_id}, {"$set": task_dict})
    updated_task = await db.additional_tasks.find_one({"id": task_id})
    if not updated_task:
        raise HTTPException(status_code=404, detail="Additional Task not found")
    return AdditionalTask(**updated_task)

@api_router.delete("/additional-tasks/{task_id}")
async def delete_additional_task(task_id: str, token_data: dict = Depends(verify_token)):
    result = await db.additional_tasks.delete_one({"id": task_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Additional Task not found")
    return {"message": "Additional Task deleted successfully"}

# Dashboard Stats
@api_router.get("/dashboard/stats")
async def get_dashboard_stats(token_data: dict = Depends(verify_token)):
    schools_count = await db.schools.count_documents({})
    teachers_count = await db.teachers.count_documents({})
    subjects_count = await db.subjects.count_documents({})
    classes_count = await db.classes.count_documents({})
    
    return {
        "schools": schools_count,
        "teachers": teachers_count,
        "subjects": subjects_count,
        "classes": classes_count
    }

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()