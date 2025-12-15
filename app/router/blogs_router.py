from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from core.database import get_db
from core.dependencies import get_current_user
from models.user import User
from models.blog import Blog
from schemas.blog import BlogCreate, BlogResponse

router = APIRouter(prefix="/api/blogs", tags=["Blogs"])


@router.get("", response_model=List[BlogResponse])
def get_blogs(db: Session = Depends(get_db)):
    """
    Get all blog posts.
    """
    blogs = db.query(Blog)\
        .order_by(Blog.created_at.desc())\
        .all()
    
    return blogs


@router.post("", response_model=BlogResponse)
def create_blog(
    blog_data: BlogCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new blog post.
    """
    blog = Blog(
        title=blog_data.title,
        content=blog_data.content,
        author_id=current_user.id,
        created_at=datetime.now()
    )
    
    db.add(blog)
    db.commit()
    db.refresh(blog)
    
    return blog


@router.delete("/{blog_id}")
def delete_blog(
    blog_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a blog post (only author or admin can delete).
    """
    blog = db.query(Blog).filter(Blog.id == blog_id).first()
    
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    
    # Check authorization
    if blog.author_id != current_user.id and current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    db.delete(blog)
    db.commit()
    
    return {"message": "Blog deleted"}