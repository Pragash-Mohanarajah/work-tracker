# Pragash's GitHub Activity Tracker

This project is a comprehensive GitHub activity tracker designed to monitor, analyze, and visualize personal and organizational contributions. It leverages the GitHub API to gather granular data, process it, and generate dynamic Markdown reports (`WORK_TRACKER.md` and organization-specific `.md` files) along with SVG visualizations. This provides a detailed, real-time overview of development patterns, project health, and technology usage.

## 📊 Key Metrics Tracked

- **Global Activity Overview:** Provides a high-level summary of total commits, longest streak, estimated lines of code, and account age.
- **Detailed Repository Metrics:** Tracks individual repository contributions, including total commits, monthly activity trends (sparklines), and a calculated health score based on recent activity.
- **Branch-Level Insights:** For the top 5 most active repositories within each organization, it fetches and visualizes commit breakdowns per branch.
- **Language & Technology Distribution:** Analyzes language usage by bytes and repository count, generating tech radars and language mix bars for both global and organizational contexts.
- **Work Rhythm Analysis:** Visualizes daily and hourly contribution patterns through punch cards and weekly activity charts.
- **Milestone Tracking:** Identifies and highlights repositories reaching significant commit milestones.
- **Organization-Specific Reports:** Generates dedicated Markdown files and SVG assets for each tracked organization, offering a focused view of its projects and activity.
- **Automated Updates:** Designed to run periodically via GitHub Actions, ensuring metrics are always up-to-date.

## ⚙️ How it Works (Architecture & Data Flow)
The tracker operates through a client-server architecture, orchestrated by a GitHub Action:

1.  **`scripts/fetchStats.js` (Client-side Orchestrator):**
    *   Initiates the data fetching process by calling the Next.js API route (`/api/github-stats`).
    *   Performs an iterative fetch, first for core profile data (`mode=core`), then for each year of contribution history (`mode=year`), accumulating data with each call.
    *   Finally, it sends the complete aggregated data back to the API in `mode=save` for final enrichment and persistence.
    *   Includes retry logic for API calls and logs payload sizes to help diagnose potential data truncation issues.

2.  **`pages/api/github-stats.ts` (Next.js API Route - Server-side Processor):**
    *   Acts as the backend for the `fetchStats.js` script.
    *   Receives iterative data payloads from the client.
    *   Calls `buildAnalytics` to process the data based on the `mode` (core, year, save).
    *   In `mode=save`, it performs the final data enrichment (e.g., fetching branch details for top repos, calculating health scores) and then commits the complete `FullGithubAnalytics` JSON object to a specified GitHub repository (`data/dev-metrics.json`).
    *   Handles authentication and authorization using `API_SECRET_TOKEN`.

3.  **`utils/github/buildAnalytics.ts` (Core Analytics Engine):**
    *   The heart of the data processing.
    *   Fetches owned and contributed repositories, filters them based on configuration (ignored repos, included organizations).
    *   Aggregates commit data, language statistics, and activity patterns across all years.
    *   Calculates streaks, estimated lines of code, and repository classifications.
    *   **Crucially, in `mode=save`, it performs the final, expensive enrichment steps:**
        *   Identifies the top 5 most active repositories per organization based on commit volume.
        *   Calls `fetchRepoBranches` for these top repositories to get detailed branch commit counts.
        *   Calculates the `healthScore` for each project based on monthly activity consistency.
    *   Ensures data integrity and persistence across iterative calls by merging `accumulatedData`.

4.  **`utils/github/fetchRepos.ts` (GitHub API Wrapper):**
    *   Contains functions (`fetchOwnedRepos`, `fetchContributedRepos`, `fetchRepoBranches`) to interact with the GitHub GraphQL API.
    *   Optimized to fetch only necessary data to avoid rate limits and large payloads.
    *   `fetchRepoBranches` specifically targets branch data for individual repositories.

5.  **`scripts/visualizer.js` (SVG Generator):**
    *   Contains functions to generate various SVG charts based on the processed analytics data.
    *   Uses a consistent dark mode color palette.

6.  **`scripts/sections.js` (Markdown Builder):**
    *   Constructs the `WORK_TRACKER.md` and organization-specific Markdown files using the processed data and generated SVG assets.

