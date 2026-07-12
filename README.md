# 사계 답사집 프로젝트

사계 동아리의 답사지와 학생 결과물을 모아 운영하는 정적 웹사이트 프로젝트입니다.

## 실행 방법

1. 폴더를 압축 해제합니다.
2. `index.html`을 브라우저로 엽니다.
3. 대문에서 `신안 섬 탐방기`, `제주 탐방기`, 또는 `학생 결과물`을 선택합니다.

## GitHub·Vercel 배포

- 로컬 `15. 동아리 사계 웹페이지` 폴더가 편집 원본입니다.
- 작업을 마친 뒤 변경 파일을 커밋·푸시하면 `rudeia/sagye-dapsazip` 저장소에 반영됩니다.
- Vercel은 GitHub의 `main` 브랜치를 연결해 자동 배포합니다.
- `drafts/`, `.DS_Store`, `.vercel/`은 공개 저장소 또는 배포 대상에서 제외합니다.
- 공개 저장소이므로 학생 개인정보나 사용 허가가 없는 사진은 커밋하지 않습니다.

## 현재 구성

```text
sagye_fieldwork_project/
├─ index.html                    # 대문 페이지
├─ sinan/index.html              # 사계 답사집 - 신안 섬 탐방기
├─ sinan/styles.css              # 신안 답사지 화면 스타일
├─ sinan/data.js                 # 신안 답사지 데이터와 출처 메모
├─ sinan/app.js                  # 신안 답사지 지도·기록·출력 기능
├─ jeju/index.html               # 사계 답사집 - 제주 탐방기
├─ jeju/styles.css               # 제주 답사지 화면 스타일
├─ jeju/data.js                  # 제주 권역·답사지 데이터
├─ jeju/app.js                   # 제주 답사지 지도·기록·출력 기능
├─ jeju/assets/images/jeju/      # 제주 현장 사진 추가 위치
├─ results/2024/index.html       # 2024학년도 결과물 페이지
├─ results/2024/gallery.html     # 2024학년도 사진 갤러리
├─ results/2025/index.html       # 2025학년도 결과물 페이지
├─ results/2025/gallery.html     # 2025학년도 사진 갤러리
├─ docs/results_operation_plan.md # 운영 계획 마크다운
├─ docs/source_verification.md    # 신안 자료 출처·검증 기록
├─ docs/jeju_planning.md          # 제주 답사지 구성안
├─ docs/jeju_source_verification.md # 제주 자료·검증 메모
├─ docs/jeju_image_sources.md     # 제주 대표 사진 라이선스·출처
└─ docs/jeju_academic_sources.md  # 제주 학술 답사 출처·기록 원칙
```

신안 답사지의 외부 공식 출처와 검증 기준은 `docs/source_verification.md`에서 관리합니다.

## 결과물 추가 방법

- 활동 책자 PDF는 각 연도 폴더에 `booklet.pdf` 이름으로 넣습니다.
- 사진은 각 연도 `images` 폴더에 넣고, `gallery.html`의 카드 설명과 이미지 경로를 수정합니다.
- 학생 이름과 얼굴 등 개인정보는 공개 전 반드시 확인합니다.

## Codex 작업 요청 예시

```text
results/2024/gallery.html에 사진 10장을 추가하고, images 폴더의 파일명을 기준으로 카드 설명을 넣어줘.
```

```text
대문 페이지 학생 결과물 탭에 2026학년도 결과물 카드를 추가해줘.
```
