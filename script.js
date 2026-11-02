// مخازن جایگزین را می‌توانید در این آرایه وارد کنید؛ داده‌های واقعی GitHub در زمان اجرا دریافت می‌شوند.
const editableProjects = [];
const githubUser = 'strhmirzaei-ux';

const menuButton = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  navLinks.classList.toggle('open', open);
});
navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  navLinks.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
}));

const themeButton = document.getElementById('theme-toggle');
if (localStorage.getItem('resume-theme') === 'dark') document.body.classList.add('dark-mode');
themeButton.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  localStorage.setItem('resume-theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
});
document.getElementById('year').textContent = new Date().getFullYear();


const grid = document.getElementById('projects-grid');
const status = document.getElementById('project-status');
const priority = ['python', 'jupyter notebook', 'c#', 'javascript', 'typescript'];
function projectScore(repo) {
  const text = `${repo.name} ${repo.description || ''} ${repo.language || ''}`.toLowerCase();
  let score = Math.log2(repo.stargazers_count + 1);
  priority.forEach((word, index) => { if (text.includes(word)) score += (priority.length - index) * 2; });
  if (/llm|langchain|langgraph|nlp|ai|rag|faiss/.test(text)) score += 15;
  if (repo.fork) score -= 2;
  return score;
}
function renderProjects(projects) {
  grid.replaceChildren();
  if (!projects.length) {
    status.textContent = 'هنوز مخزن عمومی قابل نمایش پیدا نشد.';
    const note = document.createElement('div');
    note.className = 'project-empty';
    note.textContent = 'با انتشار مخازن عمومی در پروفایل GitHub، این بخش به‌صورت خودکار به‌روز می‌شود. برای افزودن دستی پروژه، آرایه editableProjects در script.js را ویرایش کنید.';
    grid.append(note);
    return;
  }
  status.textContent = 'پروژه‌های عمومی، مرتب‌شده بر اساس ارتباط موضوعی و میزان فعالیت.';
  projects.slice(0, 8).forEach((repo, index) => {
    const card = document.createElement('article');
    card.className = 'project-card';
    const top = document.createElement('div'); top.className = 'project-top';
    const number = document.createElement('span'); number.textContent = `PROJECT / ${String(index + 1).padStart(2, '0')}`;
    top.append(number);
    if (repo.stargazers_count) { const stars = document.createElement('span'); stars.className = 'stars'; stars.textContent = `★ ${repo.stargazers_count}`; top.append(stars); }
    const title = document.createElement('h3'); title.textContent = repo.name;
    const description = document.createElement('p'); description.textContent = repo.description || 'توضیحی برای این مخزن ثبت نشده است.';
    const bottom = document.createElement('div'); bottom.className = 'project-bottom';
    const tech = document.createElement('div'); tech.className = 'project-tech';
    const topics = (repo.topics || []).slice(0, 3);
    if (repo.language) topics.unshift(repo.language);
    [...new Set(topics)].slice(0, 4).forEach(label => { const tag = document.createElement('span'); tag.textContent = label; tech.append(tag); });
    const links = document.createElement('div'); links.className = 'project-links';
    const code = document.createElement('a'); code.href = repo.html_url; code.target = '_blank'; code.rel = 'noopener noreferrer'; code.textContent = 'مشاهده کد ↗'; links.append(code);
    if (repo.homepage) { const demo = document.createElement('a'); demo.href = repo.homepage; demo.target = '_blank'; demo.rel = 'noopener noreferrer'; demo.textContent = 'نسخه آنلاین ↗'; links.append(demo); }
    bottom.append(tech, links); card.append(top, title, description, bottom); grid.append(card);
  });
}
async function loadProjects() {
  try {
    const response = await fetch(`https://api.github.com/users/${githubUser}/repos?per_page=100&sort=updated`, { headers: { Accept: 'application/vnd.github+json' } });
    if (!response.ok) throw new Error(`GitHub API: ${response.status}`);
    const repositories = await response.json();
    const sorted = repositories.filter(repo => !repo.archived).sort((a, b) => projectScore(b) - projectScore(a));
    renderProjects(sorted.length ? sorted : editableProjects);
  } catch (error) {
    renderProjects(editableProjects);
    if (!editableProjects.length) status.textContent = 'دریافت مخازن GitHub ممکن نشد؛ برای دیدن پروژه‌ها اتصال اینترنت را بررسی کنید.';
  }
}
loadProjects();
