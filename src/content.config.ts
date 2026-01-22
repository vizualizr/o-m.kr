// src/content.config.ts
import { defineCollection, z } from 'astro:content';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const articleSchema = z.object({
  uid: z.string(), // 필수 식별자
  type: z.enum(['page', 'article', 'graphics']),
  category: z.string().optional(),
  flytitle: z.string(),
  headline: z.string(),
  rubric: z.string().optional(),
  slug: z.string(),
  highlight: z.object({
    listed: z.boolean(),
    index: z.number().int().min(1).max(5).optional(),
  }),
  isAccessible: z.boolean(),
  createdDate: z.coerce.date(),
  releaseDate: z.coerce.date(),
  revisions: z.array(
    z.object({
      timestamp: z.coerce.date(),
      message: z.string(),
      authors: z.array(z.string()),
    })
  ).optional(),
  authors: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  keywords: z.array(z.string()).optional(),
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
    const jsonPath = path.resolve('src/data/articles.json');

    // 1. Google Sheets에서 가져온 메타데이터 로드
    const sheetMetadataMap = new Map<string, any>();
    if (fs.existsSync(jsonPath)) {
      const sheetData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
      sheetData.forEach((item: any) => sheetMetadataMap.set(item.uid, item));
    }

    const entries: any[] = [];

    // 2. 로컬 MDX 파일 순회 및 병합
    function walk(dir: string) {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
          walk(fullPath);
        } else if (file.endsWith('.md') || file.endsWith('.mdx')) {
          const content = fs.readFileSync(fullPath, 'utf8');
          const { data, content: body } = matter(content);

          // UID 추출 (프론트매터 우선, 없으면 경로 기반)
          const relativePath = path.relative(articlesDir, fullPath);
          const uid = (data.uid as string) || relativePath.replace(/\\/g, '/').replace(/\.(md|mdx)$/, '');

          // 구글 시트 데이터와 병합 (시트 데이터가 우선순위)
          const sheetInfo = sheetMetadataMap.get(uid) || {};

          const mergedData = {
            ...data,
            ...sheetInfo,
            uid,
          };

          // unique ID for Astro (we use UID)
          entries.push({
            id: uid,
            ...mergedData,
            body,
          });
        }
      }
    }

    if (fs.existsSync(articlesDir)) {
      walk(articlesDir);
    }

    return entries;
  },
  schema: articleSchema,
});

export const collections = {
  articles: articleCollection,
};
