from PIL import Image, ImageFilter
import numpy as np
from collections import deque
import os

src_path = r"C:\Users\LENOVO\.gemini\antigravity\brain\d692c295-d610-46ad-926d-6409bc3f9239\.user_uploaded\media_1790478821839.jpg"
img = Image.open(src_path).convert("RGBA")
arr = np.array(img)
h, w = arr.shape[:2]

# BFS from border to find black background
visited = np.zeros((h, w), dtype=bool)
queue = deque()

# Add all border pixels that are black/dark
for y in range(h):
    for x in (0, w - 1):
        if not visited[y, x] and np.max(arr[y, x, :3]) <= 20:
            visited[y, x] = True
            queue.append((y, x))
for x in range(w):
    for y in (0, h - 1):
        if not visited[y, x] and np.max(arr[y, x, :3]) <= 20:
            visited[y, x] = True
            queue.append((y, x))

while queue:
    cy, cx = queue.popleft()
    for dy, dx in ((-1,0), (1,0), (0,-1), (0,1)):
        ny, nx = cy + dy, cx + dx
        if 0 <= ny < h and 0 <= nx < w and not visited[ny, nx]:
            if np.max(arr[ny, nx, :3]) <= 22:
                visited[ny, nx] = True
                queue.append((ny, nx))

# Set alpha to 0 for outer background
arr[visited, 3] = 0

# Soften outer edge slightly:
# Find pixels on the boundary between visited and non-visited
alpha = arr[:, :, 3]
res = Image.fromarray(arr)

# Save result
os.makedirs("d:/cuti/assets", exist_ok=True)
out_path = "d:/cuti/assets/employr-mascot.png"
res.save(out_path, "PNG")
print(f"Mascot transparent PNG successfully created at {out_path}")
