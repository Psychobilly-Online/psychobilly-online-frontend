import styles from './Startpage.module.css';

export function Startpage() {
  return (
    <div className={styles.content}>
      <div className={styles.container}>
        <div className={styles.bigBox}>
          <div className={styles.bigBoxContent}>
            <h1>Psychobilly Online: The Relaunch</h1>
            <p className={styles.tagline}>
              <strong>From fans. For fans. Forever independent.</strong>
            </p>

            <h2>A Fresh Start.</h2>
            <p>
              Since the late 1990s, Psychobilly Online has been a cornerstone of the global
              psychobilly community. After years of technical debt and aging infrastructure,
              we&apos;re rebuilding from the ground up: modernizing the technology while preserving
              the community spirit that makes this scene special.
            </p>

            <h2>Current Development Status</h2>
            <p>
              We&apos;re in <strong>Phase 2 of active development</strong> (~50% complete), building
              the foundation for a comprehensive psychobilly platform. The new frontend is taking
              shape, and we&apos;re working on core features week by week.
            </p>

            <h2>The Vision: What We&apos;re Building</h2>
            <ul className={styles.featureList}>
              <li>
                <strong>Comprehensive Event Database</strong> - Our goal is to document psychobilly
                history from 1979 to today, with powerful search and filtering
              </li>
              <li>
                <strong>Band Database</strong> - Detailed band profiles that can be claimed by bands
                or maintained by dedicated community &quot;godparents&quot;
              </li>
              <li>
                <strong>Venue Directory</strong> - Every club, every venue that kept psychobilly
                alive worldwide
              </li>
              <li>
                <strong>User Pages</strong> - Personal spaces for blogs, photo galleries, and
                sharing your psychobilly journey
              </li>
              <li>
                <strong>Historical Archives</strong> - Enrich past events with reviews, photos, and
                memories from those who were there
              </li>
              <li>
                <strong>Community-Driven</strong> - No ads, no algorithms, no corporate manipulation
                — just real fans
              </li>
            </ul>

            <h2>Current Database Status</h2>
            <p>
              We&apos;re starting with our existing data and expanding from there:
              <br />
              <strong>~2,500 venues</strong> worldwide
              <br />
              <strong>~2,400 bands</strong> (names extracted from events, detailed profiles coming)
              <br />
              <strong>~3,000 Events from 2009-2019</strong> (expanding to cover 1979+ as we grow)
              <br />
              <strong>~3,500 user accounts</strong> ready for reactivation
            </p>

            <h2>About the Forum</h2>
            <p>
              The{' '}
              <a href={`${process.env.NEXT_PUBLIC_LEGACY_URL}/community`} className={styles.link}>
                forum
              </a>{' '}
              has been running privately for the past 5 years. With{' '}
              <strong>600,000 posts already migrated</strong> and more on the way, the forum will
              remain the heart of the community.
            </p>
            <p>
              <strong>For existing users:</strong> Your accounts are preserved and will work on the
              relaunched site.
              <br />
              <strong>For new users:</strong> Public registration will open once the modernization
              project is complete (target: Q4 2026).
            </p>

            <h2>Get Involved</h2>
            <p>
              This is <em>your</em> community. Want to help shape its future?{' '}
              <a href="/about" className={styles.link}>
                Learn about the project
              </a>{' '}
              or follow our frontend development on{' '}
              <a
                href="https://github.com/Psychobilly-Online/psychobilly-online-frontend"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
              >
                GitHub
              </a>
              .
            </p>

            <p className={styles.signature}>
              <em>
                Psychobilly Online - No corporate bullshit. No fake profiles. No data mining. Just
                real fans.
              </em>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
