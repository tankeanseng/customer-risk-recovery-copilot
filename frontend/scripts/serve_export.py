from __future__ import annotations

import argparse
import posixpath
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlparse


class ExportRewriteHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, directory: str | None = None, **kwargs):
        super().__init__(*args, directory=directory, **kwargs)

    def do_GET(self) -> None:  # pragma: no cover - used in local preview
        parsed = urlparse(self.path)
        normalized = posixpath.normpath(unquote(parsed.path))
        if normalized == ".":
            normalized = "/"

        if normalized.endswith("/"):
            normalized = normalized[:-1] or "/"

        candidates = []
        if normalized == "/":
            candidates = ["/index.html"]
        else:
            candidates = [
                f"{normalized}.html",
                f"{normalized}/index.html",
                normalized,
            ]

        root = Path(self.directory or ".").resolve()
        for candidate in candidates:
            candidate_path = root / candidate.lstrip("/")
            if candidate_path.exists() and candidate_path.is_file():
                self.path = candidate
                return super().do_GET()

        return super().do_GET()


def main() -> None:
    parser = argparse.ArgumentParser(description="Serve Next.js exported static files with clean-route rewrites.")
    parser.add_argument("--directory", default="out")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=3000)
    args = parser.parse_args()

    directory = str(Path(args.directory).resolve())
    server = ThreadingHTTPServer((args.host, args.port), lambda *handler_args, **handler_kwargs: ExportRewriteHandler(*handler_args, directory=directory, **handler_kwargs))
    try:
        server.serve_forever()
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
