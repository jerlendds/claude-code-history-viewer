# Claude Code History Viewer

> Browse and search your Claude Code session history in a beautiful chat interface

An Electron desktop app that displays your Claude Code session history in a clean, chat-style interface similar to the Claude desktop app. Never lose track of your AI conversations again!

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Platform](https://img.shields.io/badge/platform-macOS%20%7C%20Linux%20%7C%20Windows-lightgrey)

## ✨ Features

- **📚 Session Browser**: Browse all your Claude Code sessions in a sidebar, sorted by date (newest first)
- **💬 Full Conversations**: View complete conversation history with proper formatting
- **🎨 Syntax Highlighting**: Code blocks are automatically highlighted with language detection
- **🔧 Tool Usage Display**: See which tools Claude used during each conversation
- **🌙 Dark Theme**: Modern, dark-themed interface inspired by the Claude desktop app
- **⚡ Fast & Lightweight**: No heavy frameworks, just vanilla JavaScript
- **🔒 Privacy First**: All data stays local on your machine

## 📦 Installation

### Option 1: Pre-built App (macOS)

Download and install the `.dmg` file from the [releases page](../../releases), or build it yourself:

```bash
git clone https://github.com/yanicklandry/claude-code-history-viewer.git
cd claude-code-history-viewer
npm install
npm run build:mac
```

The app will be available at `dist/mac-arm64/Claude Code History.app`. Drag it to your Applications folder and add to Dock!

### Option 2: Run from Source

```bash
git clone https://github.com/yanicklandry/claude-code-history-viewer.git
cd claude-code-history-viewer
npm install
npm start
```

## 🚀 Usage

Simply launch the app! It will automatically find your Claude Code history in the standard location:
- **macOS/Linux**: `~/.claude/`
- **Windows**: `%APPDATA%\claude\`

Click any session in the sidebar to view the full conversation.

## 🛠️ How It Works

The app reads session data directly from your local Claude Code storage:

1. **`~/.claude/projects/`** - Full session transcripts organized by project
2. Each session file is parsed to extract:
   - User messages
   - Claude responses
   - Tool usage information
   - Timestamps

Sessions are displayed with:
- Smart timestamp formatting ("Today", "Yesterday", or full date)
- Initial prompt preview in the sidebar
- Full conversation with proper markdown rendering
- Syntax-highlighted code blocks
- Tool usage indicators

## 🏗️ Tech Stack

- **Electron** - Cross-platform desktop framework
- **Marked** - Markdown parsing and rendering
- **Highlight.js** - Syntax highlighting with GitHub Dark theme
- **Vanilla JavaScript** - No heavy frameworks, fast and lightweight

## 📂 Project Structure

```
claude-code-history-viewer/
├── main.js           # Electron main process & IPC handlers
├── renderer.js       # UI logic and rendering
├── index.html        # Application structure
├── styles.css        # Modern dark theme styling
└── package.json      # Dependencies & build config
```

## 🔧 Build Scripts

```bash
npm start           # Run in development mode
npm run build       # Build for current platform
npm run build:mac   # Build for macOS (DMG + ZIP)
npm run build:win   # Build for Windows (NSIS installer)
npm run build:linux # Build for Linux (AppImage + deb)
```

## 📋 Requirements

- Node.js 16 or higher
- An existing Claude Code installation with session history
- macOS 10.12+ (for macOS builds)

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## 📝 License

MIT License - feel free to use this project however you'd like!

## 🙏 Acknowledgments

Built with ❤️ for the Claude Code community. Special thanks to Anthropic for creating Claude Code!

---

**Note**: This is an unofficial third-party tool and is not affiliated with or endorsed by Anthropic.
