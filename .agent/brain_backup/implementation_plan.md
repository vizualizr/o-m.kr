# Implement Markdown Link Replacement in `validate_md.py`

This plan adds a new feature to the `markdown-validator` skill to automatically replace local file URLs with their corresponding GitHub repository URLs in markdown links.

## Proposed Changes

### [Component] Markdown Validator Skill

#### [MODIFY] [validate_md.py](file:///d:/yonggeun/porter/git/o-m.kr/production/.agent/skills/markdown-validator/scripts/validate_md.py)

- Implement a replacement logic under the `# 4. Content replacement` comment.
- The logic will:
    1. Search for markdown links `[text](url)` where `url` contains `file:///d:/yonggeun/porter/git/o-m.kr/production/`.
    2. Replace the local path part with `https://github.com/yonggeun/truescape/blob/main/`.
    3. If any replacements occurred, write the updated content back to the original file.
- Move the replacement logic before the final return statements so it actually executes during the validation process.
- Update the success/failure message to indicate if a replacement was performed.

## Verification Plan

### Automated Tests
- I will create a test script `test_replacement.py` that:
    1. Creates a dummy markdown file `test_link.md` with the content: `Check [this file](file:///d:/yonggeun/porter/git/o-m.kr/production/README.md)`.
    2. Runs `python .agent/skills/markdown-validator/scripts/validate_md.py test_link.md .agent/skills/markdown-validator/templates/logseq.json`.
    3. Verifies that the content of `test_link.md` has changed to `Check [this file](https://github.com/yonggeun/truescape/blob/main/README.md)`.
    4. Cleans up the dummy files.

### Manual Verification
- None required as automated test covers the logic.
