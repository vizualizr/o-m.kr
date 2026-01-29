import { config, fields, collection } from '@keystatic/core';
import { wrapper, block } from '@keystatic/core/content-components';

export default config({
    storage: {
        kind: 'local',
    },
    collections: {
        posts: collection({
            label: 'Posts',
            slugField: 'title',
            path: 'src/content/posts/*',
            format: { contentField: 'content' },
            schema: {
                title: fields.slug({ name: { label: 'Title' } }),
                content: fields.markdoc({ label: 'Content' }),
            },
        }),
        articles: collection({
            label: 'Articles',
            slugField: 'uid',
            path: 'src/content/k-article/*/',
            format: { contentField: 'content' },
            schema: {
                uid: fields.slug({ name: { label: 'UID' } }),
                type: fields.select({
                    label: 'Type',
                    options: [
                        { label: 'Document', value: 'document' },
                        { label: 'Letter', value: 'letter' },
                        { label: 'Poster', value: 'poster' },
                    ],
                    defaultValue: 'document',
                }),
                category: fields.text({ label: 'Category' }),
                flytitle: fields.text({ label: 'Flytitle' }),
                headline: fields.text({ label: 'Headline' }),
                rubric: fields.text({ label: 'Rubric' }),
                slug: fields.text({ label: 'Slug' }),
                highlight: fields.object({
                    listed: fields.checkbox({ label: 'Listed' }),
                    index: fields.number({ label: 'Index' }),
                }),
                isAccessible: fields.checkbox({ label: 'Is Accessible' }),
                createdDate: fields.datetime({ label: 'Created Date' }),
                releaseDate: fields.datetime({ label: 'Release Date' }),
                revisions: fields.array(
                    fields.object({
                        timestamp: fields.datetime({ label: 'Timestamp' }),
                        message: fields.text({ label: 'Message' }),
                        authors: fields.array(fields.text({ label: 'Author' })),
                    })
                ),
                authors: fields.array(fields.text({ label: 'Author' })),
                tags: fields.array(fields.text({ label: 'Tag' })),
                keywords: fields.array(fields.text({ label: 'Keyword' })),
                images: fields.array(
                    fields.object({
                        src: fields.text({ label: 'Src' }),
                        alt: fields.text({ label: 'Alt' }),
                        caption: fields.text({ label: 'Caption' }),
                    })
                ),
                content: fields.mdx({
                    label: 'Content',
                    components: {
                        Scroller2: block({
                            label: 'Scroller2',
                            schema: {
                                steps: fields.array(
                                    fields.object({
                                        title: fields.text({ label: 'Title' }),
                                        content: fields.text({ label: 'Content', multiline: true }),
                                    })
                                ),
                            },
                        }),
                    }
                }),
            },
        }),
    },
});