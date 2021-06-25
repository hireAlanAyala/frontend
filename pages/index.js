import Head from 'next/head';
import { NavBar } from '../src/components';

export default function Home() {
  return (
    <div>
      <Head>
        <title>Stackup | Compare</title>
        <meta name="Stackup | Compare" content="Compare auto-compounding yields" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <NavBar />

      <main></main>

      <footer></footer>
    </div>
  );
}
