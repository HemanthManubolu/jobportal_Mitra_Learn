const definitions = [
    ['JavaScript', /\bjava[\s._-]*script\b/i], ['TypeScript', /\btype[\s._-]*script\b/i], ['React', /\breact(?:[\s._-]*js)?\b/i],
    ['Next.js', /\bnext(?:[\s._-]*js)?\b/i], ['Node.js', /\bnode(?:[\s._-]*js)?\b/i], ['Express.js', /\bexpress(?:[\s._-]*js)?\b/i],
    ['Python', /\bpython\b/i], ['Java', /\bjava\b/i], ['C++', /(?:\bc\s*\+\+(?!\w)|\bcpp\b|\bc\s+plus\s+plus\b)/i], ['C#', /(?:\bc\s*#(?!\w)|\bcsharp\b|\bc\s+sharp\b)/i], ['C', /\bc\b/i],
    ['Go', /\b(?:go|golang)\b/i], ['PHP', /\bphp\b/i], ['Ruby', /\bruby\b/i], ['Kotlin', /\bkotlin\b/i], ['Swift', /\bswift\b/i],
    ['Angular', /\bangular(?:[\s._-]*js)?\b/i], ['Vue.js', /\bvue(?:[\s._-]*js)?\b/i], ['HTML5', /\bhtml(?:\s*5)?\b/i], ['CSS3', /\bcss(?:\s*3)?\b/i], ['Tailwind CSS', /\btailwind(?:[\s._-]*css)?\b/i],
    ['SQL', /\bsql\b/i], ['MySQL', /\bmy[\s._-]*sql\b/i], ['PostgreSQL', /\b(?:postgres|postgresql)\b/i], ['MongoDB', /\b(?:mongo|mongodb)\b/i], ['Redis', /\bredis\b/i], ['Firebase', /\bfirebase\b/i],
    ['AWS', /\b(?:aws|amazon\s+web\s+services)\b/i], ['Azure', /\bazure\b/i], ['Google Cloud', /\b(?:gcp|google\s+cloud(?:\s+platform)?)\b/i], ['Docker', /\bdocker\b/i], ['Kubernetes', /\b(?:kubernetes|k8s)\b/i],
    ['GitHub', /\bgithub\b/i], ['GitLab', /\bgitlab\b/i], ['Git', /\bgit\b/i], ['GraphQL', /\bgraphql\b/i], ['REST API', /\brest[\s._-]*api\b/i], ['FastAPI', /\bfast[\s._-]*api\b/i],
    ['Django', /\bdjango\b/i], ['Spring Boot', /\bspring[\s._-]*boot\b/i], ['.NET', /(?:\.net\b|\bdot[\s._-]*net\b)/i], ['Machine Learning', /\bmachine[\s._-]*learning\b/i], ['Deep Learning', /\bdeep[\s._-]*learning\b/i],
    ['TensorFlow', /\btensor[\s._-]*flow\b/i], ['PyTorch', /\bpy[\s._-]*torch\b/i], ['Pandas', /\bpandas\b/i], ['NumPy', /\bnum[\s._-]*py\b/i]
].map(([canonical, expression]) => ({ canonical, exact: new RegExp(`^\\s*(?:${expression.source})\\s*$`, 'i'), contains: new RegExp(`(?:${expression.source})`, 'i') }));

export const normalizeSkill = (value) => {
    const text = typeof value === 'string' ? value.trim() : '';
    if (!text) return '';
    return definitions.find((definition) => definition.exact.test(text))?.canonical || text;
};

export const normalizeSkills = (values) => {
    const input = Array.isArray(values) ? values : typeof values === 'string' ? values.split(',') : [];
    const seen = new Set();
    return input.map(normalizeSkill).filter((skill) => {
        const key = skill.toLocaleLowerCase();
        if (!skill || seen.has(key)) return false;
        seen.add(key); return true;
    });
};

// Match only technologies actually named in the source text, then reuse the same
// alias normalization and de-duplication used for imports and user edits.
export const extractSkills = (text = '') => normalizeSkills(definitions.filter((definition) => definition.contains.test(String(text))).map((definition) => definition.canonical));

// Anchored regex lets MongoDB match canonical and legacy aliases without a scan.
export const skillMatcher = (value) => {
    const canonical = normalizeSkill(value);
    const definition = definitions.find((item) => item.canonical === canonical);
    return definition ? definition.exact : new RegExp(`^\\s*${String(canonical).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, 'i');
};
