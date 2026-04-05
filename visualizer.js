/**
 * Generates a modern Donut Chart for better legibility
 */
function generatePieChartSvg(data, title) {
  const width = 440;
  const height = 240;
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
    
    return `<path d="${pathData}" fill="${colors[i % colors.length]}" stroke="#0d1117" stroke-width="2" />`;
  });

  const legend = data.map((item, i) => {
    const y = 60 + i * 22;
    return `
      <rect x="260" y="${y}" width="12" height="12" fill="${colors[i % colors.length]}" rx="3" />
      <text x="280" y="${y + 10}" fill="#8b949e" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial" font-size="12">${item.label}</text>
    `;
  });

  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#0d1117" rx="10" />
      <text x="20" y="35" fill="#f0f6fc" font-family="sans-serif" font-size="16" font-weight="bold">${title}</text>
      ${paths.join("")}
      ${legend.join("")}
    </svg>
  `;
}

/**
 * Generates a stacked activity bar for branches
 */
function generateBranchActivitySvg(branches) {
  const width = 540;
  const barHeight = 20;
  const gap = 12;
  const height = branches.length * (barHeight + gap) + 60;

  const maxCommits = Math.max(...branches.map(b => b.commits), 1);

  const rows = branches.map((branch, i) => {
    const y = 50 + i * (barHeight + gap);
    const barWidth = (branch.commits / maxCommits) * 350;
    return `
      <text x="20" y="${y + 14}" fill="#8b949e" font-family="monospace" font-size="12">${branch.name.slice(0, 15)}</text>
      <rect x="150" y="${y}" width="${barWidth}" height="${barHeight}" fill="#58a6ff" rx="4" />
      <text x="${160 + barWidth}" y="${y + 14}" fill="#7d8590" font-family="sans-serif" font-size="11">${branch.commits} commits</text>
    `;
  });

  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#0d1117" rx="10" />
      <text x="20" y="30" font-family="sans-serif" font-size="16" font-weight="bold" fill="#f0f6fc">Branch Contribution</text>
      ${rows.join("")}
    </svg>
  `;
}

/**
 * Generates a Radar (Spider) Chart for Tech Stack Expertise
 */
function generateRadarChartSvg(data, title) {
  const size = 340;
  const center = size / 2;
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
    return `<polygon points="${p}" fill="none" stroke="#30363d" stroke-width="1" />`;
  });

  // Labels
  const labels = data.map((d, i) => {
    const x = center + (radius + 30) * Math.cos(i * angleStep - Math.PI / 2);
    const y = center + (radius + 15) * Math.sin(i * angleStep - Math.PI / 2);
    return `<text x="${x}" y="${y}" text-anchor="middle" fill="#7d8590" font-family="sans-serif" font-size="11" font-weight="500">${d.label}</text>`;
  });

  return `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#0d1117" rx="10" />
      <text x="20" y="35" font-family="sans-serif" font-size="16" font-weight="bold" fill="#f0f6fc">${title}</text>
      ${webs.join("")}
      <polygon points="${points}" fill="rgba(88, 166, 255, 0.25)" stroke="#58a6ff" stroke-width="2.5" />
      ${labels.join("")}
    </svg>
  `;
}

/**
 * Generates a Punch Card (Hour vs Day)
 */
