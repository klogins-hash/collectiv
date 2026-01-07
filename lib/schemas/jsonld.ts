/**
 * JSON-LD Schema Generators for GEO (Generative Engine Optimization)
 * Optimizes Collectiv for AI agents and RAG systems
 */

export interface JSONLDArticle {
  '@context': string;
  '@type': string;
  headline: string;
  description: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  author?: {
    '@type': string;
    name: string;
    url?: string;
  };
  publisher?: {
    '@type': string;
    name: string;
  };
  mainEntity?: {
    '@type': string;
    text: string;
  };
  articleBody: string;
  keywords: string[];
}

export interface AtomicAnswer {
  id: string;
  heading: string;
  answer: string; // 40-60 words, AI-citable
  relatedTopics: string[];
  confidence: number; // 0-1, indicates E-E-A-T
}

export interface FAQPageSchema {
  '@context': string;
  '@type': string;
  mainEntity: Array<{
    '@type': string;
    name: string;
    acceptedAnswer: {
      '@type': string;
      text: string;
    };
  }>;
}

/**
 * Generate Article schema with atomic answers
 */
export function generateArticleSchema(article: {
  title: string;
  description: string;
  content: string;
  slug: string;
  author?: string;
  category?: string;
  keywords: string[];
  url: string;
  image?: string;
  createdAt: Date;
  updatedAt?: Date;
}): JSONLDArticle {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    image: article.image || `${article.url}/og-image.png`,
    datePublished: article.createdAt.toISOString(),
    dateModified: article.updatedAt?.toISOString(),
    author: article.author ? {
      '@type': 'Person',
      name: article.author,
    } : undefined,
    publisher: {
      '@type': 'Organization',
      name: 'Collectiv',
    },
    mainEntity: {
      '@type': 'Thing',
      text: article.description,
    },
    articleBody: article.content,
    keywords: article.keywords,
  };
}

/**
 * Extract atomic answers from content (AI-optimized chunks)
 * Each answer is 40-60 words for easy RAG ingestion
 */
export function extractAtomicAnswers(content: string, heading: string): AtomicAnswer[] {
  const answers: AtomicAnswer[] = [];
  const sentences = content.match(/[^.!?]+[.!?]+/g) || [];

  let currentAnswer = '';
  let wordCount = 0;

  for (const sentence of sentences) {
    const words = sentence.trim().split(/\s+/).length;

    if (wordCount + words > 60 && currentAnswer.trim()) {
      // Save current atomic answer
      answers.push({
        id: `${heading.toLowerCase().replace(/\s+/g, '-')}-${answers.length}`,
        heading,
        answer: currentAnswer.trim(),
        relatedTopics: extractEntities(currentAnswer),
        confidence: 0.95, // Default E-E-A-T
      });

      currentAnswer = '';
      wordCount = 0;
    }

    currentAnswer += ' ' + sentence.trim();
    wordCount += words;
  }

  // Add remaining content
  if (currentAnswer.trim() && 40 <= wordCount && wordCount <= 60) {
    answers.push({
      id: `${heading.toLowerCase().replace(/\s+/g, '-')}-${answers.length}`,
      heading,
      answer: currentAnswer.trim(),
      relatedTopics: extractEntities(currentAnswer),
      confidence: 0.95,
    });
  }

  return answers;
}

/**
 * Generate FAQ Page schema from Q&A pairs
 * High RAG value schema
 */
export function generateFAQSchema(faqs: Array<{
  question: string;
  answer: string;
}>): FAQPageSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Generate HowTo schema for step-by-step content
 */
export function generateHowToSchema(title: string, steps: Array<{
  name: string;
  description: string;
}>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: title,
    step: steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.description,
    })),
  };
}

/**
 * Extract entities for knowledge graph building
 */
function extractEntities(text: string): string[] {
  const entityPatterns = [
    /\b([A-Z][a-z]+ [A-Z][a-z]+)\b/g, // Proper nouns
    /\b(the [a-z]+)\b/gi, // The + noun
  ];

  const entities = new Set<string>();

  for (const pattern of entityPatterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      entities.add(match[1].toLowerCase());
    }
  }

  return Array.from(entities);
}

/**
 * Generate full JSON-LD document for article
 */
export function generateFullArticleJSON(article: {
  title: string;
  description: string;
  content: string;
  slug: string;
  author?: string;
  category?: string;
  keywords: string[];
  url: string;
  image?: string;
  createdAt: Date;
  updatedAt?: Date;
  atomicAnswers: AtomicAnswer[];
}) {
  const articleSchema = generateArticleSchema(article);

  return {
    '@context': 'https://schema.org',
    '@graph': [
      articleSchema,
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: article.url.split('/').slice(0, 3).join('/'),
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: article.category || 'Articles',
            item: `${article.url.split('/').slice(0, 3).join('/')}/category/${article.category}`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: article.title,
            item: article.url,
          },
        ],
      },
    ],
  };
}

/**
 * Generate Answer-First summary (40-60 words)
 * Used immediately after H1 for AI ingestion
 */
export function generateAnswerFirstSummary(
  content: string,
  targetWordCount: number = 50
): string {
  const sentences = content.match(/[^.!?]+[.!?]+/g) || [];
  let summary = '';
  let wordCount = 0;

  for (const sentence of sentences) {
    const sentenceWords = sentence.trim().split(/\s+/).length;

    if (wordCount + sentenceWords > targetWordCount + 10) break;

    summary += ' ' + sentence.trim();
    wordCount += sentenceWords;
  }

  return summary.trim();
}

export default {
  generateArticleSchema,
  generateFAQSchema,
  generateHowToSchema,
  generateFullArticleJSON,
  generateAnswerFirstSummary,
  extractAtomicAnswers,
};
