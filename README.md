# Cloud Resume Challenge: Frontend

The frontend and delivery pipeline for my resume website, **[jeffxieresumewebsite.com](https://www.jeffxieresumewebsite.com)**, built for the [Cloud Resume Challenge](https://cloudresumechallenge.dev/). It is a static site on AWS, served over HTTPS through CloudFront, with a live visitor counter and a few interactive projects backed by a serverless API.

> The backend (Lambda, API Gateway, DynamoDB) lives in **[cloud-resume-challenge-backend](https://github.com/lumosityfan/cloud-resume-challenge-backend)**.

## Demo

> 🚧 **A screenshot of the site is coming soon. In the meantime, see it live at [jeffxieresumewebsite.com](https://www.jeffxieresumewebsite.com).**

## Architecture

```
Browser ──► Cloudflare DNS ──► CloudFront (ACM TLS cert, WAF) ──► S3 (static site)
   │
   └──► API Gateway ──► Lambda ──► DynamoDB / Bedrock / OpenAI      (see the backend repo)
```

- **Hosting:** static HTML, CSS and JS in S3, served by CloudFront with an ACM certificate for the apex and `www` domains.
- **DNS:** Cloudflare records and ACM certificate validation are managed in Terraform.
- **Visitor counter:** the page calls the API to read and increment a total count and a unique-visitor count.
- **Interactive projects:** a resume summarizer, a job match calculator, a PCA analysis tool, a random-walk simulator, Tableau visualizations and baseball graphs.

## CI/CD

Every push to `master` runs three GitHub Actions workflows:

| Workflow | What it does |
|---|---|
| `terraform.yml` | `terraform init`, `fmt -check` and `plan` on every push and PR; `apply` on push to `master` |
| `deploy.yml` | Syncs the site to the S3 bucket |
| `playwright.yml` | Runs end-to-end browser tests against the site |

## Testing

[Playwright](https://playwright.dev/) tests in `tests/` check the page title and the visitor counter behavior (including a mocked API response).

```bash
npm ci
npx playwright install --with-deps
npx playwright test
```

## Repository layout

| Path | Purpose |
|---|---|
| `index.html`, `resume.html`, `projects.html` | Main pages |
| `*.js` | Visitor counter and project logic |
| `main.tf`, `variables.tf`, `terraform.tf` | CloudFront, ACM and Cloudflare DNS infrastructure |
| `tests/` | Playwright end-to-end tests |
| `.github/workflows/` | CI/CD pipelines |

## Tech stack

HTML · CSS · JavaScript · AWS (S3, CloudFront, ACM, WAF) · Cloudflare · Terraform · GitHub Actions · Playwright

## What I learned

**CORS was the hardest part.** I hadn't realized that browsers block cross-origin requests unless the API explicitly allows the calling origin, so my frontend's API calls failed until I configured it properly. **Wiring Cloudflare DNS to CloudFront** was the other early challenge, and it took the first couple of days to get the domain and distribution working together.

**What I'd do differently:**

- Keep the origins that visitors and I use most often in a dedicated CORS variable, so the allowed origins are easy to manage and update.
- Set up CloudFront and DNS first, then test them against the CORS configuration from the start rather than debugging both at once.
