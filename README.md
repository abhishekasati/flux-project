# Portfolio

Static site: HTML, CSS, JavaScript. No framework, no build step, no dependencies.
Open `index.html` in a browser, or run `npx serve .` to preview it like a real server.

## What you must do (the site tells you what is left)

Run this any time:

    node scripts/check.js

It lists every placeholder, missing file and broken link, and prints `READY` when you can deploy.
Search the code for `TODO(you)` to see each spot with instructions. Delete a `TODO(you)` comment
once you finish that item.

| # | Task | Where |
|---|------|-------|
| 1 | Set your real domain: `node scripts/set-domain.js https://yourname.dev` | all files |
| 2 | Real GitHub and LinkedIn URLs | `index.html` (JSON-LD, Contact, footer) |
| 3 | Keep or remove the "Open to internships" line | `index.html` hero |
| 4 | Make the tagline specific to you | `index.html` hero |
| 5 | Add `assets/Abhishek-Asati-Resume.pdf` (1 page) | `assets/` |
| 6 | Add `images/profile.jpg` (square, ~600x600, under 100 KB) | `images/` |
| 7 | Write 2 to 3 sentences of your story | `index.html` About |
| 8 | Keep only skills you can prove with a project | `index.html` Skills |
| 9 | Replace the 3 project cards with real projects (screenshot, one-liner, role, result, links) | `index.html` Projects |
| 10 | Real email address | `index.html` Contact |
| 11 | Get a free Web3Forms key and paste it into the form | `index.html` Contact |
| 12 | Copy `projects/case-study-template.html` for your best project | `projects/` |
| 13 | Optional: 1 to 3 short blog posts, enable the Writing section | `blog/` |

## What is already done

- **Contact form that tells the truth.** Validates, shows clear errors, sends through Web3Forms once you add a key, and never says "sent" unless the server confirmed it. Without a key it opens the visitor's email app instead.
- **Live accent colour.** The hero panel changes `--hue` and the whole site follows. Choice is remembered.
- **Dark and light theme.** Follows the visitor's system on first visit, no flash, remembered after.
- **Accessibility.** Skip link, visible focus, labelled form with error messages, keyboard menu on mobile, scroll-spy `aria-current`, reduced-motion respected, contrast 4.5:1 or better at every accent hue in both themes.
- **Speed.** Self-hosted fonts (about 80 KB total), no third-party requests, no layout shift, tiny JS.
- **SEO and sharing.** Title, description, canonical, Open Graph and Twitter cards with a preview image, JSON-LD `Person`, favicon, `sitemap.xml`, `robots.txt`.
- **Security headers** in `_headers` (strict Content-Security-Policy, nosniff, referrer policy).
- **Project filter** by technology, appears on its own once you have 4 or more projects.
- **Templates** for a case study and a blog post. Both are `noindex` until you remove that line.
- **Custom 404 page.**

## Deploy (free)

**Netlify (recommended):** drag the whole `portfolio` folder onto https://app.netlify.com/drop. `_headers` is applied automatically.
**GitHub Pages:** push to a repo, Settings > Pages. Everything works except `_headers` (ignored there).
**Cloudflare Pages:** connect the repo, no build command, output directory `/`.

After deploying, set the same URL with `set-domain.js`, redeploy, then test the link preview at
https://www.opengraph.xyz and submit `sitemap.xml` in Google Search Console.

## Measure it (then show the numbers)

Chrome DevTools > Lighthouse > Analyze. On the local build before real content, mobile scored
97 to 99 and desktop 100 for performance, with 100 for accessibility and SEO.
Your numbers will change as you add images, so re-run after adding screenshots (use WebP, set `width` and `height`, add `loading="lazy"` below the fold).

## Editing tips

- Colours and spacing: top of `css/style.css` (`:root` tokens). Default hue is `--hue: 285` (also in `js/main.js` as the fallback `285`).
- Changing CSS or JS after launch: visitors may keep the old file for up to a day (see `_headers`). Rename the link, e.g. `style.css?v=2`, to force an update.
- If you add a third-party script, add its host to the Content-Security-Policy in `_headers`, or the browser blocks it.
- Fonts: Bricolage Grotesque and DM Sans, both SIL Open Font License (licences are in `fonts/`).
