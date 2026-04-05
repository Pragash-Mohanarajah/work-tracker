function buildWorkTrackerSection(data) {
  const organizations = data?.organizations || [];

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
  
  markdown.push("---");

  organizations.forEach(org => {
    const orgSlug = org.name.toLowerCase().replace(/\s/g, '-');
    markdown.push(`#### 🏛️ ${org.name}`);
    markdown.push(`- **Total Repositories:** ${org.repos.length}`);
    markdown.push(`- **Primary Stack:** ${org.topLanguages.join(", ")}`);
    markdown.push("");

    markdown.push(`<img src="./lang-bar-${orgSlug}.svg" width="800" alt="${org.name} Tech Mix" />`);
    markdown.push(`<p align="center">`);
    markdown.push(`  <img src="./pulse-${orgSlug}.svg" width="800" alt="${org.name} Repository Pulse" />`);
    markdown.push(`</p>`);
    markdown.push(`<p align="center">`);
    markdown.push(`  <img src="./radar-${orgSlug}.svg" width="395" alt="${org.name} Stack Radar" />`);
    markdown.push(`</p>`);
    markdown.push("");
    
    org.repos.slice(0, 3).forEach(repo => {
      markdown.push(`##### 📦 ${repo.name}`);
      markdown.push(`> ${repo.description || "No description provided."}`);
      const branchFileName = `branch-${org.name}-${repo.name}.svg`;
      markdown.push(`<p align="center"><img src="./${branchFileName}" width="800" alt="Branch Activity for ${repo.name}" /></p>`);
      markdown.push("");
    });
    
    markdown.push("---");
  });

  return markdown.join("\n");
}

module.exports = { buildWorkTrackerSection };