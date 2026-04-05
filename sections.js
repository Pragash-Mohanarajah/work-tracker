function buildWorkTrackerSection(data) {
  const organizations = data?.organizations || [];

  let markdown = [
    "## 🏢 Work & Organizational Tracker",
    "Detailed breakdown of contributions across professional and personal entities.",
    "",
    "### 📊 Contribution by Organization",
    '<p align="center"><img src="./org-distribution.svg" width="600" /></p>',
    "",
    "### 🕸️ Tech Stack Breadth",
    '<p align="center"><img src="./tech-radar.svg" width="400" /></p>',
    "",
    "### ⏰ Working Rhythm",
    '<p align="center">',
    '  <img src="./punch-card.svg" width="450" />',
    '  <img src="./weekly-activity.svg" width="350" />',
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

    markdown.push(`<img src="./lang-bar-${orgSlug}.svg" width="800" />`);
    markdown.push(`<p align="center">`);
    markdown.push(`  <img src="./pulse-${orgSlug}.svg" width="450" />`);
    markdown.push(`  <img src="./radar-${orgSlug}.svg" width="350" />`);
    markdown.push(`</p>`);
    markdown.push("");
    
    org.repos.slice(0, 3).forEach(repo => {
      markdown.push(`##### 📦 ${repo.name}`);
      markdown.push(`> ${repo.description || "No description provided."}`);
      const branchFileName = `branch-${org.name}-${repo.name}.svg`;
      markdown.push(`<img src="./${branchFileName}" width="500" />`);
      markdown.push("");
    });
    
    markdown.push("---");
  });

  return markdown.join("\n");
}

module.exports = { buildWorkTrackerSection };