# XcodeBuildMCP Tools Reference

XcodeBuildMCP provides 91 tools organized into 13 workflow groups for comprehensive Apple development workflows.

## Workflow Groups

### 1. Dynamic Tool Discovery (`discovery`)
**Purpose**: Intelligent discovery and recommendation of appropriate development workflows based on project structure and requirements. (1 tool)

- `discover_tools` - Analyzes a natural language task description and enables the most relevant development workflow. Prioritizes project/workspace workflows (simulator/device/macOS) and also supports task-based workflows (simulator-management, logging) and Swift packages.

### 2. iOS Device Development (`device`)
**Purpose**: Complete iOS development workflow for both .xcodeproj and .xcworkspace files targeting physical devices (iPhone, iPad, Apple Watch, Apple TV, Apple Vision Pro). Build, test, deploy, and debug apps on real hardware. (15 tools)

- `build_device_error` - Builds an app for a connected device (xcbeautify -qq, errors only).
- `build_device_quiet` - Builds an app for a connected device (xcbeautify -q).
- `clean` - Cleans build products with xcodebuild.
- `discover_projs` - Scans a directory to find Xcode project (.xcodeproj) and workspace (.xcworkspace) files.
- `get_app_bundle_id` - Extracts the bundle identifier from an app bundle (.app).
- `get_device_app_path` - Retrieves the built app path for a connected device.
- `install_app_device` - Installs an app on a connected device.
- `launch_app_device` - Launches an app on a connected device.
- `list_devices` - Lists connected physical Apple devices with their UUIDs, names, and connection status.
- `list_schemes` - Lists schemes for a project or workspace.
- `show_build_settings` - Shows xcodebuild build settings.
- `start_device_log_cap` - Starts log capture on a connected device.
- `stop_app_device` - Stops a running app on a connected device.
- `stop_device_log_cap` - Stops an active Apple device log capture session and returns the captured logs.
- `test_device` - Runs tests on a physical Apple device.

### 3. iOS Simulator Development (`simulator`)
**Purpose**: Complete iOS development workflow for both .xcodeproj and .xcworkspace files targeting simulators. Build, test, deploy, and interact with iOS apps on simulators. (21 tools)

- `boot_sim` - Boots an iOS simulator.
- `build_run_sim_error` - Builds and runs an app on an iOS simulator (xcbeautify -qq, errors only).
- `build_run_sim_quiet` - Builds and runs an app on an iOS simulator (xcbeautify -q).
- `build_sim_error` - Builds an app for an iOS simulator (xcbeautify -qq, errors only).
- `build_sim_quiet` - Builds an app for an iOS simulator (xcbeautify -q).
- `clean` - Cleans build products with xcodebuild.
- `describe_ui` - Gets entire view hierarchy with precise frame coordinates for all visible elements.
- `discover_projs` - Scans a directory to find Xcode project (.xcodeproj) and workspace (.xcworkspace) files.
- `get_app_bundle_id` - Extracts the bundle identifier from an app bundle (.app).
- `get_sim_app_path` - Retrieves the built app path for an iOS simulator.
- `install_app_sim` - Installs an app in an iOS simulator.
- `launch_app_logs_sim` - Launches an app in an iOS simulator and captures its logs.
- `launch_app_sim` - Launches an app in an iOS simulator.
- `list_schemes` - Lists schemes for a project or workspace.
- `list_sims` - Lists available iOS simulators with their UUIDs.
- `open_sim` - Opens the iOS Simulator app.
- `record_sim_video` - Starts or stops video capture for an iOS simulator.
- `screenshot` - Captures screenshot for visual verification.
- `show_build_settings` - Shows xcodebuild build settings.
- `stop_app_sim` - Stops an app running in an iOS simulator.
- `test_sim` - Runs tests on an iOS simulator.

### 4. macOS Development (`macos`)
**Purpose**: Complete macOS development workflow for both .xcodeproj and .xcworkspace files. Build, test, deploy, and manage macOS applications. (13 tools)

- `build_macos_error` - Builds a macOS app (xcbeautify -qq, errors only).
- `build_macos_quiet` - Builds a macOS app (xcbeautify -q).
- `build_run_macos_error` - Builds and runs a macOS app (xcbeautify -qq, errors only).
- `build_run_macos_quiet` - Builds and runs a macOS app (xcbeautify -q).
- `clean` - Cleans build products with xcodebuild.
- `discover_projs` - Scans a directory to find Xcode project (.xcodeproj) and workspace (.xcworkspace) files.
- `get_mac_app_path` - Retrieves the built macOS app bundle path.
- `get_mac_bundle_id` - Extracts the bundle identifier from a macOS app bundle (.app).
- `launch_mac_app` - Launches a macOS application.
- `list_schemes` - Lists schemes for a project or workspace.
- `show_build_settings` - Shows xcodebuild build settings.
- `stop_mac_app` - Stops a running macOS application. Can stop by app name or process ID.
- `test_macos` - Runs tests for a macOS target.

### 5. Log Capture & Management (`logging`)
**Purpose**: Log capture and management tools for iOS simulators and physical devices. Start, stop, and analyze application and system logs during development and testing. (4 tools)

- `start_device_log_cap` - Starts log capture on a connected device.
- `start_sim_log_cap` - Starts capturing logs from a specified simulator. Returns a session ID.
- `stop_device_log_cap` - Stops an active Apple device log capture session and returns the captured logs.
- `stop_sim_log_cap` - Stops an active simulator log capture session and returns the captured logs.

