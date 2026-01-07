import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: 'Query must be at least 2 characters' },
        { status: 400 }
      );
    }

    // TODO: Implement full-text search with Prisma
    // const results = await prisma.searchIndex.findMany({
    //   where: {
    //     OR: [
    //       { title: { search: query } },
    //       { content: { search: query } },
    //       { keywords: { hasSome: [query] } },
    //     ],
    //     ...(category && { article: { category: { slug: category } } }),
    //   },
    //   take: limit,
    //   include: { article: true },
    // });

    const mockResults = [
      {
        id: '1',
        title: 'Search Result 1',
        slug: 'search-result-1',
        description: 'A relevant search result',
        category: 'Science & Technology',
        relevanceScore: 0.95,
      },
      {
        id: '2',
        title: 'Search Result 2',
        slug: 'search-result-2',
        description: 'Another relevant result',
        category: 'Science & Technology',
        relevanceScore: 0.87,
      },
    ];

    return NextResponse.json(
      {
        query,
        results: mockResults,
        total: mockResults.length,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (error) {
    console.error('Error searching:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
