#!/bin/bash
#
# XcodeBuildMCP 로컬 설치 스크립트
# Claude Code 및 Codex CLI를 위한 로컬 MCP 서버 설정
#

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 로그 함수
log_info() { echo -e "${BLUE}ℹ${NC} $1"; }
log_success() { echo -e "${GREEN}✓${NC} $1"; }
log_warning() { echo -e "${YELLOW}⚠${NC} $1"; }
log_error() { echo -e "${RED}✗${NC} $1"; }

# 프로젝트 루트 디렉토리 확인
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo ""
echo "======================================"
echo "  XcodeBuildMCP 로컬 설치 스크립트"
echo "======================================"
echo ""

# ============================================
# 1. 전제 조건 확인
# ============================================
log_info "전제 조건 확인 중..."

# macOS 확인
if [[ "$(uname)" != "Darwin" ]]; then
    log_error "이 스크립트는 macOS에서만 실행 가능합니다."
    exit 1
fi
log_success "macOS 확인됨"

# Node.js 확인
if ! command -v node &> /dev/null; then
    log_error "Node.js가 설치되어 있지 않습니다."
    log_info "https://nodejs.org 에서 Node.js v18 이상을 설치해주세요."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [[ "$NODE_VERSION" -lt 18 ]]; then
    log_error "Node.js v18 이상이 필요합니다. (현재: v$(node -v | cut -d'v' -f2))"
    exit 1
fi
log_success "Node.js v$(node -v | cut -d'v' -f2) 확인됨"

# npm 확인
if ! command -v npm &> /dev/null; then
    log_error "npm이 설치되어 있지 않습니다."
    exit 1
fi
log_success "npm v$(npm -v) 확인됨"


echo ""

# ============================================
# 2. 의존성 설치
# ============================================
log_info "의존성 설치 중..."
cd "$PROJECT_ROOT"

if npm install; then
    log_success "의존성 설치 완료"
else
    log_error "의존성 설치 실패"
    exit 1
fi

echo ""

# ============================================
# 3. 프로젝트 빌드
# ============================================
log_info "프로젝트 빌드 중..."

if npm run build; then
    log_success "프로젝트 빌드 완료"
else
    log_error "프로젝트 빌드 실패"
    exit 1
fi

# 빌드 결과 확인
if [[ ! -f "$PROJECT_ROOT/build/index.js" ]]; then
    log_error "빌드 결과물이 없습니다: build/index.js"
    exit 1
fi
log_success "빌드 결과 확인됨: build/index.js"

echo ""

# ============================================
# 4. AXe 번들링 (UI 자동화)
# ============================================
log_info "AXe 번들링 중 (UI 자동화 기능)..."

if npm run bundle:axe; then
    log_success "AXe 번들링 완료"
    AXE_BUNDLED=true
else
    log_warning "AXe 번들링 실패 - UI 테스팅 기능이 비활성화됩니다."
    log_info "이는 선택적 기능이며, 다른 도구들은 정상 작동합니다."
    AXE_BUNDLED=false
fi

# 번들 상태 확인
if [[ -f "$PROJECT_ROOT/bundled/axe" ]]; then
    log_success "AXe 바이너리 확인됨: bundled/axe"
else
    log_warning "AXe 바이너리 없음 - UI 테스팅 도구 사용 불가"
fi

echo ""

# ============================================
# 5. MCP 클라이언트 설정
# ============================================
log_info "MCP 클라이언트 설정 중..."

BUILD_PATH="$PROJECT_ROOT/build/index.js"
REGISTERED_CLIENTS=""

# --- Claude Code ---
if command -v claude &> /dev/null; then
    log_info "Claude Code 설정 중..."

    # 기존 등록 제거 후 user scope로 재등록
    claude mcp remove --scope user XcodeBuildMCP 2>/dev/null || true

    if claude mcp add --scope user XcodeBuildMCP -- node "$BUILD_PATH"; then
        log_success "Claude Code에 XcodeBuildMCP 등록 완료 (user scope)"
        REGISTERED_CLIENTS="$REGISTERED_CLIENTS Claude-Code"
    else
        log_warning "Claude Code 등록 실패"
    fi
else
    log_warning "Claude Code CLI가 설치되어 있지 않습니다."
    log_info "설치 후 다음 명령어로 수동 등록하세요:"
    echo "    claude mcp add --scope user XcodeBuildMCP -- node \"$BUILD_PATH\""
fi

echo ""

# --- Codex CLI ---
if command -v codex &> /dev/null; then
    log_info "Codex CLI 설정 중..."

    # 기존 등록 제거 후 재등록
    codex mcp remove XcodeBuildMCP 2>/dev/null || true

    if codex mcp add XcodeBuildMCP -- node "$BUILD_PATH"; then
        log_success "Codex CLI에 XcodeBuildMCP 등록 완료"
        REGISTERED_CLIENTS="$REGISTERED_CLIENTS Codex-CLI"
    else
        log_warning "Codex CLI 등록 실패"
    fi
else
    log_warning "Codex CLI가 설치되어 있지 않습니다."
    log_info "설치 후 다음 명령어로 수동 등록하세요:"
    echo "    codex mcp add XcodeBuildMCP -- node \"$BUILD_PATH\""
fi

echo ""

# ============================================
# 6. 설치 완료 요약
# ============================================
echo "======================================"
echo "  설치 완료"
echo "======================================"
echo ""

log_success "프로젝트 경로: $PROJECT_ROOT"
log_success "빌드 경로: $BUILD_PATH"

if [[ "$AXE_BUNDLED" == "true" ]]; then
    log_success "AXe 번들: 설치됨 (UI 테스팅 가능)"
else
    log_warning "AXe 번들: 미설치 (UI 테스팅 불가)"
fi

echo ""

if [[ -n "$REGISTERED_CLIENTS" ]]; then
    log_success "등록된 MCP 클라이언트:$REGISTERED_CLIENTS"
else
    log_warning "등록된 MCP 클라이언트 없음"
fi

echo ""
log_info "사용 방법:"
echo "    1. Claude Code 또는 Codex CLI를 재시작하세요."
echo "    2. MCP 도구가 자동으로 로드됩니다."
echo ""
log_info "수동 테스트:"
echo "    node $BUILD_PATH"
echo ""
log_info "MCP Inspector로 테스트:"
echo "    npm run inspect"
echo ""
