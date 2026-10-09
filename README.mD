# 🐦 Chirp

Chirp is a modern social networking and private messaging web application built with HTML, CSS, JavaScript, and Supabase.

It allows users to create accounts, share posts, discover other users, make friends, and communicate through private realtime messages.

## ✨ Features

- 🔐 User registration and login
- 👤 User profiles
- 📝 Create and delete Chirp posts
- 🌍 Discover registered users
- 🔎 Search by name or username
- 🤝 Send friend requests
- ✅ Accept or decline friend requests
- 👥 Friends list
- 🗑️ Remove friends
- 💬 Private messaging
- ⚡ Realtime message updates
- 📩 Unread message indicators
- 📱 Responsive interface
- 🔒 Supabase Row Level Security
- ☁️ Cloud database
- 🌐 GitHub Pages compatible

## 🛠️ Built With

- HTML5
- CSS3
- JavaScript
- Supabase
- PostgreSQL
- Supabase Authentication
- Supabase Realtime
- Font Awesome

## 📁 Project Structure

```text
chirp/
│
├── index.html
├── style.css
├── script.js
├── README.md
│
└── assets/
    └── chirp-logo.png
```

## 🔐 Authentication

Chirp uses Supabase Authentication for account creation and login.

Each account has a profile containing information such as:

- Name
- Username
- Bio
- Avatar
- Account creation date

## 📝 Chirps

Signed-in users can publish short posts called **Chirps**.

Posts are stored in Supabase and displayed in the Home feed.

## 🤝 Friends

Users can search for other Chirp members and send friend requests.

A friendship is created only after the receiving user accepts the request.

Users can also remove existing friends.

## 💬 Messaging

Friends can communicate using Chirp's private messaging system.

Messages are stored in Supabase and Supabase Realtime is used to deliver new message events without requiring the user to manually refresh the page.

Database security policies restrict message creation to authenticated friends.

## 🗄️ Database

The application currently uses these main Supabase tables:

```text
profiles
posts
friend_requests
friendships
messages
```

Row Level Security (RLS) is enabled to help protect user data.

## ⚙️ Supabase Configuration

The frontend requires a Supabase Project URL and a browser-safe Publishable/anon key.

Example:

```javascript
const SUPABASE_URL = "YOUR_SUPABASE_PROJECT_URL";
const SUPABASE_KEY = "YOUR_PUBLISHABLE_KEY";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);
```

Never place a Supabase `service_role` key, secret key, or database password inside frontend JavaScript.

## 🚀 Running Locally

Clone or download the project and open it in VS Code.

For development, you can use the **Live Server** extension to run `index.html` locally.

## 🌐 Deployment

Because the frontend is static, Chirp can be hosted using GitHub Pages.

Supabase provides the backend services, including:

- Authentication
- PostgreSQL database
- Row Level Security
- Realtime messaging

## 🔮 Planned Features

Future versions of Chirp may include:

- Profile picture uploads
- Profile editing
- Notifications
- Blocking and reporting
- Likes and comments
- Image posts
- Online status
- Typing indicators
- Message notifications
- Better mobile chat experience
- Account privacy controls
- Content moderation tools
- Business and creator profiles

## 🔒 Security

Chirp uses Supabase Row Level Security and database functions to control access to user data.

Sensitive backend credentials should never be committed to this repository.

Only browser-safe Supabase credentials should be used by the frontend.

## 📌 Project Status

Chirp is currently under active development.

The current version focuses on the core social networking experience:

**Create Account → Post → Discover People → Add Friends → Chat**

## 👨‍💻 Developer

Developed by **DannIEL Samuel**

Built as an independent social networking web development project.

---

### Chirp

**Connect. Share. Chat.**