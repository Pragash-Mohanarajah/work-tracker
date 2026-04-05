const fs = require("fs");
const path = require("path");
const { fetchStats } = require("./fetchStats");
const { buildWorkTrackerSection } = require("./sections");
const {
  generatePieChartSvg,
  generateBranchActivitySvg,
  generateRadarChartSvg,
  generatePunchCardSvg,
  generateTopContributorsSvg,
  generateOrgSparklinesSvg,
  generateLanguageBarSvg,
  generateWeeklyActivitySvg,
  generateContributionLineSvg,
  generateCategoryDonutSvg
} = require("./visualizer");

async function runTracker() {
  console.log("🚀 Starting Work Tracker synchronization...");
  
  try {
    const rawData = await fetchStats();

    // Group repositories by Organization (Owner) for the tracker view
    const orgMap = new Map();
    rawData.repositories.projects.forEach(p => {
      if (!orgMap.has(p.owner)) {
        orgMap.set(p.owner, { 
          name: p.owner, 
          repos: [], 
          totalCommits: 0, 
          languages: {}, 
          topLanguages: [] 
        });
      }
      const org = orgMap.get(p.owner);
      const commits = rawData.commits.byRepository[p.fullName] || 0;
      org.repos.push({ ...p, totalCommits: commits });
      org.totalCommits += commits;
    });

    const data = {
      ...rawData,
      organizations: Array.from(orgMap.values()).sort((a, b) => b.totalCommits - a.totalCommits)
    };

    // --- GENERATE GRAPHICS ---
    
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

    // 1.3 Generate Weekly Activity
    const weeklyData = data?.analysis?.byDay || [0,0,0,0,0,0,0];
    const weeklySvg = generateWeeklyActivitySvg(weeklyData, "Contribution Intensity (Weekly)");
    fs.writeFileSync(path.resolve(process.cwd(), "weekly-activity.svg"), weeklySvg);

    // 1.3 Generate Team Contributors (if applicable)
    if (data.teamProject) {
      const teamSvg = generateTopContributorsSvg(data.teamProject.contributors);
      fs.writeFileSync(path.resolve(process.cwd(), "top-contributors.svg"), teamSvg);
    }

    // 1.4 Generate Growth Chart
    const growthSvg = generateContributionLineSvg(data.activity.commitHistory, "Lifetime Contribution Growth");
    fs.writeFileSync(path.resolve(process.cwd(), "contribution-growth.svg"), growthSvg);

    // 1.5 Generate Work Categories
    const categorySvg = generateCategoryDonutSvg(data.analysis.byCategory, "Work by Domain");
    fs.writeFileSync(path.resolve(process.cwd(), "category-distribution.svg"), categorySvg);

    // 2. Generate Branch Charts for each Repo
    data.organizations.forEach(org => {
      const orgSlug = org.name.toLowerCase().replace(/\s/g, '-');
      
      // 2.1 Generate Org-Specific Pulse
      const pulseSvg = generateOrgSparklinesSvg(org.repos, org.name);
      fs.writeFileSync(path.resolve(process.cwd(), `pulse-${orgSlug}.svg`), pulseSvg);

      // 2.1.1 Generate Org Language Bar
      const orgLangs = org.languages || {};
      const langBarSvg = generateLanguageBarSvg(orgLangs, `${org.name} Tech Mix`);
      fs.writeFileSync(path.resolve(process.cwd(), `lang-bar-${orgSlug}.svg`), langBarSvg);

      // 2.2 Generate Org-Specific Tech Radar
      const orgLangData = Object.entries(org.languages || {})
        .sort((a, b) => b[1] - a[1]).slice(0, 6)
        .map(([label, value]) => ({ label, value }));
      if (orgLangData.length > 2) {
        const orgRadar = generateRadarChartSvg(orgLangData, `${org.name} Stack`);
        fs.writeFileSync(path.resolve(process.cwd(), `radar-${orgSlug}.svg`), orgRadar);
      }

      // 2.3 Generate Repo Specific Branch Charts
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