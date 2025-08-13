export const generateProductStructuredData = (product) => {
  if (!product) return null;
  
  const { _id, name, description, price, images, category, brand, inStock, rating, reviewCount } = product;
  
  return {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: name,
    image: images && images.length > 0 ? images[0] : '',
    description: description,
    sku: _id,
    brand: {
      '@type': 'Brand',
      name: brand || 'VinitaMart'
    },
    offers: {
      '@type': 'Offer',
      url: window.location.href,
      priceCurrency: 'INR',
      price: price,
      priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      itemCondition: 'https://schema.org/NewCondition',
      availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
    },
    aggregateRating: rating ? {
      '@type': 'AggregateRating',
      ratingValue: rating,
      reviewCount: reviewCount || 0
    } : undefined
  };
};

export const generateWebsiteStructuredData = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'VinitaMart',
  url: 'https://vinitamart.com',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://vinitamart.com/products?q={search_term_string}',
    'query-input': 'required name=search_term_string'
  }
});
