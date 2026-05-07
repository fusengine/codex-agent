#!/usr/bin/env python3
"""Stop hook: cross-platform completion sound.

Plays plugin's bundled finish.mp3 via the OS-native player:
- macOS: afplay
- Linux: paplay or aplay
- Windows: powershell SoundPlayer

Falls back silently when no player is available (no error to user).
"""

import os
import platform
import shutil
import subprocess
import sys
from pathlib import Path

PLUGIN_ROOT = Path(__file__).resolve().parent.parent.parent
SOUND_FILE = PLUGIN_ROOT / "song" / "finish.mp3"


def _play_macos(path):
    """Play sound via afplay (macOS)."""
    if shutil.which("afplay"):
        subprocess.Popen(
            ["afplay", str(path)],
            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
        )
        return True
    return False


def _play_linux(path):
    """Play sound via paplay or aplay (Linux)."""
    for cmd in ("paplay", "aplay", "mpv", "ffplay"):
        if shutil.which(cmd):
            args = [cmd, str(path)]
            if cmd == "ffplay":
                args = ["ffplay", "-nodisp", "-autoexit", "-loglevel", "quiet", str(path)]
            subprocess.Popen(
                args,
                stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
            )
            return True
    return False


def _play_windows(path):
    """Play sound via PowerShell SoundPlayer (Windows)."""
    if shutil.which("powershell"):
        ps_cmd = (
            f'(New-Object Media.SoundPlayer "{path}").PlaySync()'
        )
        subprocess.Popen(
            ["powershell", "-NoProfile", "-Command", ps_cmd],
            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
        )
        return True
    return False


def main():
    """Detect OS and play the bundled completion sound (silent fallback)."""
    if not SOUND_FILE.is_file():
        sys.exit(0)
    system = platform.system()
    try:
        if system == "Darwin":
            _play_macos(SOUND_FILE)
        elif system == "Linux":
            _play_linux(SOUND_FILE)
        elif system == "Windows":
            _play_windows(SOUND_FILE)
    except (OSError, subprocess.SubprocessError):
        pass
    sys.exit(0)


if __name__ == "__main__":
    main()
