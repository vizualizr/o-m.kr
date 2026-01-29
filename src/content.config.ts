// src/content.config.ts
import { defineCollection, z } from 'astro:content';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const articleSchema = z.object({
  // **UID** is the unique identifier for the article.
  uid: z.string(),

  // article type specifies the kind of content: page, article, or graphics.
  // I saw something very FLYTITLE, I heard that HEADLINE, S V(ing) O
  // I worry/expect that RUBRIC may happen.
  type: z.enum(['document', 'letter', 'poster']),
  // category is an umbrella topic to demarcate the adjacent issues.
  category: z.string().optional(),
  // flytitle is an in 2 ~ 4 words of inviting phrase characterizing the issue, little enigmatic.
  flytitle: z.string(),

  // headline is a title clarifies people what is going on. It is informative than attractive.
  headline: z.string(),

  // rubric is a catchy phrase draws the reader whether s/he is interested in the article or not. It is attractive than informative.
  rubric: z.string().optional(),

  // An SEO friendly conversion of headline 
  slug: z.string(),

  // highlight decides the highlight section of landing page exhibits this article. 
  highlight: z.object({
    listed: z.boolean(),
    index: z.number().int().min(1).max(5).optional(),
  }),

  // whether the article is 
  isAccessible: z.boolean(),
  // initial date when the article is drafted
  createdDate: z.coerce.date(),
  // if unset, the article is public based on the release property.
  releaseDate: z.coerce.date(),

  // maintain the revision record
  revisions: z.array(
    z.object({
      // ISO 8601 with timestamp e.g. 2025-04-10T16:48:45.7580000+08:00
      timestamp: z.coerce.date(),
      message: z.string(),
      authors: z.array(z.string()),
    })
  ).optional(),

  // **Authors** of the article
  authors: z.array(z.string()).optional(),
  // **Tags** or categories associated with the article [9, 10].
  tags: z.array(z.string()).optional(),
  // **Keywords** for SEO purposes.
  keywords: z.array(z.string()).optional(),
  // **Featured image** [10]. Can include `src` and `alt`.
  images: z.array(
    z.object({
      src: z.string(),
      alt: z.string(),
      caption: z.string().optional(),
    }),
  ).optional(),
});

// Define the 'articles' content collection with a custom loader
const articleCollection = defineCollection({
  loader: async () => {
    const articlesDir = path.resolve('src/content/article');
    const entries: any[] = [];

    function walk(dir: string) {
      if (!fs.existsSync(dir)) return;
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
          walk(fullPath);
        } else if (file.endsWith('.md') || file.endsWith('.mdx')) {
          const content = fs.readFileSync(fullPath, 'utf8');
          const { data, content: body } = matter(content);

          const relativePath = path.relative(articlesDir, fullPath);
          const uid = (data.uid as string) || relativePath.replace(/\\/g, '/').replace(/\.(md|mdx)$/, '');

          // Legacy type mapping for existing MDX files
          let contentType = data.type as string;
          const typeMap: Record<string, string> = {
            'page': 'document',
            'article': 'letter',
            'graphics': 'poster'
          };
          if (typeMap[contentType]) {
            contentType = typeMap[contentType];
          }

          entries.push({
            id: uid,
            ...data,
            type: contentType,
            uid,
            body,
          });
        }
      }
    }

    walk(articlesDir);
    return entries;
  },
  schema: articleSchema,
});

export const collections = {
  articles: articleCollection,
};
