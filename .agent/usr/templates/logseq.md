# logseq에 기록하기 위한 지시사항 및 서식 정의

- 아래에 해당하거나 유사한 지시를 받으면 에이전트는 대화 내용을 아래 주어진 마크다운 서직에 맞게 요약, 정리해야 한다. 
  - > 마크다운으로 정리해
    > 마크다운 서식으로 정리해줘
    > 록식 형식으로 정리해줘
    > 록식 서식으로 정리해

## 작성 세부 지침

- 문체는 `-다'여야 하고 최대한 개조식으로 작성한다.
- 정리한 내용을 바로 logseq에 붙여어야 하므로 이를 고려해 서식을 조정해야 한다.
- 마크다운 서식이니 별도의 페이지나 캔버스를 생성하지 말고 내용을 바로 복사해서 붙여 넣을 수 있도록 아래 코드블록에 기재된 서식을 그대로 이용한다.
- division은 기준에 따라 다음 가운데 하나를 선택한다. 
  - [[makr]] - 프로그래밍, audiovisual authoring, 개발 업무 등을 포함해 가시적 성과를 만드는 일 일체. 단 글쓰는 일은 제외한다.
  - [[carta]] - 문자를 읽고 쓰는 일로 한정한다. 책 읽고 글 쓰는 일이 이에 해당한다.
  - [[mining]] - 생계를 위해 돈 버는 일이면 모두 포함한다.
  - tag는 에이전트가 판단해 작성한다.
  - stack은 개발 직무를 기준으로 frontend, backend, network 및 기타 이와 같은 계층의 분류를 기재한다.
  - type에는 아무런 내용도 넣어서는 안 된다.

```markdown
date-created:: [[YYYY-MM-DD]]
date-modified:: [[YYYY-MM-DD]]
division::
stack::
tags::
type::
alias::
public:: false
status:: [[ai-generated]]

- ## Summary
	-

- ## Steps
	-

- ## Troubleshooting
	-

- ## log
	- [[YYYY-MM-DD]] Page created.

- ### References
	-
```

## 소프트웨어 관련 주제

- 만약 질의 응답 내용이 특정 소프트웨어를 관리하는 내용이면 다음 서식을 이용해야 한다.

```markdown
item-type:: [[software]]
outcome::
host::
status::
date-of-installation::
date-of-update:: [[YYYY-MM-DD]]
alias::
public:: false
status:: [[ai-generated]]

- ## Introduction
	-

- ## Steps
	-

- ## Troubleshooting
	-

- ## log
	- [[YYYY-MM-DD]] Page created.

- ### References
	-
```
- status는 현재 사용 상황에 따라, [[incumbent]], [[installed]], [[pooled]], [[uninstalled]] 가운데 하나를 선택한다. 기본 정보 파악만 한 거면 대부분 [[pooled]]에 해당한다.
- host는 내가 소유한 아래 기기 가운데 하나를 기재한다. 최신 기기 현황은 `d:\yonggeun\.agent\workflows\a. assets\devices.md`을 기준으로 한다.