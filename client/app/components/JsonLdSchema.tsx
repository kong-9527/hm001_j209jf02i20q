import React from 'react';
import Script from 'next/script';

interface FAQItem {
  question: string;
  answer: string;
}

interface JsonLdFAQProps {
  faqs: FAQItem[];
}

export const JsonLdFAQ: React.FC<JsonLdFAQProps> = ({ faqs }) => {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': faqs.map(faq => ({
      '@type': 'Question',
      'name': faq.question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': faq.answer
      }
    }))
  };

  return (
    <Script id="faq-schema" type="application/ld+json">
      {JSON.stringify(faqSchema)}
    </Script>
  );
};

interface JsonLdServiceProps {
  name: string;
  description: string;
  provider: {
    name: string;
    url: string;
  };
  areaServed?: string;
  serviceType?: string;
}

export const JsonLdService: React.FC<JsonLdServiceProps> = ({ 
  name, 
  description, 
  provider,
  areaServed = "Worldwide",
  serviceType = "Garden Design Service"
}) => {
  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    'name': name,
    'description': description,
    'provider': {
      '@type': 'Organization',
      'name': provider.name,
      'url': provider.url
    },
    'areaServed': areaServed,
    'serviceType': serviceType
  };

  return (
    <Script id="service-schema" type="application/ld+json">
      {JSON.stringify(serviceSchema)}
    </Script>
  );
};

interface JsonLdOrganizationProps {
  name: string;
  url: string;
  logo: string;
  description: string;
  sameAs?: string[];
}

export const JsonLdOrganization: React.FC<JsonLdOrganizationProps> = ({
  name,
  url,
  logo,
  description,
  sameAs = []
}) => {
  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'name': name,
    'url': url,
    'logo': logo,
    'description': description,
    'sameAs': sameAs
  };

  return (
    <Script id="organization-schema" type="application/ld+json">
      {JSON.stringify(orgSchema)}
    </Script>
  );
};

interface JsonLdHomePageProps {
  url: string;
  title: string;
  description: string;
  datePublished: string;
  dateModified: string;
  organizationName: string;
  organizationLogo: string;
  pricing: {
    free?: boolean;
    freeTrial?: boolean;
    pricePlans: Array<{
      name: string;
      price: number;
      currency: string;
      frequency: string;
      description: string;
      features: string[];
    }>;
  };
  reviewCount?: number;
  ratingValue?: number;
  mainImage?: string;
}

export const JsonLdHomePage: React.FC<JsonLdHomePageProps> = ({
  url,
  title,
  description,
  datePublished,
  dateModified,
  organizationName,
  organizationLogo,
  pricing,
  reviewCount = 0,
  ratingValue = 0,
  mainImage
}) => {
  // 创建整合多种类型的复杂结构化数据
  const homePageSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      // WebPage 信息
      {
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        'url': url,
        'name': title,
        'description': description,
        'datePublished': datePublished,
        'dateModified': dateModified,
        'isPartOf': {
          '@type': 'WebSite',
          '@id': `${url}#website`,
          'url': url,
          'name': organizationName,
          'description': description,
          'publisher': {
            '@type': 'Organization',
            '@id': `${url}#organization`,
            'name': organizationName,
            'logo': {
              '@type': 'ImageObject',
              'url': organizationLogo,
            }
          }
        },
        'primaryImageOfPage': mainImage ? {
          '@type': 'ImageObject',
          'url': mainImage,
        } : undefined,
      },
      // SoftwareApplication 信息（AI设计工具）
      {
        '@type': 'SoftwareApplication',
        '@id': `${url}#software`,
        'name': `${organizationName} - AI Garden Design Tool`,
        'applicationCategory': 'DesignApplication',
        'operatingSystem': 'Web',
        'offers': {
          '@type': 'AggregateOffer',
          'priceCurrency': pricing.pricePlans[0].currency,
          'lowPrice': Math.min(...pricing.pricePlans.map(plan => plan.price)),
          'highPrice': Math.max(...pricing.pricePlans.map(plan => plan.price)),
          'offerCount': pricing.pricePlans.length,
          'offers': pricing.pricePlans.map(plan => ({
            '@type': 'Offer',
            'name': plan.name,
            'description': plan.description,
            'price': plan.price,
            'priceCurrency': plan.currency,
            'priceValidUntil': new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
            'availability': 'https://schema.org/InStock',
          }))
        },
        'aggregateRating': reviewCount > 0 ? {
          '@type': 'AggregateRating',
          'ratingValue': ratingValue,
          'reviewCount': reviewCount,
          'bestRating': 5,
          'worstRating': 1
        } : undefined,
      }
    ]
  };

  return (
    <Script id="homepage-schema" type="application/ld+json">
      {JSON.stringify(homePageSchema)}
    </Script>
  );
}; 