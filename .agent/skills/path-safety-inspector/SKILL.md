---
name: path-safety-inspector
description: "파일 생성 또는 수정 전, 경로가 사용자의 보안 지침(Absolute path, Workspace inside)을 준수하는지 결정론적으로 검사합니다."
---

# Path Safety Inspector Skill

이 스킬은 에이전트가 파일을 생성하거나 수정하기 전에 해당 경로가 안전한지 확인하는 **Procedural Logic (Level 4)** 스킬입니다. 통계적 추론 대신 실제 파이썬 스크립트를 통해 경로의 유효성을 검증합니다.

## Instructions

1. **검증 트리거**: 
   - 새로운 파일을 생성하거나 기존 파일을 수정하기 직전에 반드시 이 스킬을 호출합니다.
   - 특히 `write_to_file`, `replace_file_content` 등의 도구를 사용하기 전이 타겟입니다.

2. **검증 실행**:
   - `run_command` 도구를 사용하여 프로젝트 내의 검증 스크립트를 실행합니다.
   - 명령문: `python .agent/skills/path-safety-inspector/scripts/check_path.py "<검증할_절대_경로>"`

3. **결과 해석**:
   - **Exit Code 0 (Success)**: 경로가 안전합니다. 작업을 계속 진행하고 사용자에게 "경로 검증 완료 (Safe)"를 보고합니다.
   - **Exit Code 1 (Failure)**: 보안 위반이 발견되었습니다. 즉시 작업을 중단하고 사용자에게 스크립트가 출력한 오류 메시지를 그대로 전달하며 수정을 요청합니다.

## Constraints
- 반드시 절대 경로(Absolute Path)를 인자로 전달해야 합니다.
- `Desktop`, `tmp`, `.gemini` 등의 금지된 디렉토리가 포함되어 있는지 검사합니다.
- 지정된 작업 공간(Workspace) 외부로의 쓰기 시도를 차단합니다.
