# BFF - Backend For Frontend
BFF is a powerful orchestrator designed to streamline and optimize interactions with various APIs, providing a seamless experience for frontend applications. It serves as a central hub, combining the functionalities of Bhashini APIs for translations, Automatic Speech Recognition (ASR), Speech-to-Text, Text-to-Speech, and PM Kisan APIs, specifically catering to Farmers' Aadhaar status and OTP services.

## Key Features:
1. API Orchestration
 - BFF acts as a sophisticated orchestrator, seamlessly integrating multiple APIs to deliver a comprehensive set of language-related services and crucial information for farmers.

2. Xstate for Flow Control
 - The project leverages Xstate to create a flexible and easily configurable flow for the bot. The entire conversation or interaction logic is defined in Xstate JSON, allowing for quick adjustments and modifications without extensive code changes.

3. Additional Features:
  - Telemetry for Metrics
    - BFF provides built-in telemetry features to collect and analyze metrics. This data is crucial for understanding system performance and user behavior. The metrics can be visualized on tools like Grafana, offering valuable insights into the system's health and usage patterns.

 - Logging
   - Comprehensive logging mechanisms are implemented to capture relevant information during the execution of the bot. This aids in debugging, monitoring, and maintaining a transparent record of activities.

## Getting Started:
To integrate BFF into your project, follow these steps:

1. Clone the repository.
```sh
git clone https://github.com/AgrI-Mitra/bff.git
```

2. Setting up the server

```sh
# Setup DB and Hasura
# For Local:
docker-compose -f ./docker-compose.local.yaml up -d --build
# For Server:
ocker-compose up -d

# Migrate Database
npx prisma migrate dev
# Due to a certain glitch in the matrix, doing it twice works for dev setup.

# Start dev server
yarn start:dev
```

3. Deploy and run BFF to start orchestrating API calls and managing the conversation flow.
BFF aims to simplify the development process by providing a robust and extensible backend solution for frontend applications, offering not only powerful API orchestration but also advanced features for monitoring and logging.

### Deployment
- [Deployment steps](https://github.com/AgrI-Mitra/docs/blob/main/deployment.md)

