이 파일은 AI 어시스턴트(Claude Code, Cursor 등)가 이 저장소의 코드 작업을 수행할 때 참고할 수 있는 지침을 제공합니다.

## 프로젝트 개요

XcodeBuildMCP는 AI 어시스턴트가 Xcode 프로젝트, iOS 시뮬레이터, 디바이스 및 Apple 개발 워크플로우와 상호작용할 수 있도록 표준화된 도구를 제공하는 Model Context Protocol (MCP) 서버입니다. stdio 기반 MCP 서버로 실행되는 TypeScript/Node.js 프로젝트입니다.

## 일반 명령어

### 빌드 및 개발
```bash
npm run build         # TypeScript를 tsup으로 컴파일, 버전 정보 생성
npm run dev           # 감시 모드 개발
npm run bundle:axe    # 시뮬레이터 자동화를 위한 axe CLI 도구 번들링 (로컬 MCP 서버 사용 시 필요)
npm run test          # 전체 Vitest 테스트 스위트 실행
npm run test:watch    # 감시 모드 테스트
npm run lint          # ESLint 코드 검사
npm run lint:fix      # ESLint 코드 검사 및 수정
npm run format:check  # Prettier 코드 검사
npm run format        # Prettier 코드 포맷팅
npm run typecheck     # TypeScript 타입 검사
npm run inspect       # 대화형 MCP 프로토콜 인스펙터 실행
npm run doctor        # Doctor CLI
```

### Reloaderoo를 사용한 개발

**Reloaderoo** (v1.1.2+)는 MCP 클라이언트 설정 없이 XcodeBuildMCP를 위한 CLI 기반 테스트 및 핫 리로드 기능을 제공합니다.

#### 빠른 시작

**CLI 모드 (테스트 및 개발):**
```bash
# 모든 도구 목록
npx reloaderoo inspect list-tools -- node build/index.js

# 모든 도구 호출
npx reloaderoo inspect call-tool list_devices --params '{}' -- node build/index.js

# 서버 정보 가져오기
npx reloaderoo inspect server-info -- node build/index.js

# 리소스 목록 및 읽기
npx reloaderoo inspect list-resources -- node build/index.js
npx reloaderoo inspect read-resource "xcodebuildmcp://devices" -- node build/index.js
```

**프록시 모드 (MCP 클라이언트 통합):**
```bash
# MCP 클라이언트용 영구 서버 시작
npx reloaderoo proxy -- node build/index.js

# 디버그 로깅 포함
npx reloaderoo proxy --log-level debug -- node build/index.js

# 그 다음 AI에게 요청: "내 변경 사항을 로드하기 위해 MCP 서버를 재시작해주세요"
```

#### 모든 CLI Inspect 명령어

Reloaderoo는 포괄적인 MCP 서버 테스트를 위한 8개의 inspect 하위 명령을 제공합니다:

```bash
# 서버 기능 및 정보
npx reloaderoo inspect server-info -- node build/index.js

# 도구 관리
npx reloaderoo inspect list-tools -- node build/index.js
npx reloaderoo inspect call-tool <tool_name> --params '<json>' -- node build/index.js

# 리소스 접근
npx reloaderoo inspect list-resources -- node build/index.js
npx reloaderoo inspect read-resource "<uri>" -- node build/index.js

# 프롬프트 관리
npx reloaderoo inspect list-prompts -- node build/index.js
npx reloaderoo inspect get-prompt <name> --args '<json>' -- node build/index.js

# 연결성 테스트
npx reloaderoo inspect ping -- node build/index.js
```

#### 고급 옵션

```bash
# 사용자 정의 작업 디렉토리
npx reloaderoo inspect list-tools --working-dir /custom/path -- node build/index.js

# 타임아웃 설정
npx reloaderoo inspect call-tool slow_tool --timeout 60000 --params '{}' -- node build/index.js

# 필요한 경우 타임아웃 설정 사용
npx reloaderoo inspect server-info --timeout 60000 -- node build/index.js

# 디버그 로깅 (상세 로깅을 위해 프록시 모드 사용)
npx reloaderoo proxy --log-level debug -- node build/index.js
```

