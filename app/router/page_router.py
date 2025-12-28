from fastapi import APIRouter
from fastapi.responses import FileResponse

router = APIRouter(tags=["Web Pages"])

# HTML page routes
@router.get("/")
async def root():
    return FileResponse("static/index.html")

@router.get("/login")
async def login_page():
    return FileResponse("static/login.html")

@router.get("/signup")
async def signup_page():
    return FileResponse("static/signup.html")

@router.get("/dashboard")
async def dashboard_page():
    return FileResponse("static/dashboard.html")


@router.get("/products")
async def products_page():
    return FileResponse("static/products.html")


@router.get("/blogs")
async def blogs_page():
    return FileResponse("static/blogs.html")


@router.get("/profile")
async def profile_page():
    return FileResponse("static/profile.html")


@router.get("/admin")
async def admin_page():
    return FileResponse("static/admin.html")



@router.get("/heart-rate")
def heart_rate_page():
    return FileResponse("static/heart-rate.html")

@router.get("/analyzer")
def analyzer_page():
    return FileResponse("static/analyzer.html")

# @router.get("/workout")
# def workout_page():
#     return FileResponse("static/workout.html")