const fs = require("fs");
const path = require("path");
const { fetchStats } = require("../dev-metrics/fetchStats"); // Reusing your existing fetch logic
const { buildWorkTrackerSection, generatePieChartSvg, generateBranchActivitySvg, generateRadarChartSvg, generatePunchCardSvg, generateTopContributorsSvg, generateOrgSparklinesSvg } = require("./sections");

async function runTracker() {
  console.log("🚀 Starting Work Tracker synchronization...");
  
  try {
    const data = await fetchStats(); // Assume this is expanded to return orgs/branches
    
    // 1. Generate Org Distribution Chart
    const orgData = data.organizations.map(o => ({ label: o.name, value: o.totalCommits }));
    const orgSvg = generatePieChartSvg(orgData, "Commits per Organization");
    fs.writeFileSync(path.resolve(process.cwd(), "org-distribution.svg"), orgSvg);

    // 1.1 Generate Tech Radar
    const langData = Object.entries(data?.analysis?.byLanguage || {})
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([label, value]) => ({ label, value }));
    const radarSvg = generateRadarChartSvg(langData, "Technology Proficiency");
    fs.writeFileSync(path.resolve(process.cwd(), "tech-radar.svg"), radarSvg);

    // 1.2 Generate Punch Card
    // We'll create a dummy matrix if real data is flat, or use data.analysis.punchCard if available
    const punchCardMatrix = data?.analysis?.punchCard || Array(7).fill(0).map(() => Array(24).fill(0));
    const punchCardSvg = generatePunchCardSvg(punchCardMatrix);
    fs.writeFileSync(path.resolve(process.cwd(), "punch-card.svg"), punchCardSvg);

    // 1.3 Generate Team Contributors (if applicable)
    if (data.teamProject) {
      const teamSvg = generateTopContributorsSvg(data.teamProject.contributors);
      fs.writeFileSync(path.resolve(process.cwd(), "top-contributors.svg"), teamSvg);
    }

    // 2. Generate Branch Charts for each Repo
    data.organizations.forEach(org => {
      // 2.1 Generate Organization Pulse (Sparklines)
      const pulseSvg = generateOrgSparklinesSvg(org.repos, org.name);
      const pulseFile = `pulse-${org.name.toLowerCase().replace(/\s/g, '-')}.svg`;
      fs.writeFileSync(path.resolve(process.cwd(), pulseFile), pulseSvg);

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