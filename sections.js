const { generatePieChartSvg, generateBranchActivitySvg, generateRadarChartSvg, generatePunchCardSvg, generateTopContributorsSvg, generateOrgSparklinesSvg, generateLanguageBarSvg, generateWeeklyActivitySvg } = require("./visualizer");

function buildWorkTrackerSection(data) {
  const organizations = data?.organizations || [];
  
  const orgDistribution = organizations.map(org => ({
    label: org.name,
    value: org.totalCommits || 0
  }));

  let markdown = [
    "## 🏢 Work & Organizational Tracker",
    "Detailed breakdown of contributions across professional and personal entities.",
    "",
    "### 📊 Contribution by Organization",
    "!Org Distribution",
    "",
    "### 🕸️ Tech Stack Breadth",
    "!Language Radar",
    "",
    "### ⏰ Working Rhythm",
    '<p align="center">',
    '  <img src="./punch-card.svg" width="400" />',
    '  <img src="./weekly-activity.svg" width="300" />',
    '</p>',
    ""
  ];
  if (data.teamProject) {
    markdown.push("### 🤝 Team Collaboration", "!Top Contributors", "");
  }
  
  markdown.push("---");

  organizations.forEach(org => {
    const orgSlug = org.name.toLowerCase().replace(/\s/g, '-');
    markdown.push(`#### 🏛️ ${org.name}`);
    markdown.push(`- **Total Repositories:** ${org.repos.length}`);
    markdown.push(`- **Primary Stack:** ${org.topLanguages.join(", ")}`);
    markdown.push("");
    
    markdown.push(`!${org.name} Language Mix`);
    markdown.push(`<img src="./lang-bar-${orgSlug}.svg" width="100%" />`);
    markdown.push(`<p align="center">`);
    markdown.push(`  <img src="./pulse-${orgSlug}.svg" width="400" />`);
    markdown.push(`  <img src="./radar-${orgSlug}.svg" width="300" />`);
    markdown.push(`</p>`);
    markdown.push("");
    
    org.repos.slice(0, 3).forEach(repo => {
      markdown.push(`##### 📦 ${repo.name}`);
      markdown.push(`> ${repo.description || "No description provided."}`);
      markdown.push("");
      markdown.push(`!Branch Activity for ${repo.name}`);
      markdown.push("");
    });
    
    markdown.push("---");
  });

  return markdown.join("\n");
}

module.exports = { buildWorkTrackerSection };