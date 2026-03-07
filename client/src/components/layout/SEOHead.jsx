import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEOHead = ({
    title,
    description,
    canonicalUrl,
    ogType = 'website',
    ogImage,
    publishedTime,
    modifiedTime,
    author,
    structuredData
}) => {
    const siteName = 'Automation Bitlance';
    const fullTitle = title ? `${title} | ${siteName}` : siteName;
    const currentUrl = canonicalUrl || typeof window !== 'undefined' ? window.location.href : '';
    const defaultImage = '/og-image.jpg'; // Ensure this exists or provide a fallback URL
    const image = ogImage || defaultImage;

    return (
        <Helmet>
            {/* Basic Meta Tags */}
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={currentUrl} />

            {/* Open Graph */}
            <meta property="og:site_name" content={siteName} />
            <meta property="og:title" content={title || siteName} />
            <meta property="og:description" content={description} />
            <meta property="og:type" content={ogType} />
            <meta property="og:url" content={currentUrl} />
            <meta property="og:image" content={image} />

            {/* Article Specific OG Tags */}
            {publishedTime && <meta property="article:published_time" content={publishedTime} />}
            {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
            {author && <meta property="article:author" content={author} />}

            {/* Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title || siteName} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />

            {/* Structured Data (JSON-LD) */}
            {structuredData && (
                <script type="application/ld+json">
                    {JSON.stringify(structuredData)}
                </script>
            )}
        </Helmet>
    );
};

export default SEOHead;