#### 주요 장점

- ✅ **MCP 클라이언트 설정 불필요**: 84개 이상의 모든 도구에 직접 CLI 접근
- ✅ **원시 JSON 출력**: AI 에이전트 및 프로그래밍 방식 사용에 적합
- ✅ **핫 리로드 지원**: MCP 클라이언트 개발을 위한 `restart_server` 도구
- ✅ **Claude Code 호환**: 자동 콘텐츠 블록 통합
- ✅ **8개 Inspect 명령어**: 완전한 MCP 프로토콜 테스트 기능
- ✅ **범용 호환성**: npx를 통해 모든 시스템에서 작동

전체 문서, 예시 및 문제 해결은 @docs/RELOADEROO.md 참조

## 아키텍처 개요

### 플러그인 기반 MCP 아키텍처

XcodeBuildMCP는 MCP 기능(도구 및 리소스)을 노출하고 실행하기 위해 관례에 의한 설정 개념을 사용합니다. 즉, 새 도구나 리소스를 추가하려면 적절한 디렉토리에 새 파일을 생성하기만 하면 자동으로 로드되어 MCP 클라이언트에 노출됩니다.

#### 도구

도구는 MCP 서버의 핵심이며 서버와 상호작용하는 주요 방법입니다. 기능별로 디렉토리에 구성되어 있으며 자동으로 로드되어 MCP 클라이언트에 노출됩니다.

자세한 내용은 @docs/PLUGIN_DEVELOPMENT.md 참조

#### 리소스

리소스는 서버와 상호작용하는 보조적인 방법입니다. 도구에 데이터를 제공하는 데 사용되며 기능별로 디렉토리에 구성되어 있고 자동으로 로드되어 MCP 클라이언트에 노출됩니다.

자세한 내용은 @docs/PLUGIN_DEVELOPMENT.md 참조

### 운영 모드

XcodeBuildMCP는 광범위한 도구 세트를 관리하기 위한 두 가지 모드를 가지고 있으며, `XCODEBUILDMCP_DYNAMIC_TOOLS` 환경 변수로 제어됩니다.

#### 정적 모드 (기본값)
- **환경**: `XCODEBUILDMCP_DYNAMIC_TOOLS=false` 또는 미설정
- **동작**: 모든 도구가 시작 시 로드됩니다. 이는 전체 도구 세트에 즉시 접근할 수 있지만 더 큰 컨텍스트 윈도우를 사용합니다.

#### 동적 모드 (AI 기반)
- **환경**: `XCODEBUILDMCP_DYNAMIC_TOOLS=true`
- **동작**: 처음에는 `discover_tools` 도구만 사용 가능합니다. 자연어 작업 설명을 제공하여 이 도구를 사용할 수 있습니다. 그러면 서버가 LLM 호출(MCP 샘플링을 통해)을 사용하여 가장 관련성 높은 워크플로우 그룹을 식별하고 해당 도구만 동적으로 로드합니다. 이렇게 하면 컨텍스트 윈도우 공간이 절약됩니다.

#### Claude Code 호환성 해결책
- **감지**: Claude Code에서 실행 중일 때 자동 감지
- **목적**: Claude Code가 도구 응답에서 첫 번째 콘텐츠 블록만 표시하는 MCP 사양 위반에 대한 해결책
- **동작**: Claude Code가 감지되면 여러 콘텐츠 블록이 자동으로 `---` 구분자로 구분된 단일 텍스트 응답으로 통합됩니다. 이렇게 하면 모든 정보(테스트 결과 및 stderr 경고 포함)가 Claude Code 사용자에게 표시됩니다.

