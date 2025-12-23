# Arise 2.0

![Arise Banner](public/icon.png)

**Arise** is a comprehensive, gamified productivity suite designed to help you master your habits, track your tasks, and optimize your mental state. Built with modern web technologies and wrapped for cross-platform performance, Arise combines task management, habit tracking, journaling, and focus tools into a single, beautiful interface.

## 🚀 Features

### ✅ Advanced Task Management
-   **Smart Organization**: Group tasks by categories, set priorities, and manage deadlines.
-   **Subtasks**: Break down complex goals into manageable steps.
-   **Custom Notifications**: Set specific reminder times for important missions.

### 🔥 Habit Tracking with Streaks
-   **Streak Protection**: Robust streak calculation logic ensuring your hard work is accurately recorded.
-   **Visual Heatmaps**: Track your consistency over time with intuitive visual cues.
-   **Level Up**: Earn XP for completing habits and unlock new levels in your personal productivity journey.

### 🧠 Mood & Analytics
-   **Mood Tracking**: Log your daily mood and energy levels with context (factors/notes).
-   **Insightful Graphs**: Visualize mood trends and correlate them with your productivity.
-   **Detailed Stats**: View completion rates, focus time distribution, and more.

### 🧘 Focus Mode
-   **Pomodoro Timer**: Built-in timer with customizable modes (Focus, Short Break, Long Break).
-   **Ambient Sounds**: Enhance your concentration with integrated background noise options.

### 📔 Reflection Journal
-   **Daily Entries**: Capture your thoughts and reflections.
-   **Markdown Support**: Write beautifully formatted entries.

## 🛠️ Tech Stack

*   **Frontend**: Rept, TypeScript, Vite
*   **UI Framework**: Tailwind CSS, shadcn/ui
*   **State Management**: React Query, Zustand (or Context)
*   **Backend**: Supabase (PostgreSQL, Auth)
*   **Desktop**: Electron (Linux, Windows)
*   **Mobile**: Capacitor (Android)

## 📦 Installation & Setup

### Prerequisites
*   Node.js (v18+)
*   npm or yarn

### Development
```bash
# Clone the repository
git clone https://github.com/callme-ADHI/Arise_2.0.git

# Navigate to directory
cd Arise_2.0

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build for Desktop (Electron)
```bash
# Build for Linux
npm run electron:build

# Build for Windows (requires Wine on Linux or Windows OS)
npm run electron:build -- --win
```

### Build for Mobile (Android)
```bash
# Sync Capacitor config
npx cap sync

# Open Android Studio to build/run
npx cap open android
```

## 🔐 Configuration

Create a `.env` file in the root directory with your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📄 License

All rights reserved.
