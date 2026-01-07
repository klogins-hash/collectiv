/**
 * RAG (Retrieval-Augmented Generation) Utilities for Collectiv
 * Optimized for LLM integration and semantic search
 */

interface ChunkedContent {
  id: string;
  articleId: string;
  chunkIndex: number;
  content: string;
  metadata: {
    title: string;
    section?: string;
    tokens: number;
    startChar: number;
    endChar: number;
  };
  embedding?: number[]; // For vector DB storage
}

interface TokenEstimate {
  approximate: number;
  range: { min: number; max: number };
}

/**
 * Estimate token count using common approximations
 * ~4 characters = 1 token (for English)
 */
export function estimateTokens(text: string): TokenEstimate {
  const charCount = text.length;
  const approximateTokens = Math.ceil(charCount / 4);
  const minTokens = Math.ceil(charCount / 5);
  const maxTokens = Math.ceil(charCount / 3);

  return {
    approximate: approximateTokens,
    range: { min: minTokens, max: maxTokens },
  };
}

/**
 * Split content into RAG-optimized chunks
 * Respects sentence and paragraph boundaries
 */
export function chunkContent(
  content: string,
  chunkSize: number = 1024,
  overlapSize: number = 128,
  articleId: string = '',
  title: string = ''
): ChunkedContent[] {
  const chunks: ChunkedContent[] = [];
  const sentences = content.split(/(?<=[.!?])\s+/);
  let currentChunk = '';
  let startChar = 0;
  let chunkIndex = 0;

  for (const sentence of sentences) {
    const potentialChunk = currentChunk + (currentChunk ? ' ' : '') + sentence;

    if (potentialChunk.length > chunkSize && currentChunk) {
      // Save current chunk
      chunks.push({
        id: `${articleId}-chunk-${chunkIndex}`,
        articleId,
        chunkIndex,
        content: currentChunk,
        metadata: {
          title,
          tokens: estimateTokens(currentChunk).approximate,
          startChar,
          endChar: startChar + currentChunk.length,
        },
      });

      // Start new chunk with overlap
      const overlapStart = Math.max(0, currentChunk.length - overlapSize);
      currentChunk = currentChunk.slice(overlapStart) + ' ' + sentence;
      startChar += overlapStart;
      chunkIndex++;
    } else {
      currentChunk = potentialChunk;
    }
  }

  // Add remaining content
  if (currentChunk.trim()) {
    chunks.push({
      id: `${articleId}-chunk-${chunkIndex}`,
      articleId,
      chunkIndex,
      content: currentChunk,
      metadata: {
        title,
        tokens: estimateTokens(currentChunk).approximate,
        startChar,
        endChar: startChar + currentChunk.length,
      },
    });
  }

  return chunks;
}

/**
 * Format chunks for LLM context window
 */
export function formatContextForLLM(
  chunks: ChunkedContent[],
  maxTokens: number = 4000
): string {
  let result = '';
  let tokenCount = 0;

  for (const chunk of chunks) {
    const chunkTokens = chunk.metadata.tokens;

    if (tokenCount + chunkTokens > maxTokens) {
      break;
    }

    result += `[${chunk.metadata.title}]\n${chunk.content}\n\n`;
    tokenCount += chunkTokens;
  }

  return result;
}

/**
 * Create RAG metadata from article
 */
export function createRAGMetadata(
  articleId: string,
  title: string,
  category: string,
  content: string,
  keywords: string[]
): object {
  const tokenEstimate = estimateTokens(content);

  return {
    articleId,
    title,
    category,
    keywords,
    length: content.length,
    estimatedTokens: tokenEstimate.approximate,
    tokenRange: tokenEstimate.range,
    language: 'en',
    type: 'wiki_article',
    retrievable: true,
  };
}

/**
 * Split content for optimal retrieval
 * Balances chunk size with retrieval quality
 */
