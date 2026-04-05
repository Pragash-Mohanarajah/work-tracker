const { generatePieChartSvg, generateBranchActivitySvg } = require("./visualizer");

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
    ""
  ];

  organizations.forEach(org => {
    markdown.push(`#### 🏛️ ${org.name}`);
    markdown.push(`- **Total Repositories:** ${org.repos.length}`);
    markdown.push(`- **Primary Stack:** ${org.topLanguages.join(", ")}`);
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

module.exports = { buildWorkTrackerSection, generatePieChartSvg, generateBranchActivitySvg };