module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; connect-src 'self' https://xtxnjezexscpgrlhqutk.supabase.co; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://*.vercel.live; style-src 'self' 'unsafe-inline'; frame-src 'self' https://vercel.live; img-src 'self' https://lh3.googleusercontent.com;",
          },
        ],
      },
    ];
  },
}; 