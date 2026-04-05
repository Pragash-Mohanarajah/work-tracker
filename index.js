const fs = require("fs");
const path = require("path");
const { fetchStats } = require("../dev-metrics/fetchStats"); // Reusing your existing fetch logic
const { buildWorkTrackerSection, generatePieChartSvg, generateBranchActivitySvg } = require("./sections");

async function runTracker() {
  console.log("🚀 Starting Work Tracker synchronization...");
  
  try {
    const data = await fetchStats(); // Assume this is expanded to return orgs/branches
    
    // 1. Generate Org Distribution Chart
    const orgData = data.organizations.map(o => ({ label: o.name, value: o.totalCommits }));
    const orgSvg = generatePieChartSvg(orgData, "Commits per Organization");
    fs.writeFileSync(path.resolve(process.cwd(), "org-distribution.svg"), orgSvg);

    // 2. Generate Branch Charts for each Repo
    data.organizations.forEach(org => {
      org.repos.slice(0, 3).forEach(repo => {
        const branchSvg = generateBranchActivitySvg(repo.branches || []);
        const fileName = `branch-${org.name}-${repo.name}.svg`;
        fs.writeFileSync(path.resolve(process.cwd(), fileName), branchSvg);
      });
    });

    // 3. Build and Save Markdown
    const section = buildWorkTrackerSection(data);
    
    // If you want to save to a specific WORK_TRACKER.md instead of README
    const trackerPath = path.resolve(process.cwd(), "WORK_TRACKER.md");
    fs.writeFileSync(trackerPath, section);
    
    console.log("✅ Work Tracker finalized successfully!");
  } catch (err) {
    console.error("❌ Tracker failed:", err);
    process.exit(1);
  }
}

runTracker();