export async function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const token = localStorage.getItem("fileforge-token");
  let guestId = localStorage.getItem("fileforge-guest-id");
  if (!guestId) {
    guestId = Math.random().toString(36).substring(2, 11);
    localStorage.setItem("fileforge-guest-id", guestId);
  }

  const headers = new Headers(init?.headers);
  
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  
  if (!headers.has("x-guest-id")) {
    headers.set("x-guest-id", guestId);
  }

  const mergedInit: RequestInit = {
    ...init,
    headers: headers
  };

  const response = await fetch(input, mergedInit);

  if (response.status === 403 || response.status === 413) {
    try {
      const clone = response.clone();
      const body = await clone.json();
      if (body.error === "LIMIT_EXCEEDED" || body.error === "FILE_SIZE_LIMIT_EXCEEDED") {
        window.dispatchEvent(new CustomEvent("api-limit-exceeded", {
          detail: { message: body.message }
        }));
      }
    } catch (_) {
      // No-op
    }
  }

  if (response.ok) {
    const urlStr = input.toString();
    if (
      urlStr.includes("/api/docx-to-pdf") ||
      urlStr.includes("/api/merge-pdfs") ||
      urlStr.includes("/api/split-pdf") ||
      urlStr.includes("/api/compress-pdf") ||
      urlStr.includes("/api/pdf-to-docx") ||
      urlStr.includes("/api/image-to-pdf") ||
      urlStr.includes("/api/ocr") ||
      urlStr.includes("/api/summarize") ||
      urlStr.includes("/api/translate")
    ) {
      window.dispatchEvent(new CustomEvent("api-success"));
    }
  }

  return response;
}
