---
name: file-conflict-manager
description: "파일 덮어쓰기 전 백업을 생성하고, 충돌 발생 시 주석 및 핵심 로직 유실을 방지합니다."
---

# File Conflict Manager Skill

이 스킬은 **Sacred Context(주석 및 문맥 보존)** 원칙을 기술적으로 강제하는 **Procedural Logic (Level 4)** 스킬입니다. 

## Instructions

1.  **충돌 확인**:
    - `path-safety-inspector` 호출 결과가 `[EXISTS]`인 경우 이 스킬을 활성화합니다.

2.  **자동 백업 실행**:
    - 기존 파일을 수정하거나 덮어쓰기 전에 반드시 백업 스크립트를 실행합니다.
    - 명령문: `python .agent/skills/file-conflict-manager/scripts/backup_file.py "<파일_경로>"`
    - 백업 위치: `.agent/backups/`폴더에 타임스탬프와 함께 저장됩니다.

3.  **충돌 해결 정책**:
    - **단순 추가/수정**: `replace_file_content`를 사용하여 기존 주석을 유지하며 필요한 부분만 수정합니다.
    - **전체 교체 (`Overwrite: true`)**: 파일 전체를 교체해야 하는 경우, 기존 파일에 사용자 주석(`//` 또는 `/* */` 또는 `#`)이 포함되어 있는지 확인합니다. 주석이 있다면 사용자에게 백업 생성 사실을 알리고 교체 승인을 다시 한 번 확인합니다.

4.  **결과 보고**:
    - 사용자에게 "기존 파일 백업 완료 (`.agent/backups/...`)" 메시지를 전달하여 안전성을 보장합니다.

## Core Principle
"데이터의 유실보다 중복된 백업이 낫다."
