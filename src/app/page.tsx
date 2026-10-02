import { Container } from '@/components/layout/container';
import { Wordmark } from '@/components/layout/wordmark';
import { ButtonLink } from '@/components/ui/button';
import { NodeBackdrop } from '@/components/visuals/node-backdrop';
import { landing } from '@/content/landing';
import { HomeRedirect } from '@/features/auth/home-redirect';
import styles from './landing.module.scss';

export default function LandingPage() {
  return (
    <div className={styles.page}>
      <HomeRedirect />
      <NodeBackdrop />
      <Container className={styles.content}>
        <Wordmark />
        <main className={styles.hero}>
          <span className={styles.tagline}>{landing.tagline}</span>
          <h1>{landing.title}</h1>
          <p>{landing.description}</p>
          <div className={styles.actions}>
            <ButtonLink href="/login" fullWidthOnMobile>
              Ingresar
            </ButtonLink>
            <ButtonLink href="/registro" variant="secondary" fullWidthOnMobile>
              Soy estudiante
            </ButtonLink>
            <ButtonLink href="/registro-profesor" variant="ghost" fullWidthOnMobile>
              Soy profesor
            </ButtonLink>
          </div>
        </main>
        <footer className={styles.footer}>{landing.footer}</footer>
      </Container>
    </div>
  );
}
