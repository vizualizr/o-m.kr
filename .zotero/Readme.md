# About this folder

This folder is to store the backup file of **the templates for Zotero Better Note plugin**.

## What does the templates do in this project [EN]

**Better Notes for Zotero** is where **all blog post drafting begins**. It lets authors write in **Markdown** and embed **Pandoc-style citations (`[@citekey]`)** directly within their notes.

The key feature for this project is its **highly customized export template**. This template ensures:

- **Smart File Output**: Generates `.mdx` or `.md` files with unique names based on note title and Zotero key if the note has the designated tag, here `o-m.kr`.
- **Clean Content**: Automatically removes initial code blocks, blockquotes, and top-level headings, ensuring only the core content is published to Astro. Then treat them as metadata. The detail is below.
- **Automated Frontmatter**: Dynamically creates a complete **YAML Frontmatter** for Astro posts, including:
  - Post metadata (type, headline, summary/rubric, SEO-friendly slug).
  - Publication dates (creation, release) converted to ISO 8601.
  - Author info, relevant Zotero tags (excluding specific internal tags like `o-m.kr`), and keywords.
  - Placeholder for images and revision history.
- **HTML Parsing for Metadata**: Uses `DOMParser` to extract specific metadata (like summaries and slugs) directly from HTML elements (e.g., `<blockquote>`, `<pre>`) within the Zotero note.

In short, Better Notes provides the **structured Markdown output and rich Frontmatter** that Astro's `rehype-citation` and associated build processes need to seamlessly publish Zotero-sourced academic content.

## How to use the files in this folder

![The options in the template manager of Better Notes plugin](image.png)

- backup file reserves all the templates within Template Editor.
- Thus only in case you are ready to purge all the existing templates, use the `Restore from backup file` menu
- Other than that, follow the sequence below.

### How to Restore Your Better Notes Template from Backup

If you've backed up your custom Better Notes template, restoring it is straightforward. This process replaces your current Better Notes template with the one from your backup file.

1. **Open Zotero**: Launch the Zotero application on your computer.
2. **Access Zotero Preferences**:
    - On Windows/Linux: Go to `Edit` > `Preferences...`.
    - On macOS: Go to `Zotero` > `Settings...` (or `Preferences...` in older versions).
3. **Navigate to Better Notes Settings**:
    - In the Preferences window, select the `Better Notes` tab on the left sidebar.
4. **Open the Template Editor**:
    - Under the "Export" section, find the "Templates" dropdown. Select the template you wish to modify or confirm it's set to "Custom" if that's what you're restoring.
    - Click the `Edit` button next to the template dropdown. This will open the template editor.
5. **Replace Template Content**:
    - In the template editor window, **delete all existing content**.
    - **Copy the entire content** from your Better Notes template backup file.
    - **Paste the copied content** into the empty template editor.
6. **Save the Template**:
    - Click the `Save` button in the template editor.
    - Close the template editor window and the Zotero Preferences.

Your custom Better Notes template should now be restored, and Zotero will use this template for future note exports.