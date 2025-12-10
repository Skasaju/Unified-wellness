from datetime import datetime
from models.product import Product
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


if __name__ == "__main__":
    print("Seeding database...")
    seed_products()
    print("Database seeding complete!")
