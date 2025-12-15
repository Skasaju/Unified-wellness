from datetime import datetime
from models.product import Product
from models.blog import Blog
from models.user import User
from core.database import get_db

db = next(get_db())

def seed_products():
    products = [
        Product(
            name="Whey Protein Powder",
            description="Premium whey protein for muscle building and recovery. High-quality protein with essential amino acids.",
            price=49.99,
            category="supplements",
            created_at=datetime.now()
        ),
        Product(
            name="Low-Calorie Protein Bars",
            description="Delicious protein bars with low calories, perfect for weight management and on-the-go nutrition.",
            price=24.99,
            category="nutrition",
            created_at=datetime.now()
        ),
        Product(
            name="Resistance Bands Set",
            description="Complete set of resistance bands for strength training at home or gym.",
            price=29.99,
            category="equipment",
            created_at=datetime.now()
        ),
        Product(
            name="Yoga Mat Premium",
            description="Non-slip yoga mat with extra cushioning for comfortable workouts.",
            price=39.99,
            category="equipment",
            created_at=datetime.now()
        ),
        Product(
            name="Multivitamin Complex",
            description="Complete daily multivitamin for overall health and wellness support.",
            price=19.99,
            category="supplements",
            created_at=datetime.now()
        ),
        Product(
            name="Energy Gel Pack",
            description="Quick energy boost for endurance athletes and intense workouts.",
            price=15.99,
            category="nutrition",
            created_at=datetime.now()
        ),
        Product(
            name="Fitness Tracker Watch",
            description="Smart fitness watch with heart rate monitoring and activity tracking.",
            price=149.99,
            category="accessories",
            created_at=datetime.now()
        ),
        Product(
            name="Omega-3 Fish Oil",
            description="High-quality omega-3 supplement for heart and brain health.",
            price=34.99,
            category="supplements",
            created_at=datetime.now()
        )
    ]
    
    for product in products:
        db.add(product)
    
    db.commit()
    print(f"✓ Added {len(products)} products")

def seed_blogs():
  
    admin = db.query(User).filter(User.role == "ADMIN").first()
    print(admin.__dict__)
    if not admin:
        print("No admin user found, skipping blog seed")
        return

    blogs = [
        Blog(
            title="5 Tips for Building Muscle Effectively",
            content="Building muscle requires a combination of proper training, nutrition, and recovery. Here are the key tips: 1) Progressive overload in your workouts, 2) Adequate protein intake (1.6-2.2g per kg body weight), 3) Consistent training schedule, 4) Quality sleep (7-9 hours), and 5) Patience and consistency over time.",
            author_id=admin.id,
            created_at=datetime.now()
        ),
        Blog(
            title="Heart Rate Training Zones Explained",
            content="Understanding your heart rate zones can optimize your workouts. Zone 1 (50-60% max HR) is for warm-up and recovery. Zone 2 (60-70%) builds aerobic base. Zone 3 (70-80%) improves aerobic capacity. Zone 4 (80-90%) increases lactate threshold. Zone 5 (90-100%) is for maximum effort intervals.",
            author_id=admin.id,
            created_at=datetime.now()
        ),
        Blog(
            title="Nutrition Basics for Weight Loss",
            content="Sustainable weight loss comes from creating a modest calorie deficit while maintaining proper nutrition. Focus on whole foods, lean proteins, vegetables, fruits, and complex carbohydrates. Avoid crash diets and aim for 0.5-1kg loss per week for sustainable results.",
            author_id=admin.id,
            created_at=datetime.now()
        )
    ]

    for blog in blogs:
        db.add(blog)

    db.commit()
    print(f"✓ Added {len(blogs)} blog posts")

if __name__ == "__main__":
    print("Seeding database...")
    seed_products()
    seed_blogs()
    print("Database seeding complete!")
