/**
 * Generates a simple SVG Pie Chart for Organization/Project distribution
 */
function generatePieChartSvg(data, title) {
  const width = 400;
  const height = 200;
  const radius = 70;
  const centerX = 100;
  const centerY = 100;

  const total = data.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = 0;
  const colors = ["#388bfd", "#7bc96f", "#f97316", "#8b5cf6", "#ec4899"];

  const paths = data.map((item, i) => {
    const sliceAngle = (item.value / total) * 2 * Math.PI;
    const x1 = centerX + radius * Math.cos(currentAngle);
    const y1 = centerY + radius * Math.sin(currentAngle);
    currentAngle += sliceAngle;
    const x2 = centerX + radius * Math.cos(currentAngle);
    const y2 = centerY + radius * Math.sin(currentAngle);

    const largeArcFlag = sliceAngle > Math.PI ? 1 : 0;
    const pathData = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
    
    return `<path d="${pathData}" fill="${colors[i % colors.length]}" stroke="#1b1f23" stroke-width="1" />`;
  });

  const legend = data.map((item, i) => {
    const y = 40 + i * 20;
    return `
      <rect x="220" y="${y}" width="12" height="12" fill="${colors[i % colors.length]}" rx="2" />
      <text x="240" y="${y + 10}" fill="#999" font-family="sans-serif" font-size="11">${item.label} (${((item.value/total)*100).toFixed(1)}%)</text>
    `;
  });

  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <style>text { fill: #c9d1d9; }</style>
      <text x="10" y="20" font-family="sans-serif" font-size="14" font-weight="bold">${title}</text>
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
  const gap = 10;
  const height = branches.length * (barHeight + gap) + 40;

  const maxCommits = Math.max(...branches.map(b => b.commits), 1);

  const rows = branches.map((branch, i) => {
    const y = 30 + i * (barHeight + gap);
    const barWidth = (branch.commits / maxCommits) * 350;
    return `
      <text x="10" y="${y + 14}" fill="#999" font-family="monospace" font-size="12">${branch.name.padEnd(15)}</text>
      <rect x="150" y="${y}" width="${barWidth}" height="${barHeight}" fill="#388bfd" rx="3" />
      <text x="${160 + barWidth}" y="${y + 14}" fill="#666" font-family="sans-serif" font-size="11">${branch.commits} commits</text>
    `;
  });

  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <text x="10" y="20" font-family="sans-serif" font-size="14" font-weight="bold" fill="#c9d1d9">Branch Contribution (Latest)</text>
      ${rows.join("")}
    </svg>
  `;
}

/**
 * Generates a Radar (Spider) Chart for Tech Stack Expertise
 */
function generateRadarChartSvg(data, title) {
  const size = 300;
  const center = size / 2;
  const radius = 100;
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
    const x = center + (radius + 20) * Math.cos(i * angleStep - Math.PI / 2);
    const y = center + (radius + 15) * Math.sin(i * angleStep - Math.PI / 2);
    return `<text x="${x}" y="${y}" text-anchor="middle" fill="#8b949e" font-family="sans-serif" font-size="10">${d.label}</text>`;
  });

  return `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <text x="10" y="20" font-family="sans-serif" font-size="14" font-weight="bold" fill="#c9d1d9">${title}</text>
      ${webs.join("")}
      <polygon points="${points}" fill="rgba(56, 139, 253, 0.3)" stroke="#388bfd" stroke-width="2" />
      ${labels.join("")}
    </svg>
  `;
}

/**
 * Generates a Punch Card (Hour vs Day)
 */
function generatePunchCardSvg(matrix) {
  const width = 600;
  const height = 200;
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

  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <text x="10" y="20" font-family="sans-serif" font-size="14" font-weight="bold" fill="#c9d1d9">Workday Rhythm (Punch Card)</text>
      ${dayLabels.join("")}
      ${hourLabels.join("")}
      ${circles.join("")}
    </svg>
  `;
}

module.exports = { generatePieChartSvg, generateBranchActivitySvg, generateRadarChartSvg, generatePunchCardSvg };