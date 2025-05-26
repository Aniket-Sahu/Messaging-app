Here's a professional and complete `README.md` file for your **Messaging App** GitHub repository:

---

# 📬 Messaging App

A real-time chat application built using the **PERN Stack** (PostgreSQL, Express, React, Node.js) with **Socket.IO** integration for instant messaging. Users can register, log in, and chat with others in real-time over a clean and modern interface.

---

## 🚀 Features

* ✅ User authentication (Login & Signup)
* 💬 Real-time messaging using Socket.IO
* 🧾 Persistent chat history stored in PostgreSQL
* 👤 User list display with online/offline status
* 🔒 Secure password hashing with `bcrypt`
* 🖥️ RESTful APIs built with Express
* 🎨 Responsive and clean UI with React

---

## 🛠️ Tech Stack

| Frontend | Backend | Real-time | Database   | Other                     |
| -------- | ------- | --------- | ---------- | ------------------------- |
| React    | Node.js | Socket.IO | PostgreSQL | Express.js, bcrypt, axios |

---

## 📸 Screenshots

> *You can insert screenshots here using the following markdown:*

```md
![Login Page](./screenshots/login.png)
![Chat Page](./screenshots/chat.png)
```

---

## 🧑‍💻 Getting Started

### Prerequisites

* Node.js
* PostgreSQL
* npm or yarn

### 1. Clone the Repository

```bash
git clone https://github.com/Aniket-Sahu/Messaging-app.git
cd Messaging-app
```

### 2. Set up Environment Variables

Create a `.env` file in the `server` directory and add:

```env
PORT=5000
DB_USER=your_pg_user
DB_PASSWORD=your_pg_password
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=your_database
JWT_SECRET=your_secret_key
```

### 3. Install Dependencies

#### Backend (Server)

```bash
cd server
npm install
```

#### Frontend (Client)

```bash
cd ../client
npm install
```

### 4. Run the Application

#### Backend

```bash
cd server
npm run dev
```

#### Frontend

```bash
cd client
npm start
```

---

## 🧪 API Endpoints

| Method | Endpoint             | Description         |
| ------ | -------------------- | ------------------- |
| POST   | `/api/auth/login`    | Login user          |
| POST   | `/api/auth/register` | Register new user   |
| GET    | `/api/users`         | Fetch all users     |
| GET    | `/api/messages/:id`  | Get message history |
| POST   | `/api/messages`      | Send a new message  |

---

## 📂 Project Structure

```
Messaging-app/
│
├── client/        # React frontend
│
├── server/        # Node.js + Express backend
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   └── socket/
│
├── README.md
└── .env (add this manually)
```

---

## ⚡ Future Enhancements

* Group chats
* Message read receipts
* User typing indicators
* Profile pictures & settings
* Media file sharing

---

## 🤝 Contributing

Contributions are welcome! Please fork the repo and submit a pull request.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

---

Let me know if you'd like it personalized further (e.g. your name, social handles, deployment link, etc.) or want me to help generate screenshots or badges.