### 6. Project Discovery (`project-discovery`)
**Purpose**: Discover and examine Xcode projects, workspaces, and Swift packages. Analyze project structure, schemes, build settings, and bundle information. (5 tools)

- `discover_projs` - Scans a directory (defaults to workspace root) to find Xcode project (.xcodeproj) and workspace (.xcworkspace) files.
- `get_app_bundle_id` - Extracts the bundle identifier from an app bundle (.app) for any Apple platform (iOS, iPadOS, watchOS, tvOS, visionOS).
- `get_mac_bundle_id` - Extracts the bundle identifier from a macOS app bundle (.app).
- `list_schemes` - Lists schemes for a project or workspace.
- `show_build_settings` - Shows xcodebuild build settings.

### 7. Project Scaffolding (`project-scaffolding`)
**Purpose**: Tools for creating new iOS and macOS projects from templates. Bootstrap new applications with best practices, standard configurations, and modern project structures. (2 tools)

- `scaffold_ios_project` - Scaffold a new iOS project from templates. Creates a modern Xcode project with workspace structure, SPM package for features, and proper iOS configuration.
- `scaffold_macos_project` - Scaffold a new macOS project from templates. Creates a modern Xcode project with workspace structure, SPM package for features, and proper macOS configuration.

### 8. Project Utilities (`utilities`)
**Purpose**: Essential project maintenance utilities for cleaning and managing existing projects. Provides clean operations for both .xcodeproj and .xcworkspace files. (1 tool)

- `clean` - Cleans build products with xcodebuild.

### 9. Session Management (`session-management`)
**Purpose**: Manage session defaults for projectPath/workspacePath, scheme, configuration, simulatorName/simulatorId, deviceId, useLatestOS and arch. These defaults are required by many tools and must be set before attempting to call tools that would depend on these values. (3 tools)

- `session_clear_defaults` - Clear selected or all session defaults.
- `session_set_defaults` - Set the session defaults needed by many tools. Most tools require one or more session defaults to be set before they can be used.
- `session_show_defaults` - Show current session defaults.

### 10. Simulator Management (`simulator-management`)
**Purpose**: Tools for managing simulators from booting, opening simulators, listing simulators, stopping simulators, erasing simulator content and settings, and setting simulator environment options like location, network, statusbar and appearance. (8 tools)

- `boot_sim` - Boots an iOS simulator.
- `erase_sims` - Erases a simulator by UDID.
- `list_sims` - Lists available iOS simulators with their UUIDs.
- `open_sim` - Opens the iOS Simulator app.
- `reset_sim_location` - Resets the simulator's location to default.
- `set_sim_appearance` - Sets the appearance mode (dark/light) of an iOS simulator.
- `set_sim_location` - Sets a custom GPS location for the simulator.
- `sim_statusbar` - Sets the data network indicator in the iOS simulator status bar.

### 11. Swift Package Manager (`swift-package`)
**Purpose**: Swift Package Manager operations for building, testing, running, and managing Swift packages and dependencies. Complete SPM workflow support. (6 tools)

- `swift_package_build` - Builds a Swift Package with swift build.
- `swift_package_clean` - Cleans Swift Package build artifacts and derived data.
- `swift_package_list` - Lists currently running Swift Package processes.
- `swift_package_run` - Runs an executable target from a Swift Package with swift run.
- `swift_package_stop` - Stops a running Swift Package executable started with swift_package_run.
- `swift_package_test` - Runs tests for a Swift Package with swift test.

### 12. System Doctor (`doctor`)
**Purpose**: Debug tools and system doctor for troubleshooting XcodeBuildMCP server, development environment, and tool availability. (1 tool)

- `doctor` - Provides comprehensive information about the MCP server environment, available dependencies, and configuration status.

### 13. UI Testing & Automation (`ui-testing`)
**Purpose**: UI automation and accessibility testing tools for iOS simulators. Perform gestures, interactions, screenshots, and UI analysis for automated testing workflows. (11 tools)

- `button` - Press hardware button on iOS simulator. Supported buttons: apple-pay, home, lock, side-button, siri.
- `describe_ui` - Gets entire view hierarchy with precise frame coordinates (x, y, width, height) for all visible elements.
- `gesture` - Perform gesture on iOS simulator using preset gestures: scroll-up, scroll-down, scroll-left, scroll-right, swipe-from-left-edge, swipe-from-right-edge, swipe-from-top-edge, swipe-from-bottom-edge.
- `key_press` - Press a single key by keycode on the simulator. Common keycodes: 40=Return, 42=Backspace, 43=Tab, 44=Space, 58-67=F1-F10.
- `key_sequence` - Press key sequence using HID keycodes on iOS simulator with configurable delay.
- `long_press` - Long press at specific coordinates for given duration (ms).
- `screenshot` - Captures screenshot for visual verification.
- `swipe` - Swipe from one point to another. Supports configurable timing.
- `tap` - Tap at specific coordinates. Supports optional timing delays.
- `touch` - Perform touch down/up events at specific coordinates.
- `type_text` - Type text (supports US keyboard characters).

## Summary Statistics

- **Total Tools**: 91
- **Workflow Groups**: 13

---

*Last updated: 2025-12-15*
