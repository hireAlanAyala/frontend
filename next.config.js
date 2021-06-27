module.exports = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/',
        destination: '/savers',
        permanent: true,
      },
    ];
  },
};
