'use client';

import Breadcrumb from '@/components/common/Breadcrumb';
import PageHeader from '@/components/common/PageHeader';
import Section from '@/components/common/Section';
import styles from './Startpage.module.css';

export function Startpage() {
  return (
    <div className={styles.content}>
      <div className={styles.container}>
        <Breadcrumb items={[{ label: 'Home', href: '/' }]} />

        <PageHeader
          title="Psychobilly Online: The Relaunch"
          description="Rebuilding the independent psychobilly community platform from scratch"
        />

        <Section>
          <div className={styles.bigBoxContent}>
            <h2>A Fresh Start</h2>
            <p>
              In the late 1990s and early 2000s, Psychobilly Online has been a cornerstone of the
              global psychobilly community. After several quiet years — battling technical debt,
              aging infrastructure, and the pull of corporate social media — we&apos;re reclaiming
              our ground. We&apos;re rebuilding from scratch: modernizing the technology while
              preserving the independent, community-driven spirit that makes this scene special.
            </p>

            <h2>Current Development Status</h2>
            <p>
              We&apos;re building{' '}
              <strong>the foundation for a comprehensive psychobilly platform</strong>. The new
              frontend is taking shape, and we&apos;re actively working on the event database, band
              directory, and user features week by week.
            </p>

            <h2>The Vision: What We&apos;re Building</h2>
            <ul className={styles.featureList}>
              <li>
                <strong>Comprehensive Event Database</strong> - Our goal is to document psychobilly
                history from the early days to today, with powerful search and filtering
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
                — just real people
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
              Our{' '}
              <a href={`${process.env.NEXT_PUBLIC_LEGACY_URL}/community`} className={styles.link}>
                forum
              </a>{' '}
              has been running privately for the past 5 years following a necessary platform
              migration. With <strong>600,000 posts already migrated</strong> and more on the way,
              it remains the beating heart of our community — though the beat has slowed down a bit.
              Help us get it pumping again!
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
                Psychobilly Online - No corporate bullshit. No fake profiles. No data mining.
                Forever independent.
              </em>
            </p>
          </div>
        </Section>
      </div>
    </div>
  );
}