export function optimizeForRetrieval(
  content: string,
  options: {
    minChunkSize?: number;
    maxChunkSize?: number;
    overlap?: boolean;
    contextWindow?: number;
  } = {}
): string[] {
  const {
    minChunkSize = 512,
    maxChunkSize = 2048,
    overlap = true,
    contextWindow = 4096,
  } = options;

  const chunks: string[] = [];
  const paragraphs = content.split(/\n\n+/);

  let currentChunk = '';

  for (const paragraph of paragraphs) {
    if ((currentChunk + paragraph).length > maxChunkSize) {
      if (currentChunk) chunks.push(currentChunk);
      currentChunk = paragraph;
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
    }
  }

  if (currentChunk) chunks.push(currentChunk);

  // Ensure minimum chunk size
  const optimizedChunks: string[] = [];
  for (const chunk of chunks) {
    if (chunk.length < minChunkSize && optimizedChunks.length > 0) {
      optimizedChunks[optimizedChunks.length - 1] += '\n\n' + chunk;
    } else {
      optimizedChunks.push(chunk);
    }
  }

  return optimizedChunks;
}

/**
 * Calculate semantic similarity score (simple version without embeddings)
 */
export function calculateSimilarityScore(
  query: string,
  content: string
): number {
  const queryTerms = query.toLowerCase().split(/\s+/);
  const contentLower = content.toLowerCase();

  let matchCount = 0;
  for (const term of queryTerms) {
    if (contentLower.includes(term)) {
      // Count occurrences
      const regex = new RegExp(`\\b${term}\\b`, 'g');
      matchCount += (content.match(regex) || []).length;
    }
  }

  return matchCount / Math.max(queryTerms.length, 1);
}

/**
 * Rank chunks for relevance
 */
export function rankChunksForQuery(
  chunks: ChunkedContent[],
  query: string,
  topK: number = 5
): ChunkedContent[] {
  const rankedChunks = chunks
    .map((chunk) => ({
      ...chunk,
      relevanceScore: calculateSimilarityScore(query, chunk.content),
    }))
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, topK)
    .map(({ relevanceScore, ...chunk }) => chunk);

  return rankedChunks;
}

/**
 * Generate RAG prompt template
 */
export function generateRAGPrompt(
  query: string,
  context: string,
  systemPrompt?: string
): string {
  const baseSystemPrompt =
    systemPrompt ||
    `You are a helpful assistant answering questions based on the provided context from the Collectiv encyclopedia.
    Answer only based on the provided context and be specific with citations.`;

  return `${baseSystemPrompt}

Context from Collectiv:
${context}

Question: ${query}

Answer:`;
}

/**
 * Prepare article for RAG indexing
 */
export function prepareForRAGIndexing(article: {
  id: string;
  title: string;
  content: string;
  category: string;
  keywords: string[];
}): { chunks: ChunkedContent[]; metadata: object } {
  const chunks = chunkContent(article.content, 1024, 128, article.id, article.title);
  const metadata = createRAGMetadata(article.id, article.title, article.category, article.content, article.keywords);

  return { chunks, metadata };
}

/**
 * Extract key information for RAG summaries
 */
export function extractKeySummary(
  content: string,
  maxLength: number = 500
): string {
  // Simple extraction - gets first comprehensive sentences
  const sentences = content.split(/(?<=[.!?])\s+/);
  let summary = '';

  for (const sentence of sentences) {
    if (summary.length + sentence.length > maxLength) {
      break;
    }
    summary += (summary ? ' ' : '') + sentence;
  }

  return summary;
}

/**
 * Calculate token budget usage
 */
export function calculateTokenBudget(
  queryTokens: number,
  contextTokens: number,
  systemTokens: number = 100,
  maxTokens: number = 4096
): { available: number; usage: number; percentage: number } {
  const totalUsed = queryTokens + contextTokens + systemTokens;
  const available = Math.max(0, maxTokens - totalUsed);
  const percentage = (totalUsed / maxTokens) * 100;

  return {
    available,
    usage: totalUsed,
    percentage,
  };
}

export default {
  estimateTokens,
  chunkContent,
  formatContextForLLM,
  createRAGMetadata,
  optimizeForRetrieval,
  calculateSimilarityScore,
  rankChunksForQuery,
  generateRAGPrompt,
  prepareForRAGIndexing,
  extractKeySummary,
  calculateTokenBudget,
};
