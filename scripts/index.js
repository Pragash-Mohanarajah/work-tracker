const fs = require("fs");
const path = require("path");
const { fetchStats } = require("./fetchStats");
const { buildGlobalOverview, buildOrgSection } = require("./sections");
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
  generateCategoryDonutSvg,
  generateSummaryCardSvg,
  generateMilestonesSvg
} = require("./visualizer");

async function runTracker() {
  console.log("🚀 Starting Work Tracker synchronization...");
  
  try {
    const rawData = await fetchStats();
    
    if (!rawData || !rawData.repositories || !rawData.repositories.projects) {
      throw new Error("Synchronization failed: Missing 'repositories' or 'projects' in aggregated data. This often indicates a server-side truncation or request body size limit being hit.");
    }

    console.log(`📦 Received data for ${rawData.repositories.projects.length} projects`);

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

      // Aggregate languages for the organization
      if (p.languages && Array.isArray(p.languages)) {
        p.languages.forEach(lang => {
          org.languages[lang.name] = (org.languages[lang.name] || 0) + lang.bytes;
        });
      }
    });

    // Determine top languages for each organization
    console.log("🧮 Aggregating organization metrics...");
    orgMap.forEach(org => {
      // Sort repositories within the organization by activity before finalizing
      org.repos.sort((a, b) => b.totalCommits - a.totalCommits);

      org.topLanguages = Object.entries(org.languages)
        .sort(([, bytesA], [, bytesB]) => bytesB - bytesA)
        .slice(0, 3)
        .map(([name]) => name);
    });

    const data = {
      ...rawData,
      organizations: Array.from(orgMap.values()).sort((a, b) => b.totalCommits - a.totalCommits)
    };
    console.log(`🏛️  Processed ${data.organizations.length} organizations`);

    // 0. Generate Summary Card
    const summaryStats = {
      totalCommits: data.commits.total,
      streak: data.activity.streak.current,
      loc: data.codeStats.estimatedLinesOfCode,
      age: data.profile.accountAgeDays
    };
    const summarySvg = generateSummaryCardSvg(summaryStats);
    fs.writeFileSync(path.resolve(process.cwd(), "summary-card.svg"), summarySvg);
    console.log("🖼️  Generated summary-card.svg");

    // 0.1 Generate Milestones
    const milestoneLevels = [1000, 500, 250, 100, 50, 10];
    const milestones = Object.entries(data.commits.byRepository)
      .map(([repo, count]) => ({
        repo,
        count,
        level: milestoneLevels.find(l => count >= l)
      }))
      .filter(m => m.level)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    const milestoneSvg = generateMilestonesSvg(milestones);
    fs.writeFileSync(path.resolve(process.cwd(), "milestones.svg"), milestoneSvg);
    console.log(`🏆 Generated milestones.svg with ${milestones.length} entries`);

    // --- GENERATE GRAPHICS ---
    console.log("🎨 Generating global charts...");
    
    // 1. Generate Org Distribution Chart
    const orgData = data.organizations.map(o => ({ label: o.name, value: o.totalCommits }));
    const orgSvg = generatePieChartSvg(orgData, "Commits per Organization");
    fs.writeFileSync(path.resolve(process.cwd(), "org-distribution.svg"), orgSvg);
    console.log("📊 Generated org-distribution.svg");

    // 1.1 Generate Tech Radar
    const langData = Object.entries(data?.analysis?.byLanguage || {})
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([label, value]) => ({ label, value }));
    const radarSvg = generateRadarChartSvg(langData, "Technology Proficiency");
    fs.writeFileSync(path.resolve(process.cwd(), "tech-radar.svg"), radarSvg);

    // 1.2 Generate Punch Card
    const punchCardMatrix = data?.analysis?.byDayHour || Array(7).fill(0).map(() => Array(24).fill(0));
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
      console.log(`🔍 Processing assets for organization: ${org.name}`);
      const orgSlug = org.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
      
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
      org.repos.slice(0, 5).forEach(repo => {
        const safeRepoName = repo.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
        const branchSvg = generateBranchActivitySvg(repo.branches || []);
        const fileName = `branch-${orgSlug}-${safeRepoName}.svg`;
        fs.writeFileSync(path.resolve(process.cwd(), fileName), branchSvg);
      });
    });

    // 3. Build and Save Markdown
    const trackerPath = path.resolve(process.cwd(), "WORK_TRACKER.md");
    fs.writeFileSync(trackerPath, buildGlobalOverview(data));
    console.log("📝 WORK_TRACKER.md updated");

    // 4. Save Org-specific MD files
    data.organizations.forEach(org => {
      const orgSlug = org.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const orgReport = buildOrgSection(org);
      const orgPath = path.resolve(process.cwd(), `${orgSlug}.md`);
      fs.writeFileSync(orgPath, orgReport);
      console.log(`📑 Generated report for ${org.name} at ${orgSlug}.md`);
    });
    
    console.log("✅ Work Tracker finalized successfully!");
  } catch (err) {
    console.error("❌ Tracker failed:", err);
    process.exit(1);
  }
}

runTracker();