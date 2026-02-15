import { Metadata } from 'next';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'About the Project | Psychobilly Online',
  description:
    'Learn about the Psychobilly Online modernization project, our technical stack, and how you can contribute.',
};

export default function AboutPage() {
  return (
    <div className={styles.content}>
      <div className={styles.container}>
        <div className={styles.bigBox}>
          <div className={styles.bigBoxContent}>
            <h1>About the Relaunch</h1>

            <h2>The Philosophy</h2>
            <p>
              Psychobilly Online has always been <strong>from fans, for fans</strong>. We&apos;re
              not here to monetize your passion, harvest your data, or manipulate what you see with
              algorithms. This is a labor of love — a community space built on the principle that
              real connections matter more than engagement metrics.
            </p>

            <p className={styles.manifesto}>
              <strong>No corporate exploitation.</strong>
              <br />
              <strong>No fake profiles or bots.</strong>
              <br />
              <strong>No data mining or tracking.</strong>
              <br />
              <strong>No algorithmic manipulation.</strong>
              <br />
              <em>Just real people, real stories, and real psychobilly.</em>
            </p>

            <h2>Technical Infrastructure</h2>
            <p>
              We&apos;re rebuilding Psychobilly Online with modern, scalable technology. The
              frontend is open source, and we welcome contributions from the community:
            </p>

            <div className={styles.techStack}>
              <div className={styles.techItem}>
                <h3>Frontend (Open Source)</h3>
                <ul>
                  <li>
                    <strong>Next.js 16</strong> - Modern React framework
                  </li>
                  <li>
                    <strong>TypeScript</strong> - Type-safe development
                  </li>
                  <li>
                    <strong>CSS Modules</strong> - Scoped, maintainable styles
                  </li>
                  <li>
                    <strong>Vercel</strong> - Global edge network deployment
                  </li>
                  <li>
                    <strong>GitHub</strong> -{' '}
                    <a
                      href="https://github.com/Psychobilly-Online/psychobilly-online-frontend"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.link}
                    >
                      Public repository
                    </a>
                  </li>
                </ul>
              </div>

              <div className={styles.techItem}>
                <h3>Backend</h3>
                <ul>
                  <li>
                    <strong>REST API</strong> - PHP 8.2 with Slim Framework 4
                  </li>
                  <li>
                    <strong>MySQL 8.0</strong> - Event, band, and venue databases
                  </li>
                  <li>
                    <strong>Image Service</strong> - Self-hosted media management
                  </li>
                  <li>
                    <strong>JWT Auth</strong> - Secure, phpBB-integrated authentication
                  </li>
                </ul>
              </div>

              <div className={styles.techItem}>
                <h3>Forum</h3>
                <ul>
                  <li>
                    <strong>phpBB</strong> - Established community platform
                  </li>
                  <li>
                    <strong>600,000+ posts migrated</strong> - More coming
                  </li>
                  <li>
                    <strong>Currently closed for new registrations</strong> - Re-opening Q4 2026
                  </li>
                  <li>
                    <strong>3,500 user accounts</strong> - Ready for reactivation
                  </li>
                </ul>
              </div>
            </div>

            <h2>Current Database Status</h2>
            <p>
              We&apos;re starting with our existing data and building from there. Our goal is to
              create the most comprehensive psychobilly archive ever assembled:
            </p>
            <ul className={styles.dataList}>
              <li>
                <strong>~2,500 venues</strong> worldwide in the database
              </li>
              <li>
                <strong>~2,400 bands</strong> with names extracted from events (detailed profiles
                coming)
              </li>
              <li>
                <strong>~3,000 events from 2009-2019</strong> currently available (expanding to
                1979+ as we grow)
              </li>
              <li>
                <strong>~3,500 user accounts</strong> preserved and ready for reactivation
              </li>
              <li>
                <strong>~600,000 forum posts</strong> already migrated
              </li>
            </ul>
            <p className={styles.note}>
              <em>
                These numbers reflect our starting point. The vision is to build a comprehensive
                archive covering the early days to present, enriched with community contributions,
                photos, reviews, and memories.
              </em>
            </p>

            <h2>Get Involved</h2>
            <p>This is a community project, and we need you:</p>

            <div className={styles.involvement}>
              <div className={styles.involveItem}>
                <h3>🛠️ Developers</h3>
                <p>
                  Know React, TypeScript, or design? Check out our{' '}
                  <a
                    href="https://github.com/Psychobilly-Online/psychobilly-online-frontend"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.link}
                  >
                    frontend repository
                  </a>{' '}
                  and contribute code, documentation, or ideas.
                </p>
              </div>

              <div className={styles.involveItem}>
                <h3>📝 Content Contributors</h3>
                <p>
                  Once the site launches, help enrich our database: add missing events, upload
                  photos from gigs, write reviews, or maintain band pages as a
                  &quot;godparent&quot;.
                </p>
              </div>

              <div className={styles.involveItem}>
                <h3>💡 Idea Pitchers</h3>
                <p>
                  Have suggestions for features or improvements? Open an issue on GitHub or reach
                  out via email.
                </p>
              </div>

              <div className={styles.involveItem}>
                <h3>🎨 Designers</h3>
                <p>
                  Got an eye for design? Help us refine the UI, create graphics, or improve the user
                  experience.
                </p>
              </div>
            </div>

            <h2>Project Roadmap</h2>
            <p>
              We&apos;re currently in <strong>Phase 2 of development</strong> (~50% complete).
              Here&apos;s what&apos;s done and what&apos;s coming:
            </p>

            <div className={styles.statusGrid}>
              <div className={styles.statusItem}>
                <span className={styles.statusDone}>✅</span>
                <strong>Backend API</strong> - Foundation complete
              </div>
              <div className={styles.statusItem}>
                <span className={styles.statusDone}>✅</span>
                <strong>Frontend Architecture</strong> - Modern stack deployed
              </div>
              <div className={styles.statusItem}>
                <span className={styles.statusProgress}>🔨</span>
                <strong>Event Database</strong> - In development
              </div>
              <div className={styles.statusItem}>
                <span className={styles.statusProgress}>🔨</span>
                <strong>Band/Venue Pages</strong> - In development
              </div>
              <div className={styles.statusItem}>
                <span className={styles.statusPlanned}>📋</span>
                <strong>User Authentication</strong> - Planned Q2 2026
              </div>
              <div className={styles.statusItem}>
                <span className={styles.statusPlanned}>📋</span>
                <strong>User Pages & Blogs</strong> - Planned Q3 2026
              </div>
            </div>

            <h2>Timeline</h2>
            <p>
              <strong>Target Launch:</strong> Q4 2026
              <br />
              <strong>Forum Public Opening:</strong> Q4 2026
              <br />
              <strong>New User Registrations:</strong> Q4 2026
              <br />
              <strong>Full Feature Rollout:</strong> Q4 2026 and beyond
            </p>

            <h2>Contact & Links</h2>
            <ul className={styles.linkList}>
              <li>
                <strong>Frontend (Open Source):</strong>{' '}
                <a
                  href="https://github.com/Psychobilly-Online/psychobilly-online-frontend"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.link}
                >
                  GitHub Repository
                </a>
              </li>
              <li>
                <strong>Forum:</strong>{' '}
                <a href={`${process.env.NEXT_PUBLIC_LEGACY_URL}/community`} className={styles.link}>
                  community.psychobilly-online.de
                </a>{' '}
                (private, existing users only)
              </li>
              <li>
                <strong>Email:</strong>{' '}
                <a href="mailto:info@psychobilly-online.de" className={styles.link}>
                  info@psychobilly-online.de
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