function generatePunchCardSvg(matrix) {
  const width = 600;
  const height = 240;
  const padding = 40;
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  const cellWidth = (width - padding * 2) / 24;
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
    `<text x="${padding - 10}" y="${padding + i * cellHeight + cellHeight / 2 + 4}" text-anchor="end" fill="#8b949e" font-family="sans-serif" font-size="9">${day}</text>`
  );

  const hourLabels = [0, 6, 12, 18, 23].map(h => 
    `<text x="${padding + h * cellWidth + cellWidth / 2}" y="${height - padding + 15}" text-anchor="middle" fill="#8b949e" font-family="sans-serif" font-size="9">${h}h</text>`
  );

  // Legend
  const legendY = height - 20;
  const legendX = width - 180;
  const legendItems = [0.25, 0.5, 0.75, 1].map((f, i) => {
    const r = f * (Math.min(cellWidth, cellHeight) / 2);
    const x = legendX + i * 40;
    return `
      <circle cx="${x}" cy="${legendY}" r="${r}" fill="#7bc96f" opacity="0.8" />
      <text x="${x + 12}" y="${legendY + 4}" fill="#666" font-family="sans-serif" font-size="9">${Math.round(f * max)}</text>
    `;
  });

  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <text x="10" y="20" font-family="sans-serif" font-size="14" font-weight="bold" fill="#c9d1d9">Workday Rhythm (Punch Card)</text>
      ${dayLabels.join("")}
      ${hourLabels.join("")}
      ${circles.join("")}
      <text x="${legendX - 40}" y="${legendY + 4}" fill="#8b949e" font-family="sans-serif" font-size="9">Commits:</text>
      ${legendItems.join("")}
    </svg>
  `;
}

/**
 * Generates a chart for Top Contributors in a team setting
 */
function generateTopContributorsSvg(contributors, title = "Top Contributors") {
  const width = 400;
  const rowHeight = 35;
  const height = contributors.length * rowHeight + 50;
  const maxCommits = Math.max(...contributors.map(c => c.commits), 1);

  const rows = contributors.map((c, i) => {
    const y = 40 + i * rowHeight;
    const barWidth = (c.commits / maxCommits) * 200;
    return `
      <text x="10" y="${y + 20}" fill="#c9d1d9" font-family="sans-serif" font-size="12" font-weight="500">${c.name}</text>
      <rect x="120" y="${y + 8}" width="${barWidth}" height="15" fill="#239a3b" rx="2" />
      <text x="${125 + barWidth}" y="${y + 20}" fill="#8b949e" font-family="sans-serif" font-size="11">${c.commits} commits</text>
    `;
  });

  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <text x="10" y="25" font-family="sans-serif" font-size="14" font-weight="bold" fill="#c9d1d9">${title}</text>
      ${rows.join("")}
    </svg>
  `;
}

/**
 * Efficiently showcases activity across many repositories using Sparklines
 */
function generateOrgSparklinesSvg(repos, orgName) {
  const width = 540;
  const rowHeight = 30;
  const height = repos.length * rowHeight + 60;

  const rows = repos.map((repo, i) => {
    const y = 50 + i * rowHeight;
    const activity = repo.monthlyActivity || Array(12).fill(0);
    const maxAct = Math.max(...activity, 1);
    
    // Generate sparkline path
    const points = activity.map((val, j) => {
      const px = 350 + (j * (150 / 11));
      const py = y + 20 - (val / maxAct) * 15;
      return `${px},${py}`;
    }).join(" ");

    return `
      <text x="10" y="${y + 15}" fill="#c9d1d9" font-family="monospace" font-size="11">${repo.name.slice(0, 35)}</text>
      <polyline points="${points}" fill="none" stroke="#388bfd" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      <text x="510" y="${y + 15}" fill="#666" font-family="sans-serif" font-size="9" text-anchor="end">${repo.totalCommits}</text>
    `;
  });

  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#0d1117" rx="6" />
      <text x="15" y="25" font-family="sans-serif" font-size="14" font-weight="bold" fill="#f0f6fc">${orgName} Repository Pulse</text>
      <text x="15" y="42" font-family="sans-serif" font-size="10" fill="#8b949e">Repository Name</text>
      <text x="350" y="42" font-family="sans-serif" font-size="10" fill="#8b949e">12 Month Activity</text>
      <text x="510" y="42" font-family="sans-serif" font-size="10" fill="#8b949e" text-anchor="end">Total</text>
      ${rows.join("")}
    </svg>
  `;
}

module.exports = { 
  generatePieChartSvg, generateBranchActivitySvg, generateRadarChartSvg, 
  generatePunchCardSvg, generateTopContributorsSvg, generateOrgSparklinesSvg 
};