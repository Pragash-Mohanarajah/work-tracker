# Pragash's Internal Tracker for GitHub Activity

A specialized dashboard designed to monitor and visualize personal GitHub productivity through granular metrics. This tool aggregates data from the GitHub API to provide deeper insights into development patterns beyond standard contribution graphs.

## 📊 Key Metrics Tracked

- **Commit Granularity:** Tracking lines of code (LOC) added/removed per repository.
- **Language Distribution:** Real-time breakdown of technology usage across all projects.
- **Activity Heatmaps:** Visualizing peak coding hours and daily consistency.
- **Repository Health:** Monitoring PR cycles, issue resolution times, and repository growth.

## 🛠️ Tech Stack

- **Frontend:** Next.js (Pages Router) & HeroUI
- **Styling:** Tailwind CSS & Framer Motion
- **Data Fetching:** GitHub GraphQL API (v4)
- **Automation:** GitHub Actions for periodic data synchronization

## 🚀 Getting Started

1. **Install Dependencies:**
   ```bash
   npm install
   ```
2. **Environment Variables:**
   Create a `.env.local` file with your `GITHUB_TOKEN`.
3. **Run Development Server:**
   ```bash
   npm run dev
   ```
