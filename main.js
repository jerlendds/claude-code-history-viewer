const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');

function getClaudeConfigPath() {
  const homeDir = os.homedir();

  if (process.platform === 'win32') {
    return path.join(process.env.APPDATA || path.join(homeDir, 'AppData', 'Roaming'), 'claude');
  } else {
    return path.join(homeDir, '.claude');
  }
}

function safeJsonParse(line) {
  try {
    return JSON.parse(line);
  } catch (e) {
    return null;
  }
}

function extractTextContent(message) {
  if (!message) return '';

  if (typeof message.content === 'string') return message.content;

  if (Array.isArray(message.content)) {
    return message.content
      .filter(block => block.type === 'text')
      .map(block => block.text)
      .join('\n\n');
  }

  return '';
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#1a1a1a'
  });

  win.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC handlers for reading session data
ipcMain.handle('get-sessions', async () => {
  try {
    const configPath = getClaudeConfigPath();
    const historyPath = path.join(configPath, 'history.jsonl');
    const projectsPath = path.join(configPath, 'projects');

    if (!fs.existsSync(historyPath)) {
      return { error: 'History file not found at: ' + historyPath };
    }

    // Read history.jsonl to get all user prompts
    const historyContent = fs.readFileSync(historyPath, 'utf-8');
    const historyLines = historyContent.trim().split('\n').filter(line => line.trim());

    // Parse history entries
    const historyEntries = historyLines.map(line => {
      return safeJsonParse(line);
    }).filter(entry => entry !== null);

    // Group by project and timestamp to identify sessions
    const sessionMap = new Map();

    // Read all session files from projects directory
    if (fs.existsSync(projectsPath)) {
      const projectDirs = fs.readdirSync(projectsPath);

      for (const projectDir of projectDirs) {
        const projectPath = path.join(projectsPath, projectDir);
        const stat = fs.statSync(projectPath);

        if (stat.isDirectory()) {
          const sessionFiles = fs.readdirSync(projectPath).filter(f => f.endsWith('.jsonl') && !f.startsWith('agent-'));

          for (const sessionFile of sessionFiles) {
            const sessionPath = path.join(projectPath, sessionFile);
            const sessionId = sessionFile.replace('.jsonl', '');

            try {
              const sessionContent = fs.readFileSync(sessionPath, 'utf-8');
              const lines = sessionContent.trim().split('\n').filter(line => line.trim());

              if (lines.length > 0) {
                const messages = lines.map(line => {
                  return safeJsonParse(line);
                }).filter(msg => msg !== null);

                // Find first user message
                const firstUserMessage = messages.find(msg => msg.type === 'user' && msg.message);

                if (firstUserMessage) {
                  const projectName = projectDir.replace(/-/g, '/').substring(1); // Remove leading dash and convert dashes to slashes

                  const content = extractTextContent(firstUserMessage.message);

                  sessionMap.set(sessionId, {
                    id: sessionId,
                    timestamp: new Date(firstUserMessage.timestamp).getTime(),
                    display: content.substring(0, 100),
                    project: projectName,
                    projectDir: projectDir,
                    messageCount: messages.filter(m => m.type === 'user' || m.type === 'assistant').length
                  });
                }
              }
            } catch (e) {
              console.error('Error reading session file:', sessionPath, e);
            }
          }
        }
      }
    }

    // Convert to array and sort by timestamp (newest first)
    const sessions = Array.from(sessionMap.values()).sort((a, b) => b.timestamp - a.timestamp);

    return { sessions };
  } catch (error) {
    return { error: error.message };
  }
});

