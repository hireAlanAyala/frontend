import Head from 'next/head';
import { NavBar, Savers, Footer } from '../src/components';

export default function Home() {
  return (
    <div style={{ height: '100vh' }}>
      <Head>
        <title>Stackup | Savers</title>
        <meta name="Stackup | Compare" content="Compare auto-compounding yields" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <NavBar />
      <Savers />
      <Footer />
    </div>
  );
}
