# Kisan Mitra AI – Smart Agricultural Assistant
## Project Plan

### Project Objective
To develop a comprehensive, AI-powered responsive web application that empowers farmers with actionable, data-driven agricultural intelligence. The platform aims to modernize farming practices through features like crop recommendation, disease detection, market insights, and localized weather advisories, contributing to increased yield and sustainable agriculture. 

### Target Users
- Farmers seeking modern agricultural guidance
- Agronomists and agricultural consultants
- Agricultural administrators and researchers

### Major Features
1. **Farmer Authentication**: Secure login/registration (JWT based).
2. **Farmer Profile**: Personalized profile tracking location, land size, and preferred crops.
3. **Professional Dashboard**: Centralized hub for quick insights, weather summaries, and recent alerts.
4. **AI Crop Recommendation**: ML models to suggest optimal crops based on soil metrics and weather.
5. **Plant Disease Detection**: Computer Vision based leaf image analysis to identify diseases.
6. **AI Agricultural Chatbot**: LLM+RAG powered conversational agent tailored for farming queries.
7. **Weather Intelligence**: Real-time and forecasted weather data specific to the farmer's location.
8. **Smart Irrigation Advisory**: Recommendations for optimal watering schedules based on environmental data.
9. **Market/Mandi Price Information**: Up-to-date crop market prices and trends.
10. **AI Insights**: Generative AI based actionable tips for yield improvement and risk mitigation.
11. **Notifications**: Alerts for severe weather, market changes, or crop risks.
12. **Admin Dashboard**: System administration for user management, usage statistics, and ML model performance.
13. **Analytics**: Platform-wide usage and agricultural trend analytics.
14. **Explainable AI**: Transparent reasoning behind AI recommendations (why a specific crop or disease was predicted).

### Technology Stack
- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Python, FastAPI
- **Database**: PostgreSQL (relational structured data)
- **Machine Learning**: Python, Scikit-learn (tabular data models like crop recommendation)
- **Computer Vision**: TensorFlow/Keras or PyTorch (image classification for disease detection)
- **AI**: Large Language Models (LLM) with Retrieval-Augmented Generation (RAG) architecture

### System Architecture
The application follows a client-server microservices-oriented architecture:
- **Client (Frontend)**: React SPA communicating with backend via REST APIs.
- **Server (Backend)**: FastAPI serving as the primary API gateway, orchestrating business logic and database interactions.
- **AI/ML Layer**: Dedicated microservices or background tasks handling model inference, image processing, and LLM communication.
- **Database**: Centralized PostgreSQL database for user, profile, market, and telemetry data.

### Frontend Architecture
- **Framework**: React with Vite for fast build tooling.
- **Language**: TypeScript for type safety.
- **Styling**: Tailwind CSS for responsive and utility-first styling.
- **State Management**: React Context or Redux Toolkit.
- **Routing**: React Router.
- **API Communication**: Axios or Fetch API.

### Backend Architecture
- **Framework**: FastAPI (asynchronous, high performance).
- **Language**: Python 3.10+.
- **ORM**: SQLAlchemy or SQLModel for database interactions.
- **Authentication**: OAuth2 with JWT tokens.
- **Task Queue**: Celery (optional, for heavy ML tasks like image processing) + Redis.

### Database Architecture
- **Relational DBMS**: PostgreSQL.
- **Key Tables**: Users, Profiles, Queries (Chatbot History), ImageUploads, CropRecommendations, MarketPrices.

### AI/ML Architecture
- **Crop Recommendation**: Scikit-learn Random Forest/XGBoost trained on NPK, pH, rainfall, and temperature data.
- **Disease Detection**: CNN (Convolutional Neural Network) via PyTorch/TensorFlow trained on datasets like PlantVillage.
- **Chatbot (LLM + RAG)**: Integration with OpenAI/Gemini/Local LLM, combined with a Vector Database (e.g., ChromaDB, FAISS) containing agricultural best practices documents.

### Development Phases
- **Phase 1: Setup and Architecture**: Repository setup, CI/CD pipeline, and foundational project structure.
- **Phase 2: Core Infrastructure**: Authentication, user profiles, and basic dashboard.
- **Phase 3: AI & ML Integration (Part 1)**: Crop recommendation models and disease detection via leaf image upload.
- **Phase 4: AI & ML Integration (Part 2)**: RAG chatbot, AI insights, and explainable AI features.
- **Phase 5: External Integrations**: Weather API, Mandi prices API.
- **Phase 6: Admin and Analytics**: Building the admin dashboard and platform analytics.
- **Phase 7: Testing, Polish, and Deployment**: E2E testing, responsive design polish, and production deployment.

### Required Dependencies
- **Frontend**: `react`, `react-dom`, `typescript`, `tailwindcss`, `axios`, `react-router-dom`, `chart.js` (or similar for analytics), `lucide-react` (for icons).
- **Backend**: `fastapi`, `uvicorn`, `sqlalchemy`, `psycopg2-binary`, `pydantic`, `python-jose`, `passlib`, `python-multipart`.
- **AI/ML**: `scikit-learn`, `pandas`, `numpy`, `torch` or `tensorflow`, `langchain` (for RAG), `chromadb` (for vector store).

### External APIs that may be required
- **Weather Data**: OpenWeatherMap API or WeatherAPI.
- **Market Prices**: Government Mandi API (e.g., e-NAM in India) or commercial agritech data providers.
- **LLM API**: OpenAI API, Google Gemini API, or Anthropic Claude API for the agricultural chatbot.

### Local Development Requirements
- Node.js (v18+)
- Python (v3.10+)
- PostgreSQL (v14+)
- Git
- Redis (if using task queues)

### Testing Strategy
- **Unit Testing**: `pytest` for backend/ML functions, `Jest` or `Vitest` for frontend components.
- **Integration Testing**: Testing API endpoints using FastAPI's `TestClient`.
- **E2E Testing**: Cypress or Playwright for complete user flows (e.g., farmer login to receiving a recommendation).

### Deployment Strategy
- **Frontend**: Vercel or Netlify for static asset hosting and CDN distribution.
- **Backend**: Render, Heroku, or AWS EC2/ECS.
- **Database**: Managed PostgreSQL (e.g., Supabase, Neon, AWS RDS).
- **ML Services**: Containerized deployment using Docker on specialized compute nodes (if GPU is needed) or serverless (if models are small enough).
