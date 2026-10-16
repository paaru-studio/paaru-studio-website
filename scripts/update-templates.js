#!/usr/bin/env node

/**
 * update-templates.js
 * Synchronizes the unified master header navbar and 4-column footer
 * across all HTML pages in the repository.
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');

const MASTER_NAVBAR = `    <!-- Navigation -->
    <nav class="navbar">
        <div class="container">
            <div class="nav-content">
                <a href="/" class="logo">
                    <img loading="eager" fetchpriority="high" decoding="async" src="logo.png" alt="Paaru Studio Logo"
                        class="logo-image" width="53" height="53">
                    <span class="logo-text">
                        <span class="logo-text-static">PAARU</span>
                        <span class="logo-text-flip">
                            <span class="flip-word">STUDIO</span>
                            <span class="flip-word">MEDIA</span>
                        </span>
                    </span>
                </a>
                <!-- Mobile menu button (visible on small screens) -->
                <button class="mobile-menu-btn" aria-label="Open menu" aria-expanded="false">☰</button>
                <div class="nav-links">
                    <a href="/">Home</a>
                    <div class="nav-dropdown">
                        <a href="/video-production" class="nav-dropdown-toggle">Services <span
                                class="dropdown-arrow">▾</span></a>
                        <div class="nav-dropdown-menu mega-menu">
                            <div class="mega-menu-item mega-menu-item-cluster">
                                <a href="/video-production" class="mega-item-head">
                                    <img loading="lazy" decoding="async" src="video_pro.webp" alt="Video Production"
                                        width="120" height="80">
                                    <div class="mega-item-content">
                                        <h4>Video Production</h4>
                                        <p>TVCs, Digital Ads, Corporate films. End-to-end video solutions.</p>
                                    </div>
                                </a>
                                <div class="mega-sublinks-list">
                                    <a href="/corporate-video-production" class="mega-sublink">Corporate Video Production</a>
                                    <a href="/films" class="mega-sublink">TVCs, DVCs &amp; UGC</a>
                                    <a href="/motion-graphics-animation" class="mega-sublink">Motion Graphics &amp; Animation</a>
                                </div>
                            </div>
                            <a href="/ecommerce" class="mega-menu-item">
                                <img loading="lazy" decoding="async" src="shopify_img.webp" alt="E-commerce Solutions"
                                    width="120" height="120">
                                <div class="mega-item-content">
                                    <h4>E-commerce Solutions</h4>
                                    <p>Boost your online sales with tailored e-commerce strategies.</p>
                                </div>
                            </a>
                            <a href="/performance-marketing" class="mega-menu-item">
                                <img loading="lazy" decoding="async" src="pm_1.webp" alt="Digital Marketing" width="120"
                                    height="68">
                                <div class="mega-item-content">
                                    <h4>Digital Marketing</h4>
                                    <p>Data-driven performance and social media campaigns.</p>
                                </div>
                            </a>
                            <a href="/media-offerings" class="mega-menu-item">
                                <img loading="lazy" decoding="async" src="OOH_banner.webp"
                                    alt="Offline Marketing (OOH/DOOH)" width="120" height="90">
                                <div class="mega-item-content">
                                    <h4>Offline Marketing</h4>
                                    <p>High-impact outdoor and digital out-of-home advertising.</p>
                                </div>
                            </a>
                        </div>
                    </div>

                    <div class="nav-dropdown">
                        <a href="/media-offerings" class="nav-dropdown-toggle">Media <span
                                class="dropdown-arrow">▾</span></a>
                        <div class="nav-dropdown-menu">
                            <a href="/media-offerings">Media Offerings (OOH &amp; DOOH)</a>
                            <a href="/performance-marketing">Performance Marketing</a>
                            <a href="/social-media-marketing">Social Media Marketing</a>
                            <a href="/influencer-marketing">Influencer Marketing</a>
                        </div>
                    </div>
                    <a href="/portfolio">Portfolio</a>
                    <a href="/case-studies">Case Studies</a>
                    <a href="/blog">Blog</a>
                    <a href="/get-started">Get Started</a>
                    <a href="/ai-services" class="ai-explore-btn" aria-label="AI Services"><span>AI Services</span></a>
                    <a href="/contact" class="cta-btn">Contact Us</a>
                </div>
            </div>
        </div>
    </nav>
    <div class="mobile-nav-backdrop" aria-hidden="true"></div>`;

const MASTER_FOOTER = `    <!-- Footer -->
    <footer class="footer full-bleed">
        <div class="footer-cta">
            <div class="container">
                <h2>Looking to drive results? <a href="/get-started" class="footer-cta-link">Let's chat
                        →</a></h2>
            </div>
        </div>
        <div class="footer-main">
            <div class="container">
                <!-- Ask AI Section -->
                <div class="ask-ai-section">
                    <div class="ask-ai-header">
                        <span class="ask-ai-pill-label">✨ AI Due Diligence</span>
                        <h3 class="ask-ai-title">Don't take our word for it — ask AI</h3>
                        <p class="ask-ai-subtitle">Evaluate Paaru Studio-Media as your creative and advertising agency
                            in Bengaluru with instant, pre-filled prompts across leading AI assistants.</p>
                    </div>
                    <div class="ask-ai-actions">
                        <a href="https://chat.openai.com/?q=As%20a%20brand%20or%20marketing%20lead%20evaluating%20creative%20and%20advertising%20agencies%20in%20Bengaluru%2C%20summarise%20what%20makes%20Paaru%20Studio-Media%20a%20strong%20choice%2C%20based%20on%20their%20website%3A%20https%3A//paarustudio.com"
                            target="_blank" rel="noopener noreferrer" class="ask-ai-btn">
                            <svg class="ai-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path
                                    d="M12 2a10 10 0 0 1 10 10c0 5.523-4.477 10-10 10a9.96 9.96 0 0 1-4.708-1.175L2 22l1.175-5.292A9.96 9.96 0 0 1 2 12C2 6.477 6.477 2 12 2z" />
                            </svg>
                            <span>ChatGPT</span>
                            <span class="ai-btn-arrow">↗</span>
                        </a>
                        <a href="https://claude.ai/new?q=As%20a%20brand%20or%20marketing%20lead%20evaluating%20creative%20and%20advertising%20agencies%20in%20Bengaluru%2C%20summarise%20what%20makes%20Paaru%20Studio-Media%20a%20strong%20choice%2C%20based%20on%20their%20website%3A%20https%3A//paarustudio.com"
                            target="_blank" rel="noopener noreferrer" class="ask-ai-btn">
                            <svg class="ai-btn-icon" viewBox="0 0 24 24" fill="currentColor">
                                <path
                                    d="M12 2L14.2 8.6L21 9.2L16 13.8L17.5 20.6L12 17L6.5 20.6L8 13.8L3 9.2L9.8 8.6L12 2Z" />
                            </svg>
                            <span>Claude</span>
                            <span class="ai-btn-arrow">↗</span>
                        </a>
                        <a href="https://www.google.com/search?udm=50&q=As%20a%20brand%20or%20marketing%20lead%20evaluating%20creative%20and%20advertising%20agencies%20in%20Bengaluru%2C%20summarise%20what%20makes%20Paaru%20Studio-Media%20a%20strong%20choice%2C%20based%20on%20their%20website%3A%20https%3A//paarustudio.com"
                            target="_blank" rel="noopener noreferrer" class="ask-ai-btn">
                            <svg class="ai-btn-icon" viewBox="0 0 24 24" fill="currentColor">
                                <path
                                    d="M12 11v2.5h6.3c-.3 1.6-1.8 4.7-6.3 4.7-3.8 0-6.9-3.1-6.9-7s3.1-7 6.9-7c2.2 0 3.7.9 4.5 1.7l2-1.9C17.2 2.8 14.8 2 12 2 6.5 2 2 6.5 2 12s4.5 10 10 10c5.8 0 9.6-4.1 9.6-9.8 0-.7-.1-1.2-.2-1.7H12z" />
                            </svg>
                            <span>Google AI</span>
                            <span class="ai-btn-arrow">↗</span>
                        </a>
                        <a href="https://www.perplexity.ai/search?q=As%20a%20brand%20or%20marketing%20lead%20evaluating%20creative%20and%20advertising%20agencies%20in%20Bengaluru%2C%20summarise%20what%20makes%20Paaru%20Studio-Media%20a%20strong%20choice%2C%20based%20on%20their%20website%3A%20https%3A//paarustudio.com"
                            target="_blank" rel="noopener noreferrer" class="ask-ai-btn">
                            <svg class="ai-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2">
                                <circle cx="12" cy="12" r="9" />
                                <path d="M12 3v18M3 12h18" />
                            </svg>
                            <span>Perplexity</span>
                            <span class="ai-btn-arrow">↗</span>
                        </a>
                    </div>
                </div>

                <div class="footer-grid">
                    <div class="footer-brand">
                        <h3>PAARU STUDIO-MEDIA</h3>
                        <p>Creative &amp; Advertising Agency in Bengaluru | Ad Films, Video, OOH/DOOH, BTL &amp;
                            Performance Marketing</p>
                        <div class="footer-social">
                            <a href="https://www.instagram.com/paaru_studio" target="_blank" rel="noopener noreferrer"
                                aria-label="Instagram">Instagram</a>
                            <a href="https://www.linkedin.com/company/paaru-studio" target="_blank"
                                rel="noopener noreferrer" aria-label="LinkedIn">LinkedIn</a>
                            <a href="https://www.justdial.com/Bangalore/Paaru-Studio-Nagarbhavi/080PXX80-XX80-230905213353-X4D4_BZDET"
                                target="_blank" rel="noopener noreferrer" aria-label="Justdial">Justdial</a>
                        </div>
                    </div>
                    <div class="footer-nav">
                        <div class="footer-col">
                            <h4>Services</h4>
                            <a href="/video-production">Video Production</a>
                            <a href="/corporate-video-production">Corporate Video Production</a>
                            <a href="/films">TVCs, DVCs &amp; UGC</a>
                            <a href="/motion-graphics-animation">Motion Graphics &amp; Animation</a>
                            <a href="/media-offerings">Media Offerings (OOH &amp; DOOH)</a>
                            <a href="/performance-marketing">Performance Marketing</a>
                            <a href="/social-media-marketing">Social Media Marketing</a>
                            <a href="/influencer-marketing">Influencer Marketing</a>
                            <a href="/ai-services">AI Services</a>
                            <a href="/ecommerce">E-Commerce</a>
                        </div>
                        <div class="footer-col">
                            <h4>Company</h4>
                            <a href="/about">About Us</a>
                            <a href="/portfolio">Portfolio</a>
                            <a href="/join-team">Join Team</a>
                            <a href="/contact">Contact</a>
                        </div>
                        <div class="footer-col">
                            <h4>Resources</h4>
                            <a href="/case-studies">Case Studies</a>
                            <a href="/blog">Blog</a>
                            <a href="/get-started#faq">FAQ</a>
                            <a href="/get-started">Get Started</a>
                        </div>
                        <div class="footer-col">
                            <h4>Legal</h4>
                            <a href="/privacy-policy">Privacy Policy</a>
                        </div>
                    </div>
                </div>
                <div class="footer-bottom">
                    <div class="clutch-widget" data-url="https://widget.clutch.co" data-widget-type="1" data-height="40"
                        data-nofollow="true" data-expandifr="true" data-clutchcompany-id="2732402"></div>

                    <p>© Paaru Studio-Media 2026</p>
                    <div class="footer-meta">
                        <a href="#top" class="back-to-top">↑</a>
                    </div>
                </div>
            </div>
        </div>
    </footer>`;

function updateFile(file) {
    const filePath = path.join(ROOT_DIR, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Replace Navigation
    // Pattern to match from <!-- Navigation --> or <nav class="navbar" to </nav> and optional mobile-nav-backdrop
    const navRegex = /(?:<!--\s*Navigation\s*-->\s*)?<nav class=["']navbar["'][\s\S]*?<\/nav>(?:\s*<div class=["']mobile-nav-backdrop["'][^>]*><\/div>)?/i;
    if (navRegex.test(content)) {
        content = content.replace(navRegex, MASTER_NAVBAR);
    } else {
        console.warn(`Could not match navbar in ${file}`);
    }

    // 2. Replace Footer
    // Pattern to match from <!-- Footer --> or <footer to </footer>
    const footerRegex = /(?:<!--\s*Footer\s*-->\s*)?<footer\b[\s\S]*?<\/footer>/i;
    if (footerRegex.test(content)) {
        content = content.replace(footerRegex, MASTER_FOOTER);
    } else {
        console.warn(`Could not match footer in ${file}`);
    }

    fs.writeFileSync(filePath, content, 'utf8');
}

function updateAllFiles() {
    const files = fs.readdirSync(ROOT_DIR).filter(f => f.endsWith('.html') && !f.includes('.backup'));
    console.log(`Updating navbar and footer in ${files.length} HTML files...`);
    for (const f of files) {
        updateFile(f);
        console.log(`Updated ${f}`);
    }
}

if (require.main === module) {
    updateAllFiles();
}

module.exports = { updateAllFiles, updateFile, MASTER_NAVBAR, MASTER_FOOTER };