### 핵심 아키텍처 레이어
1. **MCP Transport**: stdio 프로토콜 통신
2. **플러그인 검색**: 자동 도구 및 리소스 등록 시스템
3. **MCP 리소스**: URI 기반 데이터 접근 (예: `xcodebuildmcp://simulators`)
4. **도구 구현**: 자체 포함 워크플로우 모듈
5. **공유 유틸리티**: 명령 실행, 빌드 관리, 검증
6. **타입**: 공유 인터페이스 및 Zod 스키마

자세한 내용은 @docs/ARCHITECTURE.md 참조

## 테스트

이 프로젝트는 엄격한 **의존성 주입(DI)** 테스트 철학을 시행합니다.

- **Vitest 모킹 금지**: `vi.mock()`, `vi.fn()`, `vi.spyOn()` 등의 사용은 **완전히 금지**되어 있습니다.
- **실행기**: 모든 외부 상호작용(명령 실행 또는 파일 시스템 접근 등)은 주입 가능한 "실행기"를 통해 처리됩니다.
    - `CommandExecutor`: 셸 명령 실행용
    - `FileSystemExecutor`: 파일 시스템 작업용
- **테스트 로직**: 테스트는 도구 파일에서 핵심 `...Logic` 함수를 가져오고 모의 실행기(`createMockExecutor` 또는 `createMockFileSystemExecutor`)를 전달하여 다양한 결과를 시뮬레이션합니다.

이 접근 방식은 테스트가 견고하고 유지 관리가 쉬우며 구현 세부 사항에 밀접하게 결합되지 않고 구성 요소 간의 실제 통합을 검증하도록 보장합니다.

전체 지침은 @docs/TESTING.md 참조

## TypeScript Import 표준

이 프로젝트는 네이티브 TypeScript 런타임과의 호환성을 보장하기 위해 모든 상대 임포트에 **TypeScript 파일 확장자** (`.ts`)를 사용합니다.

### Import 규칙

- ✅ **`.ts` 확장자 사용**: `import { tool } from './tool.ts'`
- ✅ **재내보내기에 `.ts` 사용**: `export { default } from '../shared/tool.ts'`
- ✅ **외부 패키지는 `.js` 사용**: `import { McpServer } from '@camsoft/mcp-sdk/server/mcp.js'`
- ❌ **내부 파일에 `.js` 절대 사용 금지**: `import { tool } from './tool.js'` ← ESLint 오류

### 장점

1. **미래 대비**: 네이티브 TypeScript 런타임(Bun, Deno, Node.js --loader)과 호환
2. **IDE 경험**: 소스 TypeScript 파일로 직접 탐색
3. **일관성**: 임포트 경로가 실제 편집 중인 파일과 일치
4. **최신 표준**: TypeScript 4.7+ `allowImportingTsExtensions`와 일치

### ESLint 적용

이 프로젝트는 이 표준을 자동으로 적용합니다:

```bash
npm run lint  # 내부 파일에 대한 .js 임포트를 포착합니다
```

이를 통해 모든 새 코드가 `.ts` 임포트 패턴을 따르고 현재 및 미래 TypeScript 실행 환경과의 호환성을 유지합니다.

## 릴리스 프로세스

기능 브랜치, 구조화된 풀 리퀘스트 및 선형 커밋 히스토리를 사용한 표준화된 개발 워크플로우를 따르세요. **절대로 main에 직접 푸시하거나 허가 없이 강제 푸시하지 마세요.**

전체 지침은 @docs/RELEASE_PROCESS.md 참조

## 유용한 외부 리소스

### Model Context Protocol

https://modelcontextprotocol.io/llms-full.txt

### MCP 사양

https://modelcontextprotocol.io/specification

### MCP Inspector

https://github.com/modelcontextprotocol/inspector

### MCP 클라이언트 SDK

https://github.com/modelcontextprotocol/typescript-sdk
