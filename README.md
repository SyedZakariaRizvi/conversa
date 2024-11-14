# Conversa

Conversa is a simple chat application for one-to-one and group messaging, built using Node.js, Socket.io, and MongoDB. It supports real-time communication, stores chat history, and includes features for user authentication and offline message delivery.

## Features

- **Real-time Messaging**: Instant communication through WebSockets with Socket.io.
- **User Authentication**: Login and session management using Passport.js and local strategy.
- **Chat History**: Messages are stored in a MongoDB database and retrieved upon request.
- **Offline Message Delivery**: Messages are stored when users are offline and delivered once they reconnect.
- **Modern UI**: Built with EJS for dynamic rendering of chat interface.

## Installation

### Prerequisites

Ensure you have Node.js and npm installed. You can check with:

```bash
node -v
npm -v
```

### Clone the Repository

```bash
git clone https://github.com/SyedZakariaRizvi/conversa.git
cd conversa
```

### Install Dependencies

```bash
npm install
```

### Set Up Environment Variables

Create a `.env` file in the root of the project and add your environment variables (e.g., for MongoDB connection string, session secret, etc.).

Example:

```
MONGO_URI=your_mongodb_connection_uri
SESSION_SECRET=your_session_secret
```

### Run the Application

For development:

```bash
npm run dev
```

The app should now be running on [http://localhost:3000](http://localhost:3000).

## License

This project is licensed under the MIT License.

## Contributing

If you'd like to contribute, feel free to fork this repository and submit a pull request. Please ensure that your code adheres to the existing style and includes tests where applicable.