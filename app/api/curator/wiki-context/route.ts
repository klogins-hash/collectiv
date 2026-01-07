/**
 * GET /api/curator/wiki-context
 * Returns full wiki context for ChatGPT to analyze and propose changes
 * This endpoint powers the custom GPT curation system
 */

import { NextRequest, NextResponse } from 'next/server';

interface Article {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  category?: { name: string };
  keywords?: string[];
  relatedArticles?: string[];
  updatedAt?: Date;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

interface Relationship {
  fromArticleId: string;
  toArticleId: string;
  relationType: string;
  strength: number;
}

export async function GET(_request: NextRequest) {
  try {
    // TODO: Replace with actual Prisma queries once database is connected
    // For now, providing mock data structure that matches the API contract

    // Mock articles data
    const articles: Article[] = [
      {
        id: 'article-1',
        title: 'Introduction to RAG',
        slug: 'rag-intro',
        description: 'Fundamentals of Retrieval-Augmented Generation',
        content: 'Retrieval-Augmented Generation (RAG) combines...',
        category: { name: 'Foundations' },
        keywords: ['rag', 'ai', 'llm', 'retrieval'],
        relatedArticles: ['article-2', 'article-3'],
        updatedAt: new Date(),
      },
      {
        id: 'article-2',
        title: 'Advanced RAG Patterns',
        slug: 'rag-advanced',
        description: 'Advanced techniques and patterns in RAG systems',
        content: 'Advanced RAG builds on foundational concepts...',
        category: { name: 'Advanced' },
        keywords: ['rag', 'patterns', 'optimization'],
        relatedArticles: ['article-1'],
        updatedAt: new Date(),
      },
    ];

    const categories: Category[] = [
      {
        id: 'cat-1',
        name: 'Foundations',
        slug: 'foundations',
        description: 'Beginner-friendly content',
      },
      {
        id: 'cat-2',
        name: 'Advanced',
        slug: 'advanced',
        description: 'Advanced techniques and patterns',
      },
    ];

    const allTags = Array.from(
      new Set(articles.flatMap((a: Article) => a.keywords || []))
    );

    const relationships: Relationship[] = [
      {
        fromArticleId: 'article-1',
        toArticleId: 'article-2',
        relationType: 'PREREQUISITE',
        strength: 0.8,
      },
    ];

    const coherenceMetrics = {
      consistencyScore: 0.92,
      tagConsistency: 0.89,
      linkConsistency: 0.95,
      semanticCoherence: 0.88,
      openIssues: 2,
    };

    return NextResponse.json(
      {
        context: {
          articles: articles.map((a: Article) => ({
            id: a.id,
            title: a.title,
            slug: a.slug,
            description: a.description,
            excerpt: a.content.substring(0, 500),
            category: a.category?.name,
            keywords: a.keywords || [],
            relatedArticles: a.relatedArticles || [],
            lastUpdated: a.updatedAt,
          })),
          categories: categories.map((c: Category) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            description: c.description,
          })),
          tags: allTags,
          relationships: relationships.map((r: Relationship) => ({
            from: r.fromArticleId,
            to: r.toArticleId,
            type: r.relationType,
            strength: r.strength,
          })),
          metadata: {
            totalArticles: articles.length,
            totalCategories: categories.length,
            totalTags: allTags.length,
          },
          coherenceMetrics,
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (error) {
    console.error('Error retrieving wiki context:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve wiki context' },
      { status: 500 }
    );
  }
}
