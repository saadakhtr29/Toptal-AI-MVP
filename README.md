# Toptal AI MVP

A real-time AI-powered recruitment platform with three main modules:

1. Virtual Recruiter - Voice-based AI recruiter for real-time phone calls
2. AI Interviewer - Automated interview system with feedback generation
3. AI Recruiter - Resume parsing and candidate matching

## Project Structure

```
Toptal-AI-MVP/
├── client/                      # Frontend React application
│   ├── public/                  # Static files
│   ├── src/                     # Source code
│   │   ├── assets/             # Images, fonts, etc.
│   │   ├── components/         # Reusable React components
│   │   ├── context/            # React context providers
│   │   ├── modules/            # Feature-specific modules
│   │   ├── pages/              # Page components
│   │   ├── services/           # API services
│   │   ├── styles/             # CSS and styling files
│   │   ├── App.jsx            # Main App component
│   │   ├── App.css            # App-specific styles
│   │   ├── index.css          # Global styles
│   │   └── main.jsx           # Entry point
│   ├── package.json            # Frontend dependencies
│   ├── vite.config.js          # Vite configuration
│   └── eslint.config.js        # ESLint configuration
│
├── server/                      # Backend Node.js application
│   ├── controllers/            # Route controllers
│   ├── middleware/             # Express middleware
│   ├── prisma/                 # Database schema and migrations
│   ├── routes/                 # API routes
│   ├── services/               # Business logic
│   ├── utils/                  # Utility functions
│   ├── index.js               # Server entry point
│   └── package.json           # Backend dependencies
│
└── README.md                   # Project documentation
```

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL
- Twilio Account
- Google Cloud Account
- Firebase Account

## Setup

1. Clone the repository:

```bash
git clone https://github.com/yourusername/toptal-ai-mvp.git
cd toptal-ai-mvp
```

2. Install dependencies:

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

3. Set up environment variables:

- Copy `.env.example` to `.env` in both client and server directories
- Fill in the required environment variables

4. Set up the database:

```bash
cd server
npx prisma migrate dev
```

5. Start the development servers:

```bash
# Start server (from server directory)
npm run dev

# Start client (from client directory)
npm run dev
```

## Features

### Virtual Recruiter

- Real-time voice calls with AI
- Speech-to-text and text-to-speech conversion
- Conversation memory and context management

### AI Interviewer

- Role-based interview questions
- Real-time answer evaluation
- PDF report generation

### AI Recruiter

- Resume parsing and skill extraction
- Candidate matching
- Automated outreach message generation

## API Documentation

### Voice Call Endpoints

- `POST /api/twilio/voice` - Handle incoming voice calls
- `POST /api/twilio/stream` - Handle media streams
- `POST /api/calls/start` - Start an outbound call
- `GET /api/calls/status/:callId` - Get call status

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
