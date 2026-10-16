/**
 * add-contextual-links.js
 * Adds the remaining contextual in-body links so that EVERY canonical page
 * has at least 3 inbound contextual links from distinct pages.
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');

// Helper
function updateFile(filename, updater) {
  const filePath = path.join(ROOT_DIR, filename);
  const content = fs.readFileSync(filePath, 'utf8');
  const newContent = updater(content);
  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`[${filename}] Updated successfully.`);
  } else {
    console.log(`[${filename}] No changes made or target text not found.`);
  }
}

// 1. ai-services.html -> /ai-video-content-generation and /ai-reel
updateFile('ai-services.html', content => {
  // Replace card 1 link with link to /ai-video-content-generation
  const target1 = '<a href="#ai-capabilities" class="apple-card-link">Explore Capabilities &rarr;</a>';
  const repl1 = '<a href="/ai-video-content-generation" class="apple-card-link">View AI Content Generation Showcase &rarr;</a>';
  
  // Add link to /ai-reel under short-form header
  const target2 = `                <h3 class="apple-group-title">Automated AI Social Reels &amp; Vertical Content</h3>
                <p class="apple-group-subtitle">
                    High-impact 9:16 vertical films engineered for Instagram Reels, YouTube Shorts, and TikTok
                    algorithms.
                </p>`;
  const repl2 = `                <h3 class="apple-group-title">Automated AI Social Reels &amp; Vertical Content</h3>
                <p class="apple-group-subtitle">
                    High-impact 9:16 vertical films engineered for Instagram Reels, YouTube Shorts, and TikTok
                    algorithms.
                </p>
                <p style="margin-top: 10px;"><a href="/ai-reel" class="apple-card-link">Watch our dedicated AI Brand Reel Showcase &rarr;</a></p>`;

  let c = content;
  if (c.includes(target1)) c = c.replace(target1, repl1);
  if (c.includes(target2)) c = c.replace(target2, repl2);
  return c;
});

// 2. ai-video-production.html -> /ai-reel and /ai-video-content-generation
updateFile('ai-video-production.html', content => {
  const target = `<div style="display: flex; gap: 16px; flex-wrap: wrap;">
                            <a href="/ai-services" class="cta-btn" style="padding: 14px 28px; font-size: 15px;">
                                Explore AI Services Gallery →
                            </a>`;
  const repl = `<p style="font-size: 15px; color: rgba(255,255,255,0.7); margin-bottom: 20px;">
                            See our dedicated showcases: watch our <a href="/ai-reel" style="color: var(--accent-color, #ffbf00); font-weight: 600;">AI Brand Reel Showcase</a> or explore our <a href="/ai-video-content-generation" style="color: var(--accent-color, #ffbf00); font-weight: 600;">AI Content Generation Showcase</a>.
                        </p>
                        <div style="display: flex; gap: 16px; flex-wrap: wrap;">
                            <a href="/ai-services" class="cta-btn" style="padding: 14px 28px; font-size: 15px;">
                                Explore AI Services Gallery →
                            </a>`;
  if (content.includes(target)) {
    return content.replace(target, repl);
  }
  return content;
});

// 3. portfolio.html -> /about, /join-team, /ai-video-content-generation
updateFile('portfolio.html', content => {
  const target = `<p>Whether you need a TV commercial, digital campaign, e-commerce solutions, or OOH advertising, we're
                    here to help bring your vision to life.</p>`;
  const repl = `<p>Whether you need a TV commercial, digital campaign, e-commerce solutions, or OOH advertising, we're
                    here to help bring your vision to life.</p>
                <p style="margin-top: 12px; font-size: 15px; color: rgba(255, 255, 255, 0.75);">
                    Learn more about our filmmaking roots on our <a href="/about" style="color: var(--accent-color, #ffbf00); font-weight: 600;">about Paaru Studio</a> page, check out our next-gen <a href="/ai-video-content-generation" style="color: var(--accent-color, #ffbf00); font-weight: 600;">AI content generation showcase</a>, or explore creative careers to <a href="/join-team" style="color: var(--accent-color, #ffbf00); font-weight: 600;">join our production team</a>.
                </p>`;
  if (content.includes(target)) {
    return content.replace(target, repl);
  }
  return content;
});

// 4. contact.html -> /privacy-policy, /join-team, /about
updateFile('contact.html', content => {
  const target = `<div class="form-group-full">
                        <button type="submit" class="submit-btn-full">Submit Inquiry →</button>
                    </div>`;
  const repl = `<div class="form-group-full">
                        <button type="submit" class="submit-btn-full">Submit Inquiry →</button>
                    </div>
                    <div class="form-group-full" style="text-align: center; margin-top: 12px; font-size: 13px; color: #94a3b8;">
                        By submitting, you agree to our <a href="/privacy-policy" style="color: var(--accent-color, #ffbf00); text-decoration: underline;">Privacy Policy</a>. Looking for careers? <a href="/join-team" style="color: var(--accent-color, #ffbf00); text-decoration: underline;">Join our creative team</a> or learn more <a href="/about" style="color: var(--accent-color, #ffbf00); text-decoration: underline;">about our agency</a>.
                    </div>`;
  if (content.includes(target)) {
    return content.replace(target, repl);
  }
  return content;
});

// 5. about.html -> /join-team, /privacy-policy
updateFile('about.html', content => {
  const target = `            </div>
        </div>
    </section>

        <!-- Footer -->`;
  const repl = `            </div>
            <div style="margin-top: 48px; padding-top: 32px; border-top: 1px solid rgba(255,255,255,0.08); text-align: center;">
                <p style="font-size: 16px; color: var(--text-secondary, #94a3b8); margin-bottom: 16px;">
                    Passionate about visual storytelling and cutting-edge media? Explore open roles to <a href="/join-team" style="color: var(--accent-color, #ffbf00); font-weight: 600;">join our team</a>, or review our client commitment and <a href="/privacy-policy" style="color: var(--accent-color, #ffbf00); font-weight: 600;">privacy policy</a>.
                </p>
            </div>
        </div>
    </section>

        <!-- Footer -->`;
  if (content.includes(target)) {
    return content.replace(target, repl);
  }
  return content;
});

// 6. corporate-video-production.html -> /blog-corporate-videos
updateFile('corporate-video-production.html', content => {
  const target = `                    <p style="font-size: 13.5px; color: rgba(255,255,255,0.7); line-height: 1.5; margin-bottom: 16px;">Tech park high-intent outdoor media blitz explored in the <a href="/case-study-signeasy" style="color: var(--accent-color, #ffbf00); text-decoration: underline;">Signeasy enterprise case study</a>.</p>
                </div>
            </div>`;
  const repl = `                    <p style="font-size: 13.5px; color: rgba(255,255,255,0.7); line-height: 1.5; margin-bottom: 16px;">Tech park high-intent outdoor media blitz explored in the <a href="/case-study-signeasy" style="color: var(--accent-color, #ffbf00); text-decoration: underline;">Signeasy enterprise case study</a>.</p>
                </div>
            </div>
            <div style="text-align: center; margin-top: 24px;">
                <p style="font-size: 15px; color: rgba(255,255,255,0.7);">
                    Looking for tactical frameworks? Read our guide on <a href="/blog-corporate-videos" style="color: var(--accent-color, #ffbf00); font-weight: 600;">corporate video production planning and ROI</a>.
                </p>
            </div>`;
  if (content.includes(target)) {
    return content.replace(target, repl);
  }
  return content;
});

// 7. video-production.html -> /blog-video-production-bangalore
updateFile('video-production.html', content => {
  const target = `                        <a href="/case-study-onsurity" style="color: var(--accent-color, #ffbf00); text-decoration: underline; font-weight: 600; font-size: 13.5px;">Read Onsurity Case Study →</a>
                    </div>
                </div>
            </div>
        </div>
    </section>`;
  const repl = `                        <a href="/case-study-onsurity" style="color: var(--accent-color, #ffbf00); text-decoration: underline; font-weight: 600; font-size: 13.5px;">Read Onsurity Case Study →</a>
                    </div>
                </div>
                <div style="text-align: center; margin-top: 24px;">
                    <p style="font-size: 15px; color: rgba(255,255,255,0.7);">
                        Looking for local agency insights? Read our comprehensive guide on <a href="/blog-video-production-bangalore" style="color: var(--accent-color, #ffbf00); font-weight: 600;">hiring a video production company in Bangalore</a>.
                    </p>
                </div>
            </div>
        </div>
    </section>`;
  if (content.includes(target)) {
    return content.replace(target, repl);
  }
  return content;
});

// 8. motion-graphics-animation.html -> /blog-animated-educational-videos
updateFile('motion-graphics-animation.html', content => {
  const target = `                    <p style="font-size: 13.5px; color: rgba(255,255,255,0.7); line-height: 1.5; margin-bottom: 16px;">Corporate brand cinematics and motion graphic packaging explored in the <a href="/case-study-herbalife" style="color: var(--accent-color, #ffbf00); text-decoration: underline;">Herbalife brand case study</a>.</p>
                </div>
            </div>`;
  const repl = `                    <p style="font-size: 13.5px; color: rgba(255,255,255,0.7); line-height: 1.5; margin-bottom: 16px;">Corporate brand cinematics and motion graphic packaging explored in the <a href="/case-study-herbalife" style="color: var(--accent-color, #ffbf00); text-decoration: underline;">Herbalife brand case study</a>.</p>
                </div>
            </div>
            <div style="text-align: center; margin-top: 24px;">
                <p style="font-size: 15px; color: rgba(255,255,255,0.7);">
                    Interested in learning animation? Read our breakdown on producing <a href="/blog-animated-educational-videos" style="color: var(--accent-color, #ffbf00); font-weight: 600;">animated educational and explainer videos</a>.
                </p>
            </div>`;
  if (content.includes(target)) {
    return content.replace(target, repl);
  }
  return content;
});

// 9. films.html -> /blog-viral-video-marketing and /blog-video-production-essentials
updateFile('films.html', content => {
  const target = `                    <p style="font-size: 13.5px; color: rgba(255,255,255,0.7); line-height: 1.5; margin-bottom: 16px;">Editorial lookbook and commercial digital video campaign featured in our <a href="/case-study-calvin-klein" style="color: var(--accent-color, #ffbf00); text-decoration: underline;">Calvin Klein case study</a>.</p>
                </div>
            </div>`;
  const repl = `                    <p style="font-size: 13.5px; color: rgba(255,255,255,0.7); line-height: 1.5; margin-bottom: 16px;">Editorial lookbook and commercial digital video campaign featured in our <a href="/case-study-calvin-klein" style="color: var(--accent-color, #ffbf00); text-decoration: underline;">Calvin Klein case study</a>.</p>
                </div>
            </div>
            <div style="text-align: center; margin-top: 24px;">
                <p style="font-size: 15px; color: rgba(255,255,255,0.7);">
                    Explore expert guides: master <a href="/blog-viral-video-marketing" style="color: var(--accent-color, #ffbf00); font-weight: 600;">viral video marketing and social retention</a> or understand core <a href="/blog-video-production-essentials" style="color: var(--accent-color, #ffbf00); font-weight: 600;">video production essentials for modern brands</a>.
                </p>
            </div>`;
  if (content.includes(target)) {
    return content.replace(target, repl);
  }
  return content;
});

console.log('\nAll contextual linking updates complete.');
