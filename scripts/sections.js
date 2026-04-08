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

  const organizations = data?.organizations || [];
  if (organizations.length > 0) {
    markdown.push("---", "### 🏛️ Organization Reports", "Explore detailed metrics for each organization:");
    organizations.forEach(org => {
      markdown.push(`- **${org.name}** — _${org.repos.length} repositories_`);
    });
  }
  
  return markdown.join("\n");
}

function buildOrgSection(org) {
  const orgSlug = org.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const hasRadar = Object.keys(org.languages || {}).length > 2;

  let markdown = [
    `# 🏛️ ${org.name} Contribution Report`,
    `- **Total Repositories:** ${org.repos.length}`,
    `- **Primary Stack:** ${org.topLanguages.join(", ")}`,
    "",
    `<img src="./lang-bar-${orgSlug}.svg" width="800" alt="${org.name} Tech Mix" />`,
    `<p align="center"><img src="./pulse-${orgSlug}.svg" width="800" alt="${org.name} Repository Pulse" /></p>`
  ];

  if (hasRadar) {
    markdown.push(`<p align="center"><img src="./radar-${orgSlug}.svg" width="395" alt="${org.name} Stack Radar" /></p>`);
  }

  markdown.push("", "### 📦 Key Projects", "");

  org.repos.slice(0, 5).forEach(repo => {
    const safeRepoName = repo.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    markdown.push(`#### 📦 ${repo.name}`);
    markdown.push(`> ${repo.description || "No description provided."}`);
    const branchFileName = `branch-${orgSlug}-${safeRepoName}.svg`;
    markdown.push(`<p align="center"><img src="./${branchFileName}" width="800" alt="Branch Activity for ${repo.name}" /></p>`);
    markdown.push("");
  });

  markdown.push("", "---", "⬅️ Back to Global Overview");
  return markdown.join("\n");
}

module.exports = { buildGlobalOverview, buildOrgSection };