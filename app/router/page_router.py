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

@router.get("/products/{product_id}")
async def product_detail_page(product_id: int):
    return FileResponse("static/product-detail.html")


@router.get("/blogs")
async def blogs_page():
    return FileResponse("static/blogs.html")


@router.get("/profile")
async def profile_page():
    return FileResponse("static/profile.html")


@router.get("/admin")
async def admin_page():
    return FileResponse("static/admin.html")
