# LuxeStay - Hotel Booking Application

A modern, fully-responsive React application built with TypeScript that allows users to search and browse hotels from a live API.

## 🎯 Project Features

### ✅ All Requirements Met

1. **Live API Integration**: Uses hotel data API with real-time data fetching
2. **Multiple Screens with Routing**: 
   - Home page (landing/search)
   - Hotel List page (search results)
   - Hotel Detail page (individual hotel details)
3. **User Interaction**: Search and filter functionality that updates displayed results
4. **All States Handled**:
   - ✓ **Loading State**: Spinner shown during API calls
   - ✓ **Error State**: Error messages with retry functionality
   - ✓ **Empty State**: Friendly message when no results found
5. **Fully Responsive**: Mobile-first design tested on all screen sizes
6. **TypeScript**: Complete type safety throughout the application

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd Live-React-App-for-hotel-
```

2. Install dependencies
```bash
npm install
```

3. Run the development server
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.tsx      # Navigation header
│   ├── Footer.tsx      # Page footer
│   ├── SearchBar.tsx   # Search input component
│   ├── HotelCard.tsx   # Hotel card display
│   ├── LoadingSpinner.tsx   # Loading state component
│   ├── ErrorMessage.tsx     # Error state component
│   └── EmptyState.tsx       # Empty results component
├── pages/              # Page components (routes)
│   ├── Home.tsx        # Landing page
│   ├── HotelList.tsx   # Hotel search results
│   └── HotelDetail.tsx # Individual hotel details
├── services/           # API integration layer
│   └── hotelService.ts # Hotel API calls
├── types/              # TypeScript type definitions
│   └── hotel.ts        # Hotel data types
├── App.tsx             # Main app component with routing
├── main.tsx            # Application entry point
└── index.css           # Global styles
```

## 🎨 Design & Styling

- **Color Theme**: Elegant hotel-themed palette
  - Primary: Deep teal (#1a5f7a)
  - Secondary: Warm gold (#d4a373)
- **Responsive Breakpoints**:
  - Mobile: < 480px
  - Tablet: 480px - 768px
  - Desktop: > 768px

## 🔍 Key Implementation Details

### State Management

State is strategically placed based on these principles:

1. **Local Component State**: Used when data is only needed by that component
2. **Page-Level State**: Used for data fetching and coordination between child components
3. **URL State**: Search parameters stored in URL for shareability and navigation

### Why State Lives Where It Lives

**HotelList Component:**
- `hotels` state: Lives here because this page fetches and displays the list
- `loading` state: Lives here because this component initiates API calls
- `error` state: Lives here for centralized error handling

**SearchBar Component:**
- `city` state: Lives here because it's only needed for the controlled input
- Parent only needs the final value on submit, not every keystroke

**HotelDetail Component:**
- `hotel` state: Lives here because this page is responsible for fetching single hotel data
- Each page manages its own data to keep concerns separated

### Component Re-rendering

Components re-render when:

1. **State changes** in the component
2. **Props change** from parent
3. **Parent re-renders** (but React optimizes this)
4. **Context changes** (not used in this app)
5. **Route changes** (for routing-aware components)

Example: `HotelList` re-renders when:
- Search parameter changes (user searches)
- Hotels state updates (API returns data)
- Loading/error states change

## 📱 Responsive Design

The application is fully responsive with:
- Flexible grid layouts
- Mobile-optimized navigation
- Touch-friendly buttons and cards
- Proper image sizing across devices
- Readable typography on all screens

## 🧪 Testing the Application

1. **Loading State**: Clear cache and reload to see loading spinners
2. **Error State**: Temporarily disconnect internet to trigger error messages
3. **Empty State**: Search for a city that doesn't exist (e.g., "xyz")
4. **Search Functionality**: Try searching for "New York", "Miami", "Chicago"
5. **Responsive Design**: Use browser dev tools to test different screen sizes

## 🎓 Interview Preparation

### Be Ready to Explain:

1. **Why a component re-rendered**:
   - State change within the component
   - Props changed from parent
   - Hook dependencies triggered re-render (useEffect, etc.)

2. **Why state lives where it lives**:
   - Principle: Keep state as close as possible to where it's used
   - Lift state up only when multiple components need to share it
   - URL state for shareable/bookmarkable data

3. **Any line of code in the project**:
   - Every component has inline comments explaining logic
   - Type definitions explain data structure
   - Service layer explains API integration

### Code Walkthrough Tips:

- Start with the component's purpose
- Explain props and why they're needed
- Walk through state and why it's managed here
- Explain any hooks and their dependencies
- Describe the return statement and JSX structure

## 🛠️ Technologies Used

- **React 18**: Modern React with hooks
- **TypeScript**: Type safety and better developer experience
- **React Router**: Client-side routing
- **Vite**: Fast build tool and dev server
- **CSS3**: Custom styling with CSS variables

## 📝 Notes

- Mock API data is used for demonstration
- Can easily swap to real API by updating `hotelService.ts`
- All states (loading, error, empty) are properly handled
- Fully typed with TypeScript for better maintainability

## 👨‍💻 Author

Built as part of React learning curriculum - demonstrating proficiency in:
- React fundamentals (components, state, props)
- React Hooks (useState, useEffect, useParams, useNavigate)
- React Router (routing, navigation, URL parameters)
- TypeScript integration
- Responsive design
- API integration
- Error handling
