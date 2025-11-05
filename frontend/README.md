# ServiceHive SlotSwapper - Frontend

React frontend for the ServiceHive SlotSwapper peer-to-peer time-slot swapping system.

## Setup

```bash
cd serviceHive/frontend
npm install
npm run dev
```

The app will run at `http://localhost:5173` and connect to the FastAPI backend at `http://127.0.0.1:8000`.

## Features

- **Authentication**: Sign up and login with JWT token management
- **Dashboard**: View and manage your events (create, update status, delete)
- **Marketplace**: Browse other users' swappable slots and request swaps
- **Requests**: View and respond to incoming/outgoing swap requests

## Project Structure

```
src/
├── api/
│   └── axiosInstance.js      # Axios setup with JWT token handling
├── context/
│   └── AuthContext.jsx        # Authentication state management
├── components/
│   ├── Navbar.jsx            # Navigation bar
│   ├── EventForm.jsx         # Form for creating events
│   ├── EventList.jsx         # Display list of events
│   └── PrivateRoute.jsx      # Route protection wrapper
├── pages/
│   ├── Login.jsx             # Login page
│   ├── Signup.jsx            # Signup page
│   ├── Dashboard.jsx         # User's events management
│   ├── Marketplace.jsx       # Browse and request swaps
│   └── Requests.jsx          # Manage swap requests
├── App.jsx                   # Main app component with routing
├── main.jsx                  # Entry point
└── index.css                 # Tailwind CSS imports
```

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router** - Navigation
- **Axios** - HTTP client
- **TailwindCSS** - Styling
- **Context API** - State management

## Usage

1. **Sign Up**: Create a new account at `/signup`
2. **Login**: Login at `/login` with your credentials
3. **Dashboard**: Add events and mark them as swappable
4. **Marketplace**: Browse other users' swappable slots and request swaps
5. **Requests**: Accept or reject incoming swap requests

## Notes

- JWT tokens are stored in localStorage
- All API requests automatically include the Authorization header
- The app redirects to `/login` if the token is invalid or expired
- The Requests page currently shows a note about required backend endpoints for fetching swap requests

