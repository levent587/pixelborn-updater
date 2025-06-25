# Pixelborn Updater

**Disclaimer:** This is a fan-made tool and is not officially associated with Pixelborn.

Pixelborn Updater is a Windows desktop app that automatically installs and keeps both the Pixelborn game client and card images up to date.

## Download & Installation

1. Visit the [Releases page](https://github.com/levent587/pixelborn-updater/releases).
2. Download the latest `pixelborn-updater-setup.exe`.
3. Run the installer. A desktop shortcut will be created automatically.

The updater will handle all future updates for you, no manual downloads required.

## Building from Source

If you prefer to compile the launcher yourself, follow these steps on a Windows machine.

### Prerequisites

- Git
- [Bun](https://bun.sh/) v1.1.45 (tested)
- Windows 10 or newer

### Steps

1. Clone the repository

   ```sh
   git clone https://github.com/levent587/pixelborn-updater.git
   cd pixelborn-updater

   ```

2. **Install dependencies**

   ```sh
   bun install
   ```

3. **Build the installer**
   ```sh
   cd apps/frontend
   bun run build:win
   ```
   The pixelborn-updater-<version>-setup.exe will be in apps/frontend/dist.
