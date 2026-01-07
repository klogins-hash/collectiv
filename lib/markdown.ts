import MarkdownIt from 'markdown-it';

interface ParsedMarkdown {
  html: string;
  tableOfContents: Array<{ level: number; text: string; id: string }>;
  links: string[];
  images: string[];
}

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
});

/**
 * Parse markdown content and extract metadata
 */
export function parseMarkdown(content: string): ParsedMarkdown {
  const toc: Array<{ level: number; text: string; id: string }> = [];
  const links: string[] = [];
  const images: string[] = [];
  let idCounter = 0;

  // Custom heading renderer to build TOC
  const defaultHeadingOpen = md.renderer.rules.heading_open;
  md.renderer.rules.heading_open = (tokens, idx, _options, env, renderer) => {
    const token = tokens[idx];
    const nextToken = tokens[idx + 1];

    if (nextToken && nextToken.type === 'inline') {
      const text = nextToken.content;
      const level = parseInt(token.tag.substring(1));
      const id = slugify(text);

      if (level <= 3) {
        toc.push({ level, text, id });
      }

      return `<${token.tag} id="${id}">`;
    }

    return defaultHeadingOpen ? defaultHeadingOpen(tokens, idx, _options, env, renderer) : '';
  };

  // Track external links
  const defaultLinkOpen = md.renderer.rules.link_open;
  md.renderer.rules.link_open = (tokens, idx, _options, env, renderer) => {
    const token = tokens[idx];
    const href = token.attrGet('href');
    if (href && !href.startsWith('/') && !href.startsWith('#')) {
      links.push(href);
    }
    return defaultLinkOpen ? defaultLinkOpen(tokens, idx, _options, env, renderer) : '';
  };

  // Track images
  const defaultImageOpen = md.renderer.rules.image;
  md.renderer.rules.image = (tokens, idx, _options, env, renderer) => {
    const token = tokens[idx];
    const src = token.attrGet('src');
    if (src) {
      images.push(src);
    }
    return defaultImageOpen ? defaultImageOpen(tokens, idx, _options, env, renderer) : '';
  };

  const html = md.render(content);

  return {
    html,
    tableOfContents: toc,
    links: [...new Set(links)],
    images: [...new Set(images)],
  };
}

/**
 * Convert text to URL-friendly slug
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Extract links in [[Article Name]] format
 */
export function extractWikiLinks(content: string): Array<{ text: string; slug: string }> {
  const regex = /\[\[([^\]]+)\]\]/g;
  const matches: Array<{ text: string; slug: string }> = [];
  let match;

  while ((match = regex.exec(content)) !== null) {
    const text = match[1];
    const slug = slugify(text);
    matches.push({ text, slug });
  }

  return matches;
}

/**
 * Convert [[Article Name]] links to proper markdown links
 */
export function convertWikiLinksToMarkdown(
  content: string,
  baseUrl: string = '/article'
): string {
  return content.replace(/\[\[([^\]]+)\]\]/g, (match, text) => {
    const slug = slugify(text);
    return `[${text}](${baseUrl}/${slug})`;
  });
}

/**
 * Sanitize HTML to prevent XSS
 */
export function sanitizeHtml(html: string): string {
  // This is a basic implementation. For production, use a library like DOMPurify
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
}

/**
 * Generate excerpt from markdown content
 */
export function generateExcerpt(content: string, length: number = 150): string {
  const plainText = content
    .replace(/#+\s+/g, '')
    .replace(/\*\*|__/g, '')
    .replace(/\*|_/g, '')
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    .replace(/\n+/g, ' ')
    .trim();

  if (plainText.length <= length) {
    return plainText;
  }

  return plainText.substring(0, length).trim() + '...';
}

/**
 * Extract plain text from markdown
 */
export function extractPlainText(content: string): string {
  return content
    .replace(/#+\s+/g, '')
    .replace(/\*\*|__/g, '')
    .replace(/\*|_/g, '')
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    .replace(/!\[([^\]]*)\]\([^\)]+\)/g, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\n+/g, ' ')
    .trim();
}

/**
 * Get reading time in minutes
 */
export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const plainText = extractPlainText(content);
  const wordCount = plainText.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

export default {
  parseMarkdown,
  slugify,
  extractWikiLinks,
  convertWikiLinksToMarkdown,
  sanitizeHtml,
  generateExcerpt,
  extractPlainText,
  calculateReadingTime,
};
