const fs = require('fs');
let content = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');

// 1. Remove the injected sortedApplications and the broken tbody from 'applicants' tab
content = content.replace(/                    <\/thead>\s*const sortedApplications = \[\.\.\.data\]\.sort\(\(a, b\) => \{[\s\S]*?return dateB - dateA;\s*\}\);\s*<tbody className="divide-y divide-slate-100">\s*\{\(activeTab === 'applications' \? sortedApplications : data\)\.map\(\(row, i\) => \(\s*<tr key=\{i\}/, `                    </thead>\n                    <tbody className="divide-y divide-slate-100">\n                      {data.map((row, i) => (\n                        <tr key={i}`);

// 2. Put sortedApplications above return statement
const sortLogic = `
  const sortedApplications = [...data].sort((a, b) => {
    const scoreA = parseFloat(a.cvScore || a.CVScore) || 0;
    const scoreB = parseFloat(b.cvScore || b.CVScore) || 0;
    if (scoreB !== scoreA) return scoreB - scoreA;
    const dateA = new Date(a.createdAt || a.CreatedAt || 0).getTime();
    const dateB = new Date(b.createdAt || b.CreatedAt || 0).getTime();
    return dateB - dateA;
  });

  return (
`;

content = content.replace(/  return \(/, sortLogic);

// 3. Update the Applications tab rendering to use sortedApplications instead of data
content = content.replace(/<tbody className="divide-y divide-slate-100">\s*\{data\.map\(\(row, i\) => \(\s*<tr key=\{i\} className="hover:bg-slate-50">\s*<td className="px-6 py-4 font-bold text-mgm-dark">/, `<tbody className="divide-y divide-slate-100">\n                      {sortedApplications.map((row, i) => (\n                        <tr key={i} className="hover:bg-slate-50">\n                          <td className="px-6 py-4 font-bold text-mgm-dark">`);

fs.writeFileSync('src/pages/AdminDashboard.tsx', content);

