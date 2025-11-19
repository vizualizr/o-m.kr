// src/content.config.ts
import { defineCollection, z } from 'astro:content';
import { glob, file } from 'astro/loaders';

const articleSchema = z.object({
  // I saw something very FLYTITLE, I heard that HEADLINE, S V(ing) O
  // I worry/expect that RUBRIC may happen.
  // article type specifies the kind of content: page, article, or graphics.
  type: z.enum(['page', 'article', 'graphics']),
  // category is an umbrella topic to demarcate the adjacent issues.
  category: z.string().optional(),
  // flytitle is an in 2 ~ 4 words of inviting phrase characterizing the issue, little enigmatic.
  flytitle: z.string(),

  // headline is a title clarifies people what is going on. Readers can 
  headline: z.string(),

  // rubric is a informative sentence with objective tone clarifying the issue in the article.
  rubric: z.string(),

  // A SEO friendly conversion of headline 
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

// Define the 'articles' content collection
const articleCollection = defineCollection({
  // Define a schema for the frontmatter to include common GitHub Markdown format items
  schema: articleSchema,
  // Specify the loader to fetch .md, .mdx, and .astro files from the specified directory
  loader: glob({
    pattern: ['**/*.{mdx,md}'],
    base: 'src/content/article',
  }),
});

export const collections = {
  articles: articleCollection,
};