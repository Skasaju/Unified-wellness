# Unified Wellness - Health & Fitness Platform

A comprehensive health and fitness tracking platform built with FastAPI,SQLAlchemy.

## Project Structure

```
IN DEVELOPMENT
```
## Features

- **User Authentication**: JWT-based authentication with role-based access control
- **Health Tracking**: Monitor heart rate, workouts, sleep, and nutrition
- **Real-time Monitoring**: WebSocket support for live heart rate tracking
- **AI-Powered Features**: 
  - Food image analysis using OpenAI Vision
  - Personalized workout plan generation
- **Anomaly Detection**: Automatic detection of abnormal heart rate patterns
- **Product Recommendations**: Smart product suggestions based on user profile
- **Blog System**: User-generated content platform
- **Admin Dashboard**: Comprehensive analytics and user management

## Setup Instructions

### 1. Install Dependencies

```bash
pip install uv
uv sync
```

### 2. Configure Environment

Create a `.env` file in the root directory:

```env
DATABASE_URL=sqlite:///./health_fitness.db
SECRET_KEY=your-secret-key-here
SESSION_SECRET=your-session-secret-here
OPENAI_API_KEY=your-openai-api-key-here  # Optional
```

### 3. Run the Application

```bash
uv run main.py

# Or using uvicorn directly
uvicorn app.main:app --reload --host localhost --port 5000
```

### 4. Access the Application

- Web Interface: http://localhost:5000
- API Documentation: http://localhost:5000/docs
- Alternative Docs: http://localhost:5000/redoc

## API Endpoints

### Authentication
- `POST /auth/signup` - Register new user
- `POST /auth/login` - User login

### User Management
- `GET /api/user/me` - Get current user
- `PUT /api/user/me` - Update profile
- `GET /api/user/bmi` - Calculate BMI

## Database Models

### User
- Basic info (name, email, password)
- Physical attributes (age, height, weight, gender)
- Goals and preferences

### Health Records
- **HeartRate**: BPM tracking with timestamps
- **Workout**: Type, duration, calories burned
- **Sleep**: Hours and quality rating
- **Nutrition**: Food logging with macros
- **Anomaly**: Detected health anomalies

### Content
- **Blog**: User-generated articles
- **Product**: Health & fitness products

## Technologies Used

- **FastAPI**: Modern web framework
- **SQLAlchemy**: SQL toolkit and ORM
- **Pydantic**: Data validation
- **JWT**: Authentication
- **WebSocket**: Real-time communication
- **OpenAI API**: AI-powered features (optional)

## Security

- Passwords are hashed using PBKDF2-SHA256
- JWT tokens for authentication
- Role-based access control (USER/ADMIN)
- SQL injection protection via SQLAlchemy ORM

## License

Licensed by Samridhhi Kasaju