ipcMain.handle('get-session-details', async (event, sessionId, projectDir) => {
  try {
    const configPath = getClaudeConfigPath();
    const projectsPath = path.join(configPath, 'projects');
    const sessionPath = path.join(projectsPath, projectDir, `${sessionId}.jsonl`);

    if (!fs.existsSync(sessionPath)) {
      return { error: 'Session file not found' };
    }

    const sessionContent = fs.readFileSync(sessionPath, 'utf-8');
    const lines = sessionContent.trim().split('\n').filter(line => line.trim());

    const messages = lines.map(line => safeJsonParse(line)).filter(msg => msg !== null);

    // Index file-history snapshots by the message UUID they relate to (messageId).
    const fileHistorySnapshotsByMessageId = new Map();
    for (const msg of messages) {
      if (msg && msg.type === 'file-history-snapshot' && msg.messageId && msg.snapshot) {
        const snapshot = {
          messageId: msg.messageId,
          timestamp: msg.snapshot.timestamp,
          isSnapshotUpdate: !!msg.isSnapshotUpdate,
          trackedFileBackups: msg.snapshot.trackedFileBackups || {}
        };
        const existing = fileHistorySnapshotsByMessageId.get(msg.messageId) || [];
        existing.push(snapshot);
        fileHistorySnapshotsByMessageId.set(msg.messageId, existing);
      }
    }

    // Filter and format messages for display
    const formattedMessages = messages
      .filter(msg => (msg.type === 'user' || msg.type === 'assistant') && msg.message)
      .map(msg => {
        if (msg.type === 'user') {
          const content = extractTextContent(msg.message);

          return {
            role: 'user',
            content: content,
            timestamp: msg.timestamp,
            uuid: msg.uuid,
            fileHistorySnapshots: fileHistorySnapshotsByMessageId.get(msg.uuid) || []
          };
        } else if (msg.type === 'assistant') {
          const content = extractTextContent(msg.message);

          return {
            role: 'assistant',
            content: content,
            timestamp: msg.timestamp,
            uuid: msg.uuid,
            toolUses: msg.message.content?.filter(block => block.type === 'tool_use') || [],
            fileHistorySnapshots: fileHistorySnapshotsByMessageId.get(msg.uuid) || []
          };
        }
        return null;
      })
      .filter(msg => {
        if (!msg) return false;
        if (msg.content && msg.content.trim()) return true;
        if (msg.toolUses && msg.toolUses.length > 0) return true;
        if (msg.fileHistorySnapshots && msg.fileHistorySnapshots.length > 0) return true;
        return false;
      });

    return { messages: formattedMessages };
  } catch (error) {
    return { error: error.message };
  }
});

ipcMain.handle('get-file-history-file', async (event, sessionId, backupFileName) => {
  try {
    const configPath = getClaudeConfigPath();
    const baseDir = path.join(configPath, 'file-history');

    if (
      typeof sessionId !== 'string' ||
      typeof backupFileName !== 'string' ||
      sessionId.includes('/') ||
      sessionId.includes('\\') ||
      backupFileName.includes('/') ||
      backupFileName.includes('\\') ||
      sessionId.includes('..') ||
      backupFileName.includes('..')
    ) {
      return { error: 'Invalid file-history request' };
    }

    const resolvedBase = path.resolve(baseDir);
    const resolvedPath = path.resolve(baseDir, sessionId, backupFileName);
    if (!resolvedPath.startsWith(resolvedBase + path.sep)) {
      return { error: 'Invalid file-history path' };
    }

    if (!fs.existsSync(resolvedPath)) {
      return { error: 'Snapshot file not found' };
    }

    const stat = fs.statSync(resolvedPath);
    if (!stat.isFile()) {
      return { error: 'Snapshot path is not a file' };
    }

    // Avoid locking the renderer with extremely large files.
    const maxBytes = 2 * 1024 * 1024; // 2 MiB
    if (stat.size > maxBytes) {
      const fd = fs.openSync(resolvedPath, 'r');
      try {
        const buffer = Buffer.allocUnsafe(maxBytes);
        const bytesRead = fs.readSync(fd, buffer, 0, maxBytes, 0);
        return {
          content: buffer.slice(0, bytesRead).toString('utf-8'),
          truncated: true,
          originalBytes: stat.size
        };
      } finally {
        fs.closeSync(fd);
      }
    }

    return { content: fs.readFileSync(resolvedPath, 'utf-8') };
  } catch (error) {
    return { error: error.message };
  }
});
