import Head from 'next/head';
import { NavBar, Savers, Footer } from '../src/components';
import supabase from '../src/lib/supabase';

export default function SaversPage({ APY }) {
  return (
    <div style={{ height: '100vh' }}>
      <Head>
        <title>Stackup | Savers</title>
        <meta name="Stackup | Compare" content="Compare auto-compounding yields" />
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🔼</text></svg>"
        />
      </Head>

      <NavBar />
      <Savers APY={APY} />
      <Footer />
    </div>
  );
}

export async function getServerSideProps() {
  const { data } = await supabase
    .from('SaversAnnualPercentageYield')
    .select('APY')
    .order('id', { ascending: false })
    .limit(1)
    .single();

  return {
    props: {
      APY: data?.APY || 0,
    },
  };
}
