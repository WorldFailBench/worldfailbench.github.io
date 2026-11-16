# WorldFailBench project website

Anonymous research project website, hosted with GitHub Pages.

Website: https://worldfailbench.github.io/

## Development

Plain HTML, CSS, and JavaScript. No framework, external scripts, tracking, remote fonts, or server dependencies.

Run from this directory:

    python3 -m http.server 4173

Open http://localhost:4173.

## Deployment

The GitHub Actions workflow in .github/workflows/pages.yml deploys the main branch. GitHub Pages uses GitHub Actions as its build source. All asset paths are relative.

Edit index.html, style.css, app.js, data.js, or assets/, then push to main. The workflow uploads only the public website files.

## Materials

- Anonymous full paper and appendix: original author block, institutional logo, links, and identifying document metadata removed. Ordinary academic references are preserved.
- Original research figures and six real initial observations.
- Real initial observations, reference outcomes, and task-stage vocabulary in the scene gallery.
- Interactive evaluation-task tabs and factor-specific RoboTwin result explorer.
- All dataset resource entry points link directly to the complete official Hugging Face release.

data.js contains verified result values and sample records. Boundary scores are separated by intervention. Dataset counts distinguish paper scope from released simulation evaluation records.

The page contains no author or affiliation attribution. The title and technical content remain publicly searchable. Hosting account identity is visible in the URL and repository.
