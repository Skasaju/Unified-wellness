from datetime import datetime
from models.product import Product
from models.blog import Blog
from models.user import User
from core.database import get_db

db = next(get_db())

def seed_products():
    products = [

        # 🥤 SUPPLEMENTS (12)
        Product(
            name="Whey Protein Powder",
            description="Premium whey protein for muscle building and recovery.",
            price=4999,
            category="supplements",
            image_url="/static/images/products/whey_protein.jpg",
            created_at=datetime.now()
        ),
        Product(
            name="Mass Gainer",
            description="High-calorie mass gainer for healthy weight gain.",
            price=6599,
            category="supplements",
            image_url="/static/images/products/mass_gainer.jpg",
            created_at=datetime.now()
        ),
        Product(
            name="Omega-3 Fish Oil",
            description="Supports heart and brain health.",
            price=1899,
            category="supplements",
            image_url="/static/images/products/omega3.jpg",
            created_at=datetime.now()
        ),
        Product(
            name="Multivitamin Complex",
            description="Daily multivitamins for overall wellness.",
            price=1299,
            category="supplements",
            image_url="/static/images/products/multivitamin.jpg",
            created_at=datetime.now()
        ),
        Product(
            name="Creatine Monohydrate",
            description="Boost strength and performance.",
            price=2499,
            category="supplements",
            image_url="/static/images/products/creatine.jpg",
            created_at=datetime.now()
        ),
        Product(
            name="BCAA Powder",
            description="Enhances muscle recovery.",
            price=2999,
            category="supplements",
            image_url="/static/images/products/bcaa.jpg",
            created_at=datetime.now()
        ),
        Product(
            name="Pre-Workout Energy",
            description="Increases focus and endurance.",
            price=2799,
            category="supplements",
            image_url="/static/images/products/preworkout.jpg",
            created_at=datetime.now()
        ),
        Product(
            name="Vitamin D3",
            description="Supports bone and immune health.",
            price=999,
            category="supplements",
            image_url="/static/images/products/vitamin_d.jpg",
            created_at=datetime.now()
        ),
        Product(
            name="ZMA Capsules",
            description="Improves sleep and recovery.",
            price=1499,
            category="supplements",
            image_url="/static/images/products/zma.jpg",
            created_at=datetime.now()
        ),
        Product(
            name="Collagen Peptides",
            description="Supports joint and skin health.",
            price=2199,
            category="supplements",
            image_url="/static/images/products/collagen.jpg",
            created_at=datetime.now()
        ),
        Product(
            name="Electrolyte Powder",
            description="Hydration support during workouts.",
            price=899,
            category="supplements",
            image_url="/static/images/products/electrolyte.jpg",
            created_at=datetime.now()
        ),
        Product(
            name="Ashwagandha Capsules",
            description="Reduces stress and improves recovery.",
            price=1399,
            category="supplements",
            image_url="/static/images/products/ashwagandha.jpg",
            created_at=datetime.now()
        ),

        # 🍫 NUTRITION (10)
        Product(
            name="Protein Bars",
            description="Low-calorie protein snack.",
            price=1199,
            category="nutrition",
            image_url="/static/images/products/protein_bar.jpg",
            created_at=datetime.now()
        ),
        Product(
            name="Energy Gel Pack",
            description="Quick energy for endurance workouts.",
            price=799,
            category="nutrition",
            image_url="/static/images/products/energy_gel.jpg",
            created_at=datetime.now()
        ),
        Product(
            name="Peanut Butter High Protein",
            description="Natural peanut butter with extra protein.",
            price=899,
            category="nutrition",
            image_url="/static/images/products/peanut_butter.jpg",
            created_at=datetime.now()
        ),
        Product(
            name="Oatmeal Pack",
            description="Healthy oats for breakfast.",
            price=499,
            category="nutrition",
            image_url="/static/images/products/oats.jpg",
            created_at=datetime.now()
        ),
        Product(
            name="Granola Mix",
            description="Crunchy granola with nuts and seeds.",
            price=699,
            category="nutrition",
            image_url="/static/images/products/granola.jpg",
            created_at=datetime.now()
        ),
        Product(
            name="Meal Replacement Shake",
            description="Complete nutrition meal shake.",
            price=1999,
            category="nutrition",
            image_url="/static/images/products/meal_shake.jpg",
            created_at=datetime.now()
        ),
        Product(
            name="Dark Chocolate Protein",
            description="Protein-infused dark chocolate.",
            price=1099,
            category="nutrition",
            image_url="/static/images/products/chocolate_protein.jpg",
            created_at=datetime.now()
        ),
        Product(
            name="Honey Organic",
            description="Natural organic honey.",
            price=799,
            category="nutrition",
            image_url="/static/images/products/honey.jpg",
            created_at=datetime.now()
        ),
        Product(
            name="Green Tea Pack",
            description="Antioxidant-rich green tea.",
            price=599,
            category="nutrition",
            image_url="/static/images/products/green_tea.jpg",
            created_at=datetime.now()
        ),
        Product(
            name="Energy Drink Zero Sugar",
            description="Sugar-free energy drink.",
            price=299,
            category="nutrition",
            image_url="/static/images/products/energy_drink.jpg",
            created_at=datetime.now()
        ),

        # 🏋️ EQUIPMENT (14)
        Product(
            name="Dumbbell Set",
            description="Adjustable dumbbells for strength training.",
            price=8999,
            category="equipment",
            image_url="/static/images/products/dumbbell.jpg",
            created_at=datetime.now()
        ),
        Product(
            name="Resistance Bands",
            description="Multi-level resistance bands.",
            price=1999,
            category="equipment",
            image_url="/static/images/products/resistance_band.jpg",
            created_at=datetime.now()
        ),
        Product(
            name="Pull-Up Bar",
            description="Doorway pull-up bar.",
            price=2499,
            category="equipment",
            image_url="/static/images/products/pullup_bar.jpg",
            created_at=datetime.now()
        ),
        Product(
            name="Yoga Mat Premium",
            description="Non-slip yoga mat.",
            price=1799,
            category="equipment",
            image_url="/static/images/products/yoga_mat.jpg",
            created_at=datetime.now()
        ),
        Product(
            name="Kettlebell 16kg",
            description="Cast iron kettlebell.",
            price=3999,
            category="equipment",
            image_url="/static/images/products/kettlebell.jpg",
            created_at=datetime.now()
        ),
        Product(
            name="Foam Roller",
            description="Muscle recovery foam roller.",
            price=999,
            category="equipment",
            image_url="/static/images/products/foam_roller.jpg",
            created_at=datetime.now()
        ),
        Product(
            name="Skipping Rope",
            description="Speed jump rope.",
            price=599,
            category="equipment",
            image_url="/static/images/products/jump_rope.jpg",
            created_at=datetime.now()
        ),
        Product(
            name="Ab Wheel",
            description="Core strengthening ab wheel.",
            price=699,
            category="equipment",
            image_url="/static/images/products/ab_wheel.jpg",
            created_at=datetime.now()
        ),
        Product(
            name="Weightlifting Belt",
            description="Supports heavy lifting.",
            price=1499,
            category="equipment",
            image_url="/static/images/products/belt.jpg",
            created_at=datetime.now()
        ),
        Product(
            name="Push-Up Bars",
            description="Improve push-up form.",
            price=799,
            category="equipment",
            image_url="/static/images/products/pushup_bar.jpg",
            created_at =datetime.now()
        ),

        # ⌚ ACCESSORIES (4)
        Product(
            name="Fitness Tracker Watch",
            description="Tracks heart rate and activity.",
            price=12999,
            category="accessories",
            image_url="/static/images/products/fitness_watch.jpg",
            created_at=datetime.now()
        ),
        Product(
            name="Gym Gloves",
            description="Improves grip during workouts.",
            price=699,
            category="accessories",
            image_url="/static/images/products/gym_gloves.jpg",
            created_at=datetime.now()
        ),
        Product(
            name="Shaker Bottle",
            description="Leak-proof protein shaker.",
            price=399,
            category="accessories",
            image_url="/static/images/products/shaker.jpg",
            created_at=datetime.now()
        ),
        Product(
            name="Sports Water Bottle",
            description="Insulated water bottle.",
            price=499,
            category="accessories",
            image_url="/static/images/products/water_bottle.jpg",
            created_at=datetime.now()
        ),
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
