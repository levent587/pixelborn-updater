# Pixelborn Updater

A simple tool to automatically download and update the Pixelborn client to the latest version.

## Usage

1.  Download the latest `pixelborn-updater.exe` from the project's **Releases** page.
2.  Place `pixelborn-updater.exe` in the directory where you want to install or update Pixelborn.
3.  Run `pixelborn-updater.exe`. It will download the latest client if it's missing or update it if a new version is available.

_Optional: Create a shortcut to `pixelborn-updater.exe` on your desktop for easy access._

## Building from Source

If you prefer to build the updater yourself, follow these steps.

### Prerequisites

- [Bun](https://bun.sh/) (Tested with v1.1.45)

### Steps

1.  **Clone the repository**

    ```sh
    git clone https://github.com/your-username/your-repo.git
    cd your-repo
    ```

2.  **Create the environment file**
    Copy the example file to create your local configuration.

    ```sh
    cp .env.example .env
    ```

    > **Note:** Keep the default `API_URL` unless you are self-hosting the backend API.

3.  **Install dependencies**

    ```sh
    bun install
    ```

4.  **Build the executable**
    ```sh
    bun run build
    ```
    The final `pixelborn-updater.exe` will be located in the `dist` directory.