## 🖼️ Metrics & Visualizations Generated
*   `summary-card.svg`: Developer Snapshot (Total Commits, Streak, LOC, Age)
*   `milestones.svg`: Recent Milestones (Top repos by commit volume)
*   `org-distribution.svg`: Commits per Organization (Pie Chart)
*   `category-distribution.svg`: Work by Domain (Donut Chart)
*   `tech-radar.svg`: Technology Proficiency (Radar Chart)
*   `punch-card.svg`: Workday Rhythm (Hourly/Daily Heatmap)
*   `weekly-activity.svg`: Contribution Intensity (Weekly Bar Chart)
*   `contribution-growth.svg`: Lifetime Contribution Growth (Line Chart)
*   `pulse-[org-slug].svg`: Organization Repository Pulse (Sparklines for each repo)
*   `lang-bar-[org-slug].svg`: Organization Tech Mix (Language distribution bar)
*   `radar-[org-slug].svg`: Organization Stack Radar (Tech proficiency for org)
*   `branch-[org-slug]-[repo-slug].svg`: Branch Activity (Bar chart for top 5 repo branches)

## 🛠️ Tech Stack

- **Frontend:** Next.js (Pages Router) & HeroUI (for the API route)
- **Styling:** Tailwind CSS & Framer Motion (for the portfolio website, not directly this tracker)
- **Data Fetching:** GitHub GraphQL API (v4) & REST API
- **Automation:** GitHub Actions for periodic data synchronization
- **Language:** TypeScript

## ⚙️ Configuration
This project requires several environment variables to function correctly. These should be set in your GitHub Actions workflow or a `.env.local` file if running locally.

*   `GITHUB_TOKEN`: A GitHub Personal Access Token (PAT) with `repo` and `user` scopes. This is used to fetch repository and contribution data.
*   `GITHUB_USERNAME`: Your GitHub username.
*   `API_SECRET_TOKEN`: A secret token used to secure the Next.js API route. This should be a strong, randomly generated string.
*   `STATS_URL`: The full URL to your deployed Next.js API route (e.g., `https://your-domain.com/api/github-stats`).
*   `IGNORED_REPOS` (Optional): A comma-separated list of repository names or full names (e.g., `my-private-repo,another-org/old-project`) to exclude from analytics.
*   `INCLUDED_ORGS` (Optional): A comma-separated list of organization logins (e.g., `MyOrg,AnotherOrg`) to include in the analytics. If empty, all public repos and owned private repos are included.
*   `MAX_REPOS` (Optional): An integer to limit the number of repositories processed (default: 0, meaning no limit).

## 🚀 Getting Started

1.  **Clone the `work-tracker` repository:**
    ```bash
    git clone https://github.com/your-username/work-tracker.git
    cd work-tracker
    ```
2.  **Install Dependencies:**
   ```bash
   npm install
   ```
3.  **Set up Environment Variables:**
    Create a `.env.local` file in the root of the `work-tracker` project with the required variables:
    ```
    GITHUB_TOKEN=your_github_personal_access_token
    GITHUB_USERNAME=your_github_username
    API_SECRET_TOKEN=a_strong_random_secret_token
    STATS_URL=http://localhost:3000/api/github-stats # For local development
    # STATS_URL=https://your-deployed-domain.com/api/github-stats # For deployed version
    # IGNORED_REPOS=repo-to-ignore,another-repo
    # INCLUDED_ORGS=MyOrg,AnotherOrg
    # MAX_REPOS=50
    ```
4.  **Deploy the Next.js API Route:**
    The `pages/api/github-stats.ts` file is part of your `portfolio` project. Ensure this project is deployed (e.g., to Vercel) and accessible via a public URL. Update `STATS_URL` in your `.env.local` accordingly.

5.  **Run the Tracker Locally:**
    First, ensure your `portfolio` project (which hosts the API route) is running locally:
    ```bash
    # In your portfolio project directory
    npm run dev
    ```
    Then, in your `work-tracker` project directory:
    ```bash
    npm start # This runs the scripts/index.js
    ```
    This will generate the `WORK_TRACKER.md` and SVG files in your `work-tracker` directory.

6.  **Automate with GitHub Actions:**
    Configure a GitHub Action workflow (e.g., `.github/workflows/update-tracker.yml`) in your `work-tracker` repository to run `npm start` periodically. Ensure your `GITHUB_TOKEN`, `GITHUB_USERNAME`, `API_SECRET_TOKEN`, and `STATS_URL` are set as secrets in your GitHub repository.
