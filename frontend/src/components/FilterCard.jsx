const options = {
  workMode: ['Remote', 'Hybrid', 'On-site'],
  employmentType: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Temporary'],
  sortBy: ['createdAt', 'salary', 'deadline', 'title']
};

export default function FilterCard({ filters, onChange }) {
  const update = (event) => onChange({ ...filters, [event.target.name]: event.target.value });
  return <div className="rounded-md bg-white p-4 shadow-sm"><h1 className="mb-3 text-lg font-bold">Filter jobs</h1><div className="space-y-3"><label className="block text-sm">Search<input name="search" value={filters.search} onChange={update} placeholder="React, designer…" className="mt-1 h-10 w-full rounded border px-3" /></label><label className="block text-sm">Location<input name="location" value={filters.location} onChange={update} placeholder="Hyderabad" className="mt-1 h-10 w-full rounded border px-3" /></label>{Object.entries(options).map(([name, values]) => <label key={name} className="block text-sm">{name === 'workMode' ? 'Work mode' : name === 'employmentType' ? 'Employment type' : 'Sort by'}<select name={name} value={filters[name]} onChange={update} className="mt-1 h-10 w-full rounded border bg-white px-3"><option value="">Any</option>{values.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>)}<label className="block text-sm">Experience<input name="experienceLevel" value={filters.experienceLevel} onChange={update} placeholder="Entry, Senior…" className="mt-1 h-10 w-full rounded border px-3" /></label><label className="block text-sm">Skills<input name="skills" value={filters.skills} onChange={update} placeholder="React, Node.js" className="mt-1 h-10 w-full rounded border px-3" /></label><button type="button" className="text-sm text-[#6A38C2]" onClick={() => onChange({ search: '', location: '', workMode: '', employmentType: '', experienceLevel: '', skills: '', sortBy: 'createdAt', sortOrder: 'desc' })}>Clear filters</button></div></div>;
}
