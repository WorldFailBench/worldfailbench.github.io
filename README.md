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

- Benchmark diagrams and diagnostic findings organized by failure type, failure stage, and failure boundary.
- RoboTwin, LIBERO, and G1 platform coverage with user-provided demonstration videos. Platform videos retain their original encoded frames, resolution, and frame rate.
- Six paired boundary examples (12 reference videos), with individual outcomes checked against scene annotations and visual review.
- Video frames are preserved by stream-copying H.264 into fast-start MP4. Source paths and checksums are recorded in assets/boundary/manifest.json.
- The only external destination linked by the website is the anonymous dataset release: https://anonymous.4open.science/r/WORLDFAILBENCH-964A/README.md

data.js contains verified result values and boundary video records. Controlled boundary evaluation covers RoboTwin and LIBERO; type and stage evaluation also cover real-world G1 tasks. Counts distinguish benchmark coverage from released simulation evaluation records.

The page contains no author or affiliation attribution. Hosting account identity is visible in the URL and repository.
