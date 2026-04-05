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

module.exports = { generatePieChartSvg, generateBranchActivitySvg };