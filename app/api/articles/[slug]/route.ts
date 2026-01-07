import { NextRequest, NextResponse } from 'next/server';

// This is a placeholder API route. In production, you'd connect to your database.
// For now, it demonstrates the structure and response format.

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // TODO: Fetch from database using Prisma
    // const article = await prisma.article.findUnique({
    //   where: { slug },
    //   include: {
    //     category: true,
    //     images: true,
    //     sections: true,
    //     relatedArticles: true,
    //     links: true,
    //     author: true,
    //   },
    // });

    // Placeholder response
    const article = {
      id: '1',
      title: 'Example Article',
      slug: slug,
      description: 'This is an example article',
      content: '# Example Article\n\nThis is placeholder content.',
      contentHtml: '<h1>Example Article</h1><p>This is placeholder content.</p>',
      metaTitle: 'Example Article | Collectiv',
      metaDescription: 'Learn about example topics on Collectiv',
      keywords: ['example', 'article', 'wiki'],
      featuredImage: 'https://via.placeholder.com/1200x630',
      category: {
        id: '1',
        name: 'Science & Technology',
        slug: 'science',
      },
      subcategory: null,
      images: [],
      sections: [],
      relatedArticles: [],
      links: [],
      author: {
        id: '1',
        username: 'contributor',
        displayName: 'Example Contributor',
        avatar: 'https://via.placeholder.com/48x48',
      },
      status: 'PUBLISHED',
      viewCount: 1250,
      likeCount: 89,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
    };

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(article, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Error fetching article:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const body = await request.json();

    // TODO: Implement update logic with Prisma
    // const updated = await prisma.article.update({
    //   where: { slug },
    //   data: body,
    // });

    return NextResponse.json(
      { message: 'Article updated successfully', slug },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating article:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
