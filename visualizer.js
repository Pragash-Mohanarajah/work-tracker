const getStyles = () => `
  <style>
    .card-bg { fill: #ffffff; stroke: #d0d7de; }
    .text-main { fill: #24292f; font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif; }
    .text-sub { fill: #57606a; font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif; }
    .accent { fill: #0969da; }
    .accent-stroke { stroke: #0969da; }
    .grid-line { stroke: #d0d7de; }
    @media (prefers-color-scheme: dark) {
      .card-bg { fill: #0d1117; stroke: #30363d; }
      .text-main { fill: #f0f6fc; }
      .text-sub { fill: #8b949e; }
      .accent { fill: #58a6ff; }
      .accent-stroke { stroke: #58a6ff; }
      .grid-line { stroke: #30363d; }
    }
  </style>
`;

/**
 * Generates a modern Donut Chart for better legibility
 */
function generatePieChartSvg(data, title) {
  const width = 395;
  const height = 260;
  const radius = 80;
  const innerRadius = 50; // Donut hole
  const centerX = 120;
  const centerY = 130;

  const total = data.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = 0;
  const colors = ["#58a6ff", "#3fb950", "#f0883e", "#bc8cff", "#ff7b72"];

  const paths = data.map((item, i) => {
    const sliceAngle = (item.value / total) * 2 * Math.PI;
    const x1 = centerX + radius * Math.cos(currentAngle);
    const y1 = centerY + radius * Math.sin(currentAngle);
    currentAngle += sliceAngle;
    const x2 = centerX + radius * Math.cos(currentAngle);
    const y2 = centerY + radius * Math.sin(currentAngle);

    const ix1 = centerX + innerRadius * Math.cos(currentAngle);
    const iy1 = centerY + innerRadius * Math.sin(currentAngle);
    const ix2 = centerX + innerRadius * Math.cos(currentAngle - sliceAngle);
    const iy2 = centerY + innerRadius * Math.sin(currentAngle - sliceAngle);

    const largeArcFlag = sliceAngle > Math.PI ? 1 : 0;
    const pathData = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${ix2} ${iy2} Z`;
    
    return `<path d="${pathData}" fill="${colors[i % colors.length]}" class="card-bg" stroke-width="2" />`;
  });

  const legend = data.map((item, i) => {
    const y = 60 + i * 22;
    return `
      <rect x="260" y="${y}" width="12" height="12" fill="${colors[i % colors.length]}" rx="3" />
      <text x="280" y="${y + 10}" class="text-sub" font-size="12">${item.label}</text>
    `;
  });

  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      ${getStyles()}
      <rect width="100%" height="100%" class="card-bg" rx="10" />
      <text x="20" y="35" class="text-main" font-size="16" font-weight="bold">${title}</text>
      ${paths.join("")}
      ${legend.join("")}
    </svg>
  `;
}

/**
 * Generates a stacked activity bar for branches
 */
function generateBranchActivitySvg(branches) {
  const width = 800;
  const barHeight = 20;
  const gap = 12;
  const height = Math.max(branches.length * (barHeight + gap) + 60, 100);

  if (!branches || branches.length === 0) {
    return `
      <svg width="${width}" height="80" xmlns="http://www.w3.org/2000/svg">
        ${getStyles()}
        <rect width="100%" height="100%" class="card-bg" rx="10" />
        <text x="50%" y="50%" text-anchor="middle" class="text-sub" font-size="12">Branch commit breakdown not available for this project</text>
      </svg>
    `;
  }

  const maxCommits = Math.max(...branches.map(b => b.commits), 1);

  const rows = branches.map((branch, i) => {
    const y = 50 + i * (barHeight + gap);
    const barWidth = (branch.commits / maxCommits) * 550;
    return `
      <text x="20" y="${y + 14}" class="text-sub" font-family="monospace" font-size="12">${branch.name.slice(0, 15)}</text>
      <rect x="150" y="${y}" width="${barWidth}" height="${barHeight}" class="accent" rx="4" />
      <text x="${160 + barWidth}" y="${y + 14}" class="text-sub" font-size="11">${branch.commits} commits</text>
    `;
  });

  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      ${getStyles()}
      <rect width="100%" height="100%" class="card-bg" rx="10" />
      <text x="20" y="30" class="text-main" font-size="16" font-weight="bold">Branch Contribution</text>
      ${rows.join("")}
    </svg>
  `;
}

/**
 * Generates a Radar (Spider) Chart for Tech Stack Expertise
 */
function generateRadarChartSvg(data, title) {
  const width = 395;
  const height = 340;
  const center = width / 2;
  const radius = 90;
  const angleStep = (Math.PI * 2) / data.length;

  // Calculate points
  const maxValue = Math.max(...data.map(d => d.value), 1);
  const points = data.map((d, i) => {
    const r = (d.value / maxValue) * radius;
    const x = center + r * Math.cos(i * angleStep - Math.PI / 2);
    const y = center + r * Math.sin(i * angleStep - Math.PI / 2);
    return `${x},${y}`;
  }).join(" ");

  // Web background (concentric octagons/circles)
  const webs = [0.25, 0.5, 0.75, 1].map(factor => {
    const r = radius * factor;
    const p = data.map((_, i) => {
      const x = center + r * Math.cos(i * angleStep - Math.PI / 2);
      const y = center + r * Math.sin(i * angleStep - Math.PI / 2);
      return `${x},${y}`;
    }).join(" ");
    return `<polygon points="${p}" fill="none" class="grid-line" stroke-width="1" />`;
  });

  // Labels
  const labels = data.map((d, i) => {
    const x = center + (radius + 30) * Math.cos(i * angleStep - Math.PI / 2);
    const y = center + (radius + 15) * Math.sin(i * angleStep - Math.PI / 2);
    return `<text x="${x}" y="${y}" text-anchor="middle" class="text-sub" font-size="11" font-weight="500">${d.label}</text>`;
  });

  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      ${getStyles()}
      <rect width="100%" height="100%" class="card-bg" rx="10" />
      <text x="20" y="35" class="text-main" font-size="16" font-weight="bold">${title}</text>
      ${webs.join("")}
      <polygon points="${points}" fill="rgba(88, 166, 255, 0.25)" class="accent-stroke" stroke-width="2.5" />
      ${labels.join("")}
    </svg>
  `;
}

/**
 * Generates a Punch Card (Hour vs Day)
 */
function generatePunchCardSvg(matrix) {
  const width = 800;
  const height = 280;
  const padding = 40;
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  const cellWidth = (width - padding * 3) / 24;
  const cellHeight = (height - padding * 2) / 7;

  let max = 0;
  matrix.forEach(day => day.forEach(hour => { if (hour > max) max = hour; }));

  const circles = [];
  matrix.forEach((dayRow, d) => {
    dayRow.forEach((val, h) => {
      if (val === 0) return;
      const r = (val / max) * (Math.min(cellWidth, cellHeight) / 2);
      const cx = padding + h * cellWidth + cellWidth / 2;
      const cy = padding + d * cellHeight + cellHeight / 2;
      circles.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="#7bc96f" opacity="0.8" />`);
    });
  });

  const dayLabels = days.map((day, i) => 
    `<text x="${padding - 10}" y="${padding + i * cellHeight + cellHeight / 2 + 4}" text-anchor="end" class="text-sub" font-size="9">${day}</text>`
  );

  const hourLabels = [0, 6, 12, 18, 23].map(h => 
    `<text x="${padding + h * cellWidth + cellWidth / 2}" y="${height - padding + 15}" text-anchor="middle" class="text-sub" font-size="9">${h}h</text>`
  );

  // Legend
  const legendY = height - 20;
  const legendX = width - 180;
  const legendItems = [0.25, 0.5, 0.75, 1].map((f, i) => {
    const r = f * (Math.min(cellWidth, cellHeight) / 2);
    const x = legendX + i * 40;
    return `
      <circle cx="${x}" cy="${legendY}" r="${r}" fill="#7bc96f" opacity="0.8" />
      <text x="${x + 12}" y="${legendY + 4}" class="text-sub" font-size="9">${Math.round(f * max)}</text>
    `;
  });

  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      ${getStyles()}
      <rect width="100%" height="100%" class="card-bg" rx="10" />
      <text x="20" y="30" class="text-main" font-size="16" font-weight="bold">Workday Rhythm (Punch Card)</text>
      ${dayLabels.join("")}
      ${hourLabels.join("")}
      ${circles.join("")}
      <text x="${legendX - 50}" y="${legendY + 4}" class="text-sub" font-size="9">Commits:</text>
      ${legendItems.join("")}
    </svg>
  `;
}

/**
 * Generates a chart for Top Contributors in a team setting
 */
function generateTopContributorsSvg(contributors, title = "Top Contributors") {
  const width = 395;
  const rowHeight = 35;
  const height = contributors.length * rowHeight + 50;
  const maxCommits = Math.max(...contributors.map(c => c.commits), 1);

  const rows = contributors.map((c, i) => {
    const y = 40 + i * rowHeight;
    const barWidth = (c.commits / maxCommits) * 200;
    return `
      <text x="10" y="${y + 20}" class="text-main" font-size="12" font-weight="500">${c.name}</text>
      <rect x="120" y="${y + 8}" width="${barWidth}" height="15" fill="#239a3b" rx="2" />
      <text x="${125 + barWidth}" y="${y + 20}" class="text-sub" font-size="11">${c.commits} commits</text>
    `;
  });

  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      ${getStyles()}
      <rect width="100%" height="100%" class="card-bg" rx="10" />
      <text x="10" y="25" class="text-main" font-size="14" font-weight="bold">${title}</text>
      ${rows.join("")}
    </svg>
  `;
}

/**
 * Efficiently showcases activity across many repositories using Sparklines
 */
function generateOrgSparklinesSvg(repos, orgName) {
  const width = 800;
  const rowHeight = 30;
  const height = repos.length * rowHeight + 60;

  const rows = repos.map((repo, i) => {
    const y = 50 + i * rowHeight;
    const activity = repo.monthlyActivity || Array(12).fill(0);
    const maxAct = Math.max(...activity, 1);
    
    // Generate sparkline path
    const points = activity.map((val, j) => {
      const px = 550 + (j * (150 / 11));
      const py = y + 20 - (val / maxAct) * 15;
      return `${px},${py}`;
    }).join(" ");

    return `
      <text x="10" y="${y + 15}" class="text-main" font-family="monospace" font-size="11">${repo.name.slice(0, 35)}</text>
      <polyline points="${points}" fill="none" class="accent-stroke" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      <text x="780" y="${y + 15}" class="text-sub" font-size="9" text-anchor="end">${repo.totalCommits}</text>
    `;
  });

  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      ${getStyles()}
      <rect width="100%" height="100%" class="card-bg" rx="6" />
      <text x="15" y="25" class="text-main" font-size="14" font-weight="bold">${orgName} Repository Pulse</text>
      <text x="15" y="42" class="text-sub" font-size="10">Repository Name</text>
      <text x="550" y="42" class="text-sub" font-size="10">12 Month Activity</text>
      <text x="780" y="42" class="text-sub" font-size="10" text-anchor="end">Total</text>
      ${rows.join("")}
    </svg>
  `;
}

/**
 * Generates a thin horizontal language distribution bar (GitHub style)
 */
function generateLanguageBarSvg(languages, title) {
  const width = 800;
  const height = 100;
  const barHeight = 12;
  const colors = ["#58a6ff", "#3fb950", "#f0883e", "#bc8cff", "#ff7b72", "#6e7681"];
  
  const total = Object.values(languages).reduce((a, b) => a + b, 0);
  const sorted = Object.entries(languages).sort((a, b) => b[1] - a[1]).slice(0, 6);
  
  let xOffset = 20;
  const barWidth = width - 40;
  
  const segments = sorted.map(([name, value], i) => {
    const w = (value / total) * barWidth;
    const rect = `<rect x="${xOffset}" y="50" width="${w}" height="${barHeight}" fill="${colors[i % colors.length]}" />`;
    xOffset += w;
    return rect;
  });

  const legend = sorted.map(([name, value], i) => {
    const pct = ((value / total) * 100).toFixed(1);
    return `
      <circle cx="${20 + (i * 80)}" cy="80" r="4" fill="${colors[i % colors.length]}" />
      <text x="${30 + (i * 80)}" y="83" class="text-sub" font-size="10">${name} ${pct}%</text>
    `;
  });

  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      ${getStyles()}
      <rect width="100%" height="100%" class="card-bg" rx="10" />
      <text x="20" y="30" class="text-main" font-size="16" font-weight="bold">${title}</text>
      ${segments.join("")}
      ${legend.join("")}
    </svg>
  `;
}

/**
 * Generates a simple bar chart for weekly activity
 */
function generateWeeklyActivitySvg(daysData, title) {
  const width = 395;
  const height = 280;
  const barWidth = 35;
  const gap = 15;
  const padding = 50;
  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  
  const max = Math.max(...daysData, 1);
  const chartHeight = height - padding * 2;

  const bars = daysData.map((val, i) => {
    const h = (val / max) * chartHeight;
    const x = 40 + i * (barWidth + gap);
    const y = height - 40 - h;
    return `
      <rect x="${x}" y="${y}" width="${barWidth}" height="${h}" fill="#3fb950" rx="4" />
      <text x="${x + barWidth / 2}" y="${height - 20}" text-anchor="middle" class="text-sub" font-size="11">${dayNames[i]}</text>
    `;
  });

  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      ${getStyles()}
      <rect width="100%" height="100%" class="card-bg" rx="10" />
      <text x="20" y="35" class="text-main" font-size="16" font-weight="bold">${title}</text>
      ${bars.join("")}
    </svg>
  `;
}

/**
 * Generates a Line Chart for cumulative contribution growth
 */
function generateContributionLineSvg(history, title) {
  const width = 800;
  const height = 260;
  const padding = 40;
  
  if (!history || history.length < 2) return "";

  const maxCommits = Math.max(...history.map(h => h.total), 1);
  const points = history.map((h, i) => {
    const x = padding + (i / (history.length - 1)) * (width - padding * 2);
    const y = height - padding - (h.total / maxCommits) * (height - padding * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");

  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      ${getStyles()}
      <rect width="100%" height="100%" class="card-bg" rx="10" />
      <text x="20" y="30" class="text-main" font-size="16" font-weight="bold">${title}</text>
      
      <!-- Grid lines -->
      <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" class="grid-line" />
      <line x1="${padding}" y1="${padding}" x2="${padding}" y2="${height - padding}" class="grid-line" />
      
      <!-- Area under line -->
      <polyline points="${padding},${height - padding} ${points} ${width - padding},${height - padding}" fill="rgba(56, 139, 253, 0.1)" />
      
      <!-- The Line -->
      <polyline points="${points}" fill="none" class="accent-stroke" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
      
      <text x="${padding}" y="${height - 15}" class="text-sub" font-size="10">${history[0].date.split('-')[0]}</text>
      <text x="${width - padding}" y="${height - 15}" text-anchor="end" class="text-sub" font-size="10">${history[history.length-1].date.split('-')[0]}</text>
    </svg>
  `;
}

/**
 * Generates a legend-focused donut for Categories
 */
function generateCategoryDonutSvg(categories, title) {
  const data = Object.entries(categories)
    .sort((a, b) => b[1] - a[1])
    .map(([label, value]) => ({ label, value }));
    
  return generatePieChartSvg(data, title);
}

/**
 * Generates a Summary Card for landing pages
 */
function generateSummaryCardSvg(stats) {
  const width = 800;
  const height = 120;
  
  const items = [
    { label: "Total Commits", value: stats.totalCommits },
    { label: "Streak", value: stats.streak + " Days" },
    { label: "Estimated LOC", value: (stats.loc / 1000).toFixed(1) + "k" },
    { label: "Account Age", value: stats.age + " Days" }
  ];

  const columns = items.map((item, i) => {
    const x = 30 + (i * 195);
    return `
      <text x="${x}" y="65" class="text-sub" font-size="10" text-anchor="start">${item.label}</text>
      <text x="${x}" y="85" class="text-main" font-size="18" font-weight="800" text-anchor="start">${item.value}</text>
    `;
  });

  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      ${getStyles()}
      <rect width="100%" height="100%" class="card-bg" rx="12" />
      <text x="20" y="30" class="text-main" font-size="14" font-weight="bold">Pragash's Developer Snapshot</text>
      <line x1="20" y1="45" x2="780" y2="45" class="grid-line" stroke-dasharray="2,2" />
      ${columns.join("")}
    </svg>
  `;
}

/**
 * Generates a Milestone Card
 */
function generateMilestonesSvg(milestones) {
  const width = 395;
  const height = 180;
  
  const rows = milestones.map((m, i) => {
    const y = 60 + (i * 22);
    return `
      <circle cx="30" cy="${y - 4}" r="3" class="accent" />
      <text x="45" y="${y}" class="text-main" font-size="12" font-weight="500">${m.repo.split('/').pop()}</text>
      <text x="375" y="${y}" class="text-sub" font-size="11" text-anchor="end">${m.level}+ commits</text>
    `;
  });

  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      ${getStyles()}
      <rect width="100%" height="100%" class="card-bg" rx="12" />
      <text x="20" y="30" class="text-main" font-size="16" font-weight="bold">🏆 Recent Milestones</text>
      <text x="20" y="45" class="text-sub" font-size="11">Top repositories by contribution volume</text>
      ${rows.join("")}
    </svg>
  `;
}

module.exports = { 
  generatePieChartSvg, generateBranchActivitySvg, generateRadarChartSvg, 
  generatePunchCardSvg, generateTopContributorsSvg, generateOrgSparklinesSvg,
  generateLanguageBarSvg, generateWeeklyActivitySvg,
  generateContributionLineSvg, generateCategoryDonutSvg,
  generateSummaryCardSvg, generateMilestonesSvg
};