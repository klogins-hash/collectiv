/**
 * GET /api/articles/[slug]/jsonld
 * Returns article with full JSON-LD schema markup for AI/SEO
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  generateFullArticleJSON,
  extractAtomicAnswers,
  generateAnswerFirstSummary,
} from '@/lib/schemas/jsonld';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Mock article data - replace with database query
    const article = {
      title: `Article: ${slug}`,
      description: `A comprehensive guide about ${slug}. This article explores all aspects of the topic.`,
      content: `# ${slug}\n\nThis is a detailed article about ${slug}. It contains multiple sections with information.\n\n## Section 1\n\nSome content here about ${slug}.\n\n## Section 2\n\nMore detailed information.\n\n## Section 3\n\nConclusion and related topics.`,
      slug,
      author: 'Collectiv Editor',
      category: 'Technology',
      keywords: [slug, 'guide', 'tutorial', 'overview'],
      url: `http://localhost:3000/articles/${slug}`,
      image: `http://localhost:3000/og-image.png`,
      createdAt: new Date('2026-01-07'),
      updatedAt: new Date('2026-01-07'),
    };

    // Generate atomic answers
    const atomicAnswers = extractAtomicAnswers(article.content, slug);

    // Generate answer-first summary
    const answerFirst = generateAnswerFirstSummary(article.content);

    // Create full JSON-LD response
    const jsonld = generateFullArticleJSON({
      ...article,
      atomicAnswers,
    });

    return NextResponse.json(
      {
        article: {
          title: article.title,
          slug: article.slug,
          description: article.description,
          answerFirst,
          url: article.url,
          author: article.author,
          category: article.category,
          keywords: article.keywords,
          date: {
            published: article.createdAt.toISOString(),
            modified: article.updatedAt?.toISOString(),
          },
        },
        atomicAnswers,
        jsonld,
        '@context': 'https://schema.org',
        '@type': 'Article',
      },
      {
        headers: {
          'Content-Type': 'application/ld+json',
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
        },
      }
    );
  } catch (error) {
    console.error('Error retrieving article JSON-LD:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve article' },
      { status: 500 }
    );
  }
}
