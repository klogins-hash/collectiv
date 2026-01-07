/**
 * Cross-Reference System for Collectiv Wiki
 * Handles intelligent linking between articles
 */

interface RelatedArticle {
  id: string;
  title: string;
  slug: string;
  description?: string;
  relevanceScore: number;
}

interface BackLink {
  id: string;
  title: string;
  slug: string;
}

/**
 * Extract keywords from article content
 */
export function extractKeywords(content: string, maxKeywords: number = 10): string[] {
  // Simple keyword extraction - in production, use NLP
  const words = content
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter((word) => word.length > 4);

  // Count word frequency
  const frequency: { [key: string]: number } = {};
  words.forEach((word) => {
    frequency[word] = (frequency[word] || 0) + 1;
  });

  // Sort by frequency and return top keywords
  return Object.entries(frequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, maxKeywords)
    .map(([word]) => word);
}

/**
 * Calculate similarity between two articles based on content
 */
export function calculateSimilarity(content1: string, content2: string): number {
  const keywords1 = new Set(extractKeywords(content1));
  const keywords2 = new Set(extractKeywords(content2));

  let intersection = 0;
  keywords1.forEach((keyword) => {
    if (keywords2.has(keyword)) {
      intersection++;
    }
  });

  const union = keywords1.size + keywords2.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

/**
 * Find related articles based on cross-references and similarity
 */
export function findRelatedArticles(
  currentArticle: { id: string; content: string; title: string },
  allArticles: Array<{ id: string; title: string; slug: string; description?: string; content: string }>,
  limit: number = 5
): RelatedArticle[] {
  const relatedArticles = allArticles
    .filter((article) => article.id !== currentArticle.id)
    .map((article) => ({
      ...article,
      relevanceScore: calculateSimilarity(currentArticle.content, article.content),
    }))
    .filter((article) => article.relevanceScore > 0.1) // Minimum similarity threshold
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, limit)
    .map((article) => ({
      id: article.id,
      title: article.title,
      slug: article.slug,
      description: article.description,
      relevanceScore: article.relevanceScore,
    }));

  return relatedArticles;
}

/**
 * Extract internal article references from content
 */
export function extractInternalReferences(content: string): string[] {
  // Match [[Article Name]] patterns
  const regex = /\[\[([^\]]+)\]\]/g;
  const references: string[] = [];
  let match;

  while ((match = regex.exec(content)) !== null) {
    const reference = match[1].toLowerCase().trim();
    if (!references.includes(reference)) {
      references.push(reference);
    }
  }

  return references;
}

/**
 * Build a knowledge graph connection between articles
 */
export interface KnowledgeGraphNode {
  id: string;
  title: string;
  slug: string;
  connections: Array<{ nodeId: string; type: 'references' | 'referencedBy' | 'related' }>;
}

export function buildKnowledgeGraph(
  articles: Array<{ id: string; title: string; slug: string; content: string }>,
  maxConnectionsPerArticle: number = 10
): Map<string, KnowledgeGraphNode> {
  const graph = new Map<string, KnowledgeGraphNode>();

  // Initialize nodes
  articles.forEach((article) => {
    graph.set(article.id, {
      id: article.id,
      title: article.title,
      slug: article.slug,
      connections: [],
    });
  });

  // Build connections
  articles.forEach((article) => {
    const node = graph.get(article.id)!;
    const references = extractInternalReferences(article.content);

    // Find related articles
    const relatedArticles = findRelatedArticles(article, articles, maxConnectionsPerArticle);

    // Add related connections
    relatedArticles.forEach((related) => {
      node.connections.push({
        nodeId: related.id,
        type: 'related',
      });
    });

    // Add reference connections
    references.forEach((ref) => {
      const referencedArticle = articles.find((a) => a.title.toLowerCase() === ref);
      if (referencedArticle && !node.connections.find((c) => c.nodeId === referencedArticle.id)) {
        node.connections.push({
          nodeId: referencedArticle.id,
          type: 'references',
        });
      }
    });
  });

  return graph;
}

/**
 * Get article recommendations based on current article
 */
export function getRecommendations(
  currentArticleId: string,
  graph: Map<string, KnowledgeGraphNode>,
  limit: number = 5
): KnowledgeGraphNode[] {
  const currentNode = graph.get(currentArticleId);
  if (!currentNode) {
    return [];
  }

  const recommendations = new Map<string, KnowledgeGraphNode>();
  const queue = [currentArticleId];
  const visited = new Set([currentArticleId]);

  // BFS to find recommendations
  while (queue.length > 0 && recommendations.size < limit) {
    const nodeId = queue.shift()!;
    const node = graph.get(nodeId);

    if (!node) continue;

    node.connections.forEach((connection) => {
      if (!visited.has(connection.nodeId)) {
        visited.add(connection.nodeId);
        const connectedNode = graph.get(connection.nodeId);

        if (connectedNode && !recommendations.has(connection.nodeId)) {
          recommendations.set(connection.nodeId, connectedNode);
        }

        if (queue.length < limit * 2) {
          queue.push(connection.nodeId);
        }
      }
    });
  }

  return Array.from(recommendations.values()).slice(0, limit);
}

/**
 * Find articles that reference the current article (backlinks)
 */
export function findBacklinks(
  currentArticleTitle: string,
  allArticles: Array<{ id: string; title: string; slug: string; content: string }>
): BackLink[] {
  const backlinks: BackLink[] = [];
  const currentTitle = currentArticleTitle.toLowerCase();

  allArticles.forEach((article) => {
    const references = extractInternalReferences(article.content);
    if (references.some((ref) => ref === currentTitle)) {
      backlinks.push({
        id: article.id,
        title: article.title,
        slug: article.slug,
      });
    }
  });

  return backlinks;
}

export default {
  extractKeywords,
  calculateSimilarity,
  findRelatedArticles,
  extractInternalReferences,
  buildKnowledgeGraph,
  getRecommendations,
  findBacklinks,
};
