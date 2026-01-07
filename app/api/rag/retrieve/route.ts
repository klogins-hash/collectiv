import { NextRequest, NextResponse } from 'next/server';

/**
 * RAG Retrieval API Endpoint
 * Retrieves relevant article chunks for LLM context
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, topK = 5, maxContextTokens = 4000 } = body;

    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: 'Query must be at least 2 characters' },
        { status: 400 }
      );
    }

    // TODO: In production, implement vector similarity search
    // For now, return mock RAG-ready results

    const mockArticles = [
      {
        id: '1',
        title: 'Article 1',
        slug: 'article-1',
        content: 'This is the article content relevant to the query.',
        category: 'Science',
      },
      {
        id: '2',
        title: 'Article 2',
        slug: 'article-2',
        content: 'Another article with related information.',
        category: 'Technology',
      },
    ];

    // Mock chunking and ranking
    const retrievedChunks = mockArticles.slice(0, topK).map((article, idx) => ({
      id: `${article.id}-chunk-0`,
      articleId: article.id,
      title: article.title,
      slug: article.slug,
      content: article.content,
      relevanceScore: 1 - idx * 0.2,
      tokenCount: Math.ceil(article.content.length / 4),
      metadata: {
        category: article.category,
        startChar: 0,
        endChar: article.content.length,
      },
    }));

    // Calculate total tokens
    const totalTokens = retrievedChunks.reduce((sum, chunk) => sum + chunk.tokenCount, 0);

    return NextResponse.json(
      {
        query,
        chunks: retrievedChunks,
        metadata: {
          totalChunks: retrievedChunks.length,
          totalTokens,
          maxContextTokens,
          availableTokens: Math.max(0, maxContextTokens - totalTokens),
        },
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (error) {
    console.error('Error retrieving RAG context:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Alternative endpoint for getting chunks from a specific article
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const articleId = searchParams.get('articleId');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!articleId) {
      return NextResponse.json(
        { error: 'articleId parameter required' },
        { status: 400 }
      );
    }

    // TODO: Fetch article chunks from Prisma
    // const chunks = await prisma.chunkContent.findMany({
    //   where: { articleId },
    //   take: limit,
    //   orderBy: { chunkIndex: 'asc' },
    // });

    const mockChunks = [
      {
        id: `${articleId}-chunk-0`,
        articleId,
        chunkIndex: 0,
        content: 'First chunk of content',
        metadata: {
          tokens: 5,
          startChar: 0,
          endChar: 25,
        },
      },
      {
        id: `${articleId}-chunk-1`,
        articleId,
        chunkIndex: 1,
        content: 'Second chunk of content',
        metadata: {
          tokens: 5,
          startChar: 25,
          endChar: 48,
        },
      },
    ];

    return NextResponse.json(
      { articleId, chunks: mockChunks.slice(0, limit) },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching article chunks:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
