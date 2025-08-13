import { useEffect } from 'react';

const SEO = ({ 
  title = 'VinitaMart',
  description = 'Discover amazing products at great prices on VinitaMart. Shop now for the best deals!',
  keywords = 'ecommerce, online shopping, buy online, VinitaMart, shop',
  ogTitle = 'VinitaMart',
  ogDescription = 'Discover amazing products at great prices on VinitaMart',
  ogImage = '/logo.png',
  ogUrl = typeof window !== 'undefined' ? window.location.href : '',
  canonical = typeof window !== 'undefined' ? window.location.href : '',
  noIndex = false
}) => {
  useEffect(() => {
    // Update document title
    document.title = title;

    // Update or create meta tags
    const updateMetaTag = (name, content) => {
      let tag = document.querySelector(`meta[name="${name}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('name', name);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    // Update or create Open Graph tags
    const updateOgTag = (property, content) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    // Update or create Twitter card tags
    const updateTwitterTag = (name, content) => {
      let tag = document.querySelector(`meta[name="${name}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('name', name);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    // Update meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    updateMetaTag('robots', noIndex ? 'noindex, nofollow' : 'index, follow');

    // Update Open Graph tags
    updateOgTag('og:type', 'website');
    updateOgTag('og:url', ogUrl);
    updateOgTag('og:title', ogTitle);
    updateOgTag('og:description', ogDescription);
    updateOgTag('og:image', ogImage);

    // Update Twitter Card tags
    updateTwitterTag('twitter:card', 'summary_large_image');
    updateTwitterTag('twitter:url', ogUrl);
    updateTwitterTag('twitter:title', ogTitle);
    updateTwitterTag('twitter:description', ogDescription);
    updateTwitterTag('twitter:image', ogImage);

    // Update canonical link
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', canonical);

    // Cleanup function to remove tags when component unmounts
    return () => {
      // We don't remove the tags as they might be needed by other components
      // The next page will update them as needed
    };
  }, [title, description, keywords, ogTitle, ogDescription, ogImage, ogUrl, canonical, noIndex]);

  return null; // This component doesn't render anything
};

export default SEO;
