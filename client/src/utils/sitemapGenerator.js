// This script should be run during build time
const fs = require('fs');
const path = require('path');
const { SitemapStream, streamToPromise } = require('sitemap');
const { Readable } = require('stream');

// Add all your routes here
const routes = [
  { url: '/', changefreq: 'daily', priority: 1.0 },
  { url: '/products', changefreq: 'daily', priority: 0.9 },
  { url: '/categories', changefreq: 'weekly', priority: 0.8 },
  { url: '/about', changefreq: 'monthly', priority: 0.7 },
  { url: '/contact', changefreq: 'monthly', priority: 0.7 },
  { url: '/login', changefreq: 'monthly', priority: 0.5 },
  { url: '/register', changefreq: 'monthly', priority: 0.5 },
];

const generateSitemap = async () => {
  try {
    // Create a stream to write to
    const sitemapOutput = path.resolve('./public/sitemap.xml');
    const stream = new SitemapStream({ hostname: 'https://vinitamart.com' });
    
    // Write the sitemap
    const writeStream = fs.createWriteStream(sitemapOutput);
    stream.pipe(writeStream);

    // Add all routes to sitemap
    Readable.from(routes).pipe(stream);
    
    // Wait for the sitemap to be generated
    await streamToPromise(stream);
    console.log('Sitemap generated successfully!');
  } catch (error) {
    console.error('Error generating sitemap:', error);
  }
};

// Run the sitemap generator
generateSitemap();
