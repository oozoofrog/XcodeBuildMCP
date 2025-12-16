<img src="banner.png" alt="XcodeBuild MCP" width="600"/>

AI 어시스턴트 및 기타 MCP 클라이언트와 통합하기 위한 Xcode 관련 도구를 제공하는 Model Context Protocol (MCP) 서버입니다.

[![CI](https://github.com/cameroncooke/XcodeBuildMCP/actions/workflows/ci.yml/badge.svg)](https://github.com/cameroncooke/XcodeBuildMCP/actions/workflows/ci.yml)
[![npm version](https://badge.fury.io/js/xcodebuildmcp.svg)](https://badge.fury.io/js/xcodebuildmcp) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) [![Node.js](https://img.shields.io/badge/node->=18.x-brightgreen.svg)](https://nodejs.org/) [![Xcode 16](https://img.shields.io/badge/Xcode-16-blue.svg)](https://developer.apple.com/xcode/) [![macOS](https://img.shields.io/badge/platform-macOS-lightgrey.svg)](https://www.apple.com/macos/) [![MCP](https://img.shields.io/badge/MCP-Compatible-green.svg)](https://modelcontextprotocol.io/) [![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/cameroncooke/XcodeBuildMCP)

## 목차

- [개요](#개요)
- [왜 필요한가?](#왜-필요한가)
- [기능](#기능)
  - [Xcode 프로젝트 관리](#xcode-프로젝트-관리)
  - [Swift Package Manager](#swift-package-manager)
  - [시뮬레이터 관리](#시뮬레이터-관리)
  - [디바이스 관리](#디바이스-관리)
  - [앱 유틸리티](#앱-유틸리티)
  - [MCP 리소스](#mcp-리소스)
- [시작하기](#시작하기)
  - [사전 요구사항](#사전-요구사항)
  - [MCP 클라이언트 설정](#mcp-클라이언트-설정)
    - [원클릭 설치](#원클릭-설치)
    - [일반 설치](#일반-설치)
    - [특정 클라이언트 설치 안내](#특정-클라이언트-설치-안내)
      - [OpenAI Codex CLI](#openai-codex-cli)
      - [Claude Code CLI](#claude-code-cli)
      - [Smithery](#smithery)
    - [MCP 호환성](#mcp-호환성)
- [증분 빌드 지원](#증분-빌드-지원)
- [동적 도구](#동적-도구)
  - [동적 도구란?](#동적-도구란)
  - [동적 도구 활성화 방법](#동적-도구-활성화-방법)
  - [사용 예시](#사용-예시)
  - [클라이언트 호환성](#클라이언트-호환성)
  - [선택적 워크플로우 로딩 (정적 모드)](#선택적-워크플로우-로딩-정적-모드)
- [디바이스 배포를 위한 코드 서명](#디바이스-배포를-위한-코드-서명)
- [문제 해결](#문제-해결)
  - [Doctor 도구](#doctor-도구)
- [개인정보 보호](#개인정보-보호)
  - [Sentry에 전송되는 정보](#sentry에-전송되는-정보)
  - [Sentry 비활성화](#sentry-비활성화)
- [데모](#데모)
  - [Cursor에서 빌드 오류 자동 수정](#cursor에서-빌드-오류-자동-수정)
  - [새로운 UI 자동화 및 화면 캡처 기능 활용](#새로운-ui-자동화-및-화면-캡처-기능-활용)
  - [Claude Desktop에서 iOS 앱 빌드 및 실행](#claude-desktop에서-ios-앱-빌드-및-실행)
- [기여하기](#기여하기)
- [라이선스](#라이선스)

## 개요

XcodeBuildMCP는 AI 어시스턴트 및 기타 MCP 클라이언트를 위해 Xcode 작업을 도구 및 리소스로 노출하는 Model Context Protocol (MCP) 서버입니다. 현대적인 플러그인 아키텍처로 구축되어 워크플로우 기반 디렉토리로 구성된 포괄적인 자체 포함 도구 세트와 효율적인 데이터 액세스를 위한 MCP 리소스를 제공하여 표준화된 인터페이스를 통해 Xcode 프로젝트, 시뮬레이터, 디바이스 및 Swift 패키지와 프로그래밍 방식으로 상호작용할 수 있습니다.

![xcodebuildmcp2](https://github.com/user-attachments/assets/8961d5db-f7ed-4e60-bbb8-48bfd0bc1353)
<caption>Cursor를 사용하여 iOS 시뮬레이터에서 앱을 빌드, 설치 및 실행하면서 런타임에 로그를 캡처하는 모습.</caption>

## 왜 필요한가?

XcodeBuild MCP 도구는 주로 AI 에이전트와 Xcode 프로젝트 간의 상호작용을 간소화하고 표준화하기 위해 존재합니다. 일반적인 Xcode 작업을 위한 전용 도구를 제공함으로써 수동 또는 잠재적으로 잘못된 명령줄 호출에 대한 의존성을 제거합니다.

이를 통해 신뢰할 수 있고 효율적인 개발 프로세스를 보장하여 에이전트가 구성 오류의 위험을 줄이면서 Xcode의 기능을 원활하게 활용할 수 있습니다.

중요한 점은, 이 MCP가 AI 에이전트가 프로젝트를 빌드하고, 오류를 검사하고, 자율적으로 반복함으로써 코드 변경을 독립적으로 검증할 수 있게 한다는 것입니다. Sweetpad과 같은 사용자 중심 도구와 달리 XcodeBuild MCP는 에이전트가 이러한 워크플로우를 효과적으로 자동화할 수 있도록 지원합니다.

## 기능

XcodeBuildMCP 서버는 다음과 같은 도구 기능을 제공합니다:

### Xcode 프로젝트 관리
- **프로젝트 검색**: Xcode 프로젝트 및 워크스페이스 검색
- **빌드 작업**: macOS, iOS 시뮬레이터 및 iOS 디바이스 대상을 위한 플랫폼별 빌드 도구
- **프로젝트 정보**: Xcode 프로젝트 및 워크스페이스의 스킴 목록 및 빌드 설정 표시 도구
- **정리 작업**: xcodebuild의 기본 clean 액션을 사용한 빌드 제품 정리
- **증분 빌드 지원**: 증분 빌드 지원을 통한 초고속 빌드 (실험적, 옵트인 필요)
- **프로젝트 스캐폴딩**: 워크스페이스 + SPM 패키지 아키텍처를 갖춘 현대적인 템플릿으로 새로운 iOS 및 macOS 프로젝트 생성, 사용자 정의 가능한 번들 식별자, 배포 대상 및 디바이스 패밀리

### Swift Package Manager
- **패키지 빌드**: 구성 및 아키텍처 옵션을 사용한 Swift 패키지 빌드
- **테스트 실행**: 필터링 및 병렬 실행을 통한 Swift 패키지 테스트 스위트 실행
- **실행 파일 실행**: 타임아웃 처리 및 백그라운드 실행 지원을 통한 패키지 바이너리 실행
- **프로세스 관리**: Swift Package 도구로 시작된 장기 실행 실행 파일 목록 및 중지
- **아티팩트 정리**: 새로운 빌드를 위한 빌드 아티팩트 및 파생 데이터 제거

### 시뮬레이터 관리
- **시뮬레이터 제어**: 시뮬레이터 목록, 부팅 및 열기
- **앱 라이프사이클**: 완전한 앱 관리 - 시뮬레이터에서 앱 설치, 실행 및 중지
- **로그 캡처**: 시뮬레이터에서 런타임 로그 캡처
- **UI 자동화**: 시뮬레이터 UI 요소와 상호작용
- **스크린샷**: 시뮬레이터에서 스크린샷 캡처
- **비디오 캡처**: 시뮬레이터 비디오 캡처 시작/중지를 MP4로 저장 (AXe v1.1.0+)

### 디바이스 관리
- **디바이스 검색**: USB 또는 Wi-Fi로 연결된 물리적 Apple 디바이스 목록
- **앱 라이프사이클**: 완전한 앱 관리 - 물리적 디바이스에서 앱 빌드, 설치, 실행 및 중지
- **테스트**: 상세한 결과 및 크로스 플랫폼 지원을 통한 물리적 디바이스에서 테스트 스위트 실행
- **로그 캡처**: 물리적 Apple 디바이스에서 실행 중인 앱의 콘솔 출력 캡처
- **무선 연결**: Wi-Fi 네트워크를 통해 연결된 디바이스 지원

### 앱 유틸리티
- **번들 ID 추출**: 모든 Apple 플랫폼의 앱 번들에서 번들 식별자 추출
- **앱 라이프사이클 관리**: 모든 플랫폼에서 완전한 앱 라이프사이클 제어
  - 시뮬레이터, 물리적 디바이스 및 macOS에서 앱 실행
  - 프로세스 ID 또는 번들 ID 관리로 실행 중인 앱 중지
  - 포괄적인 앱 관리를 위한 프로세스 모니터링 및 제어

### MCP 리소스

MCP 리소스를 지원하는 클라이언트를 위해 XcodeBuildMCP는 효율적인 URI 기반 데이터 액세스를 제공합니다:

- **시뮬레이터 리소스** (`xcodebuildmcp://simulators`): UUID 및 상태와 함께 사용 가능한 iOS 시뮬레이터에 직접 액세스
- **디바이스 리소스** (`xcodebuildmcp://devices`): UDID 및 상태와 함께 연결된 물리적 Apple 디바이스에 직접 액세스
- **Doctor 리소스** (`xcodebuildmcp://doctor`): Xcode 버전, macOS 버전 및 Node.js 버전과 같은 환경 정보에 직접 액세스

## 시작하기

### 사전 요구사항

- macOS 14.5 이상
- Xcode 16.x 이상
- Node 18.x 이상

> 비디오 캡처는 번들된 AXe 바이너리 (v1.1.0+)가 필요합니다. `record_sim_video`를 사용하기 전에 로컬에서 `npm run bundle:axe`를 한 번 실행하세요. 단위 테스트에는 필요하지 않습니다.

MCP 클라이언트 설정

#### 원클릭 설치

빠른 설치를 위해 다음 링크를 사용할 수 있습니다:

[![Install MCP Server](https://cursor.com/deeplink/mcp-install-dark.svg)](https://cursor.com/en/install-mcp?name=XcodeBuildMCP&config=eyJ0eXBlIjoic3RkaW8iLCJjb21tYW5kIjoibnB4IC15IHhjb2RlYnVpbGRtY3BAbGF0ZXN0IiwiZW52Ijp7IklOQ1JFTUVOVEFMX0JVSUxEU19FTkFCTEVEIjoiZmFsc2UiLCJYQ09ERUJVSUxETUNQX1NFTlRSWV9ESVNBQkxFRCI6ImZhbHNlIn19)

[<img src="https://img.shields.io/badge/VS_Code-VS_Code?style=flat-square&label=Install%20Server&color=0098FF" alt="Install in VS Code">](https://insiders.vscode.dev/redirect/mcp/install?name=XcodeBuildMCP&config=%7B%22command%22%3A%22npx%22%2C%22args%22%3A%5B%22-y%22%2C%22xcodebuildmcp%40latest%22%5D%7D)

[<img alt="Install in VS Code Insiders" src="https://img.shields.io/badge/VS_Code_Insiders-VS_Code_Insiders?style=flat-square&label=Install%20Server&color=24bfa5">](https://insiders.vscode.dev/redirect/mcp/install?name=XcodeBuildMCP&config=%7B%22command%22%3A%22npx%22%2C%22args%22%3A%5B%22-y%22%2C%22xcodebuildmcp%40latest%22%5D%7D&quality=insiders)

#### 일반 설치

대부분의 MCP 클라이언트(Cursor, VS Code, Windsurf, Claude Desktop 등)는 다음 JSON 설정 형식을 표준으로 사용합니다. 클라이언트의 JSON 설정의 `mcpServers` 객체에 다음을 추가하면 됩니다:

```json
"XcodeBuildMCP": {
  "command": "npx",
  "args": [
    "-y",
    "xcodebuildmcp@latest"
  ]
}
```

#### 특정 클라이언트 설치 안내

##### OpenAI Codex CLI

Codex는 MCP 서버를 설정하기 위해 toml 설정 파일을 사용합니다. [OpenAI의 Codex CLI](https://github.com/openai/codex)에 XcodeBuildMCP를 설정하려면 Codex CLI 설정 파일에 다음 설정을 추가하세요:

```toml
[mcp_servers.XcodeBuildMCP]
command = "npx"
args = ["-y", "xcodebuildmcp@latest"]
env = { "INCREMENTAL_BUILDS_ENABLED" = "false", "XCODEBUILDMCP_SENTRY_DISABLED" = "false" }
```

자세한 내용은 [OpenAI Codex MCP 서버 설정](https://github.com/openai/codex/blob/main/codex-rs/config.md#mcp_servers) 문서를 참조하세요.

##### Claude Code CLI

[Claude Code](https://code.anthropic.com)에서 XcodeBuildMCP를 사용하려면 명령줄을 통해 추가할 수 있습니다:

```bash
# Claude Code에 XcodeBuildMCP 서버 추가
claude mcp add XcodeBuildMCP npx xcodebuildmcp@latest

# 또는 환경 변수와 함께
claude mcp add XcodeBuildMCP npx xcodebuildmcp@latest -e INCREMENTAL_BUILDS_ENABLED=false -e XCODEBUILDMCP_SENTRY_DISABLED=false
```

##### Smithery

[Smithery](https://smithery.ai/server/@cameroncooke/XcodeBuildMCP)를 통해 Claude Desktop용 XcodeBuildMCP 서버를 자동으로 설치하려면:

```bash
npx -y @smithery/cli install @cameroncooke/XcodeBuildMCP --client claude
```

> [!IMPORTANT]
> XcodeBuildMCP는 xcodebuild에 매크로 검증 건너뛰기를 요청합니다. 이는 Swift 매크로를 사용하는 프로젝트를 빌드할 때 오류를 방지하기 위함입니다.

#### MCP 호환성

XcodeBuildMCP는 MCP 도구, 리소스 및 샘플링을 모두 지원합니다. 현재 다음 에디터들은 다양한 수준의 MCP 기능 지원을 제공합니다:

| 에디터 | 도구 | 리소스 | 샘플링 |
|--------|-------|-----------|---------|
| **VS Code** | ✅ | ✅ | ✅ |
| **Cursor** | ✅ | ❌ | ❌ |
| **Windsurf** | ✅ | ❌ | ❌ |
| **Claude Code** | ✅ | ✅ | ❌ |
| **Claude Desktop** | ✅ | ✅ | ❌ |

## 증분 빌드 지원

XcodeBuildMCP는 증분 빌드에 대한 실험적 지원을 포함합니다. 이 기능은 기본적으로 비활성화되어 있으며 `INCREMENTAL_BUILDS_ENABLED` 환경 변수를 `true`로 설정하여 활성화할 수 있습니다:

증분 빌드를 활성화하려면 `INCREMENTAL_BUILDS_ENABLED` 환경 변수를 `true`로 설정하세요:

MCP 설정 예시:
```json
"XcodeBuildMCP": {
  ...
  "env": {
    "INCREMENTAL_BUILDS_ENABLED": "true"
  }
}
```

> [!IMPORTANT]
> 증분 빌드 지원은 현재 매우 실험적이며 결과가 다를 수 있습니다. 발생하는 문제는 [이슈 트래커](https://github.com/cameroncooke/XcodeBuildMCP/issues)에 보고해 주세요.

## 동적 도구

XcodeBuildMCP는 AI 어시스턴트에서 컨텍스트 윈도우 사용을 최적화하기 위해 동적 도구 로딩을 지원합니다. 이 기능은 XcodeBuildMCP가 제공하는 광범위한 도구 세트를 관리하는 데 특히 유용합니다.

### 동적 도구란?

기본적으로 XcodeBuildMCP는 시작 시 모든 사용 가능한 도구를 로드합니다(정적 모드). 이는 전체 도구 세트에 즉시 액세스할 수 있지만 더 큰 컨텍스트 윈도우를 사용합니다. 동적 도구 모드는 다음과 같이 이 문제를 해결합니다:

1. **최소한으로 시작**: 초기에는 `discover_tools` 및 `discover_projs`와 같은 필수 도구만 사용 가능
2. **AI 기반 검색**: AI 에이전트가 XcodeBuildMCP가 개발 작업에 도움이 될 수 있다고 판단하면 자동으로 `discover_tools` 도구를 사용
3. **지능형 로딩**: 서버가 LLM 호출을 사용하여 가장 관련성 높은 워크플로우 그룹을 식별하고 해당 도구만 동적으로 로드
4. **컨텍스트 효율성**: 전체 기능을 유지하면서 초기 컨텍스트 공간을 전체 도구 목록에서 단 2개의 검색 도구로 줄임

### 동적 도구 활성화 방법

동적 도구를 활성화하려면 `XCODEBUILDMCP_DYNAMIC_TOOLS` 환경 변수를 `true`로 설정하세요:

MCP 클라이언트 설정 예시:
```json
"XcodeBuildMCP": {
  ...
  "env": {
    "XCODEBUILDMCP_DYNAMIC_TOOLS": "true"
  }
}
```

### 사용 예시

활성화되면 AI 에이전트는 컨텍스트에 따라 관련 도구를 자동으로 검색하고 로드합니다. 예를 들어, iOS 앱 작업을 언급하거나 에이전트가 워크스페이스에서 iOS 개발 작업을 감지하면 자동으로 `discover_tools` 도구를 사용하여 워크플로우에 필요한 적절한 시뮬레이터 및 프로젝트 도구를 로드합니다.

### 클라이언트 호환성

동적 도구는 AI 기반 도구 검색이 작동하기 위해 **MCP 샘플링**을 지원하는 MCP 클라이언트가 필요합니다:

| 에디터 | 동적 도구 지원 |
|--------|----------------------|
| **VS Code** | ✅ |
| **Cursor** | ❌ (MCP 샘플링 미지원) |
| **Windsurf** | ❌ (MCP 샘플링 미지원) |
| **Claude Code** | ❌ (MCP 샘플링 미지원) |
| **Claude Desktop** | ❌ (MCP 샘플링 미지원) |

> [!NOTE]
> MCP 샘플링을 지원하지 않는 클라이언트의 경우 XcodeBuildMCP는 `XCODEBUILDMCP_DYNAMIC_TOOLS` 설정에 관계없이 시작 시 모든 도구를 로드하는 정적 모드로 자동 폴백됩니다.

### 선택적 워크플로우 로딩 (정적 모드)

MCP 샘플링을 지원하지 않지만 여전히 컨텍스트 윈도우 사용을 줄이고 싶은 클라이언트의 경우 `XCODEBUILDMCP_ENABLED_WORKFLOWS` 환경 변수를 사용하여 특정 워크플로우만 선택적으로 로드할 수 있습니다:

```json
"XcodeBuildMCP": {
  ...
  "env": {
    "XCODEBUILDMCP_ENABLED_WORKFLOWS": "simulator,device,project-discovery"
  }
}
```

**사용 가능한 워크플로우:**
- `device` (14개 도구) - iOS 디바이스 개발
- `simulator` (18개 도구) - iOS 시뮬레이터 개발
- `simulator-management` (8개 도구) - 시뮬레이터 관리
- `swift-package` (6개 도구) - Swift Package Manager
- `project-discovery` (5개 도구) - 프로젝트 검색
- `macos` (11개 도구) - macOS 개발
- `ui-testing` (11개 도구) - UI 테스트 및 자동화
- `logging` (4개 도구) - 로그 캡처 및 관리
- `project-scaffolding` (2개 도구) - 프로젝트 스캐폴딩
- `utilities` (1개 도구) - 프로젝트 유틸리티
- `doctor` (1개 도구) - 시스템 Doctor
- `discovery` (1개 도구) - 동적 도구 검색

> [!NOTE]
> `XCODEBUILDMCP_ENABLED_WORKFLOWS` 설정은 정적 모드에서만 작동합니다. `XCODEBUILDMCP_DYNAMIC_TOOLS=true`가 설정되면 선택적 워크플로우 설정은 무시됩니다.

## 디바이스 배포를 위한 코드 서명

디바이스 배포 기능이 작동하려면 XcodeBuildMCP 디바이스 도구를 사용하기 **전에** Xcode에서 코드 서명이 올바르게 설정되어야 합니다:

1. Xcode에서 프로젝트 열기
2. 프로젝트 타겟 선택
3. "Signing & Capabilities" 탭으로 이동
4. "Automatically manage signing"을 설정하고 개발 팀 선택
5. 유효한 프로비저닝 프로파일이 선택되어 있는지 확인

> **참고**: XcodeBuildMCP는 코드 서명을 자동으로 설정할 수 없습니다. 이 초기 설정은 Xcode에서 한 번 수행해야 하며, 그 후 MCP 디바이스 도구가 물리적 디바이스에서 앱을 빌드, 설치 및 테스트할 수 있습니다.

## 문제 해결

XcodeBuildMCP에서 문제가 발생하면 doctor 도구가 환경 및 종속성에 대한 자세한 정보를 제공하여 문제를 식별하는 데 도움이 될 수 있습니다.

### Doctor 도구

doctor 도구는 시스템 설정을 확인하고 XcodeBuildMCP에 필요한 모든 종속성의 상태를 보고하는 독립 실행형 유틸리티입니다. 이슈를 보고할 때 특히 유용합니다.

```bash
# npx를 사용하여 doctor 도구 실행
npx --package xcodebuildmcp@latest xcodebuildmcp-doctor
```

doctor 도구는 다음에 대한 포괄적인 정보를 출력합니다:

- 시스템 및 Node.js 환경
- Xcode 설치 및 설정
- 필수 종속성 (xcodebuild, AXe 등)
- XcodeBuildMCP에 영향을 미치는 환경 변수
- 기능 가용성 상태

GitHub에서 이슈를 보고할 때 문제 해결을 돕기 위해 doctor 도구의 전체 출력을 포함해 주세요.

## 개인정보 보호

이 프로젝트는 오류 모니터링 및 진단을 위해 [Sentry](https://sentry.io/)를 사용합니다. Sentry는 XcodeBuildMCP의 신뢰성과 안정성을 개선하기 위해 이슈, 충돌 및 예기치 않은 오류를 추적하는 데 도움이 됩니다.

### Sentry에 전송되는 정보
- 기본적으로 오류 수준 로그 및 진단 정보만 Sentry로 전송됩니다.
- 오류 로그에는 오류 메시지, 스택 추적 및 (경우에 따라) 파일 경로 또는 프로젝트 이름과 같은 세부 정보가 포함될 수 있습니다. 정확히 무엇이 로깅되는지 확인하려면 이 저장소의 소스를 검토할 수 있습니다.

### Sentry 비활성화
- 오류 로그를 Sentry로 보내지 않으려면 환경 변수 `XCODEBUILDMCP_SENTRY_DISABLED=true`를 설정하여 옵트아웃할 수 있습니다.

MCP 클라이언트 설정 예시:
```json
"XcodeBuildMCP": {
  ...
  "env": {
    "XCODEBUILDMCP_SENTRY_DISABLED": "true"
  }
}
```

## 데모

### Cursor에서 빌드 오류 자동 수정
![xcodebuildmcp3](https://github.com/user-attachments/assets/173e6450-8743-4379-a76c-de2dd2b678a3)

### 새로운 UI 자동화 및 화면 캡처 기능 활용

![xcodebuildmcp4](https://github.com/user-attachments/assets/17300a18-f47a-428a-aad3-dc094859c1b2)

### Claude Desktop에서 iOS 앱 빌드 및 실행
https://github.com/user-attachments/assets/e3c08d75-8be6-4857-b4d0-9350b26ef086

## 기여하기

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/) [![Node.js](https://img.shields.io/badge/node->=18.x-brightgreen.svg)](https://nodejs.org/)

기여를 환영합니다! XcodeBuildMCP를 개선하는 데 도움을 줄 수 있는 방법은 다음과 같습니다.

개발 관련 문서를 참조하세요:
- [CONTRIBUTING](docs/CONTRIBUTING.md) - 기여 가이드라인 및 개발 환경 설정
- [CODE_QUALITY](docs/CODE_QUALITY.md) - 코드 품질 표준, 린팅 및 아키텍처 규칙
- [TESTING](docs/TESTING.md) - 테스트 원칙 및 패턴
- [ARCHITECTURE](docs/ARCHITECTURE.md) - 시스템 아키텍처 및 설계 원칙

## 라이선스

이 프로젝트는 MIT 라이선스에 따라 라이선스가 부여됩니다 - 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.
