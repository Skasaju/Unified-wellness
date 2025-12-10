from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from core.database import get_db
from core.dependencies import get_current_user, require_admin
from models.user import User
from models.product import Product
from schemas.product import ProductCreate, ProductResponse

router = APIRouter(prefix="/api/products", tags=["Products"])


@router.get("", response_model=List[ProductResponse])
def get_products(search: Optional[str] = None, db: Session = Depends(get_db)):
    """Get all products"""
    query = db.query(Product)
    if search:
        query = query.filter(
            (Product.name.contains(search)) | (Product.description.contains(search))
        )
    products = query.order_by(Product.created_at.desc()).all()
    return products


@router.post("", response_model=ProductResponse)
def create_product(
    product_data: ProductCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Create a new product (Admin only)"""
    product = Product(
        name=product_data.name,
        description=product_data.description,
        price=product_data.price,
        category=product_data.category,
        created_at=datetime.now()
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@router.delete("/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Delete a product (Admin only)"""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    db.delete(product)
    db.commit()
    return {"message": "Product deleted"}


@router.get("/recommended")
def get_recommended_products(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get recommended products based on user profile"""
    bmi = current_user.weight_kg / ((current_user.height_cm / 100) ** 2) if current_user.height_cm else 22
    
    products = db.query(Product).all()
    recommended = []
    
    for product in products:
        reason = None
        if bmi < 18.5 and "protein" in product.name.lower():
            reason = "Recommended for weight gain"
        elif bmi >= 25 and "low-calorie" in product.description.lower():
            reason = "Recommended for weight management"
        elif current_user.goals and "muscle" in current_user.goals.lower() and "protein" in product.name.lower():
            reason = "Supports muscle building goals"
        
        if reason:
            product_dict = {
                "id": product.id,
                "name": product.name,
                "description": product.description,
                "price": product.price,
                "category": product.category,
                "created_at": product.created_at,
                "recommendation_reason": reason
            }
            recommended.append(product_dict)
    
    return recommended[:5]