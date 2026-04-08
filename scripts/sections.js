function buildGlobalOverview(data) {
  let markdown = [
    "## 🏢 Work & Organizational Tracker",
    '<p align="center">',
    '  <img src="./summary-card.svg" width="800" alt="Developer Snapshot" />',
    '</p>',
    "Detailed breakdown of contributions across professional and personal entities.",
    "",
    "### 📊 High-Level Metrics",
    '<p align="center">',
    '  <img src="./contribution-growth.svg" width="800" alt="Lifetime Contribution Growth" />',
    '</p>',
    '<p align="center">',
    '  <img src="./org-distribution.svg" width="395" alt="Commits per Organization" />',
    '  <img src="./category-distribution.svg" width="395" alt="Work by Domain" />',
    '</p>',
    "",
    "### 🕸️ Expertise & Milestones",
    '<p align="center">',
    '  <img src="./tech-radar.svg" width="395" alt="Technology Proficiency" />',
    '  <img src="./milestones.svg" width="395" alt="Recent Milestones" />',
    '</p>',
    "",
    "### ⏰ Working Rhythm",
    '<p align="center">',
    '  <img src="./punch-card.svg" width="800" alt="Workday Rhythm Punch Card" />',
    '</p>',
    '<p align="center">',
    '  <img src="./weekly-activity.svg" width="395" alt="Weekly Contribution Intensity" />',
    '</p>',
    ""
  ];
  if (data.teamProject) {
    markdown.push("### 🤝 Team Collaboration");
    markdown.push('<p align="center"><img src="./top-contributors.svg" width="395" alt="Top Contributors" /></p>', "");
  }
  
  return markdown.join("\n");
}

function buildOrgSection(org) {
  const orgSlug = org.name.toLowerCase().replace(/\s/g, '-');
  let markdown = [
    `# 🏛️ ${org.name} Contribution Report`,
    `- **Total Repositories:** ${org.repos.length}`,
    `- **Primary Stack:** ${org.topLanguages.join(", ")}`,
    "",
    `<img src="./lang-bar-${orgSlug}.svg" width="800" alt="${org.name} Tech Mix" />`,
    `<p align="center">`,
    `  <img src="./pulse-${orgSlug}.svg" width="800" alt="${org.name} Repository Pulse" />`,
    `</p>`,
    `<p align="center">`,
    `  <img src="./radar-${orgSlug}.svg" width="395" alt="${org.name} Stack Radar" />`,
    `</p>`,
    "",
    "### 📦 Key Projects",
    ""
  ];

  org.repos.slice(0, 5).forEach(repo => {
    markdown.push(`#### 📦 ${repo.name}`);
    markdown.push(`> ${repo.description || "No description provided."}`);
    const branchFileName = `branch-${org.name}-${repo.name}.svg`;
    markdown.push(`<p align="center"><img src="./${branchFileName}" width="800" alt="Branch Activity for ${repo.name}" /></p>`);
    markdown.push("");
  });

  return markdown.join("\n");
}

module.exports = { buildGlobalOverview, buildOrgSection };