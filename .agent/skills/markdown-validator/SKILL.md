---
name: markdown-validator
description: "마크다운 파일이 지정된 템플릿(Logseq, Astro Post 등) 서식과 일치하는지 결정론적으로 검증합니다."
---

# Markdown Validator Skill

이 스킬은 마크다운 파일의 구조와 메타데이터가 목적에 맞는 서식을 갖추었는지 검사하는 **Procedural Logic (Level 4)** 스킬입니다. 

## Instructions

1.  **서식 선택**:
    - 작업 중인 파일의 성격에 맞는 템플릿을 `.agent/skills/markdown-validator/templates/` 디렉토리에서 선택합니다.
    - 예: Logseq 저널 요약 → `logseq.json`

2.  **검증 실행**:
    - `run_command` 도구를 사용하여 검증 스크립트를 실행합니다.
    - 명령문: `python .agent/skills/markdown-validator/scripts/validate_md.py "<검사할_파일_경로>" ".agent/skills/markdown-validator/templates/<선택한_템플릿>.json"`

3.  **결과 해석**:
    - **Exit Code 0 (Success)**: 서식이 완벽합니다. 사용자에게 "서식 검증 완료"를 보고하고 다음 단계로 진행합니다.
    - **Exit Code 1 (Failure)**: 서식 오류가 발견되었습니다. 출력된 오류 목록을 분석하여 파일을 수정한 후 다시 검증을 수행합니다. 사용자가 승인하기 전에 반드시 검증을 통과해야 합니다.

## Supported Templates
- `logseq.json`: `date`, `type` 프론트매터 및 `# Today's Work Summary`, `## Details` 섹션 필수.

## Extension
새로운 서식이 필요한 경우, `templates/` 폴더에 새로운 JSON 정의를 추가하는 것만으로 기능을 확장할 수 있습니다.
