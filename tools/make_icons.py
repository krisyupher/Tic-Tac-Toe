"""Generate PWA icons for the Tic-Tac-Toe game.

Draws a 3x3 board with a pink X and a cyan O on the project's purple
gradient, matching the in-game theme. Produces normal + maskable PNGs.
Run:  python tools/make_icons.py
"""
from PIL import Image, ImageDraw

PINK = (236, 72, 153)   # --color-player-x
CYAN = (6, 182, 212)    # --color-player-o
GRID = (255, 255, 255)


def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def gradient(size):
    """Diagonal purple gradient like the site background."""
    top = (49, 46, 129)     # #312e81
    bottom = (109, 40, 217)  # #6d28d9
    img = Image.new("RGB", (size, size))
    px = img.load()
    for y in range(size):
        for x in range(size):
            t = (x + y) / (2 * size)
            px[x, y] = lerp(top, bottom, t)
    return img


def draw_board(size, inset_ratio):
    """Render the icon. inset_ratio shrinks content for maskable safe zone."""
    img = gradient(size).convert("RGBA")
    d = ImageDraw.Draw(img)

    inset = int(size * inset_ratio)
    board = size - 2 * inset
    cell = board / 3
    x0, y0 = inset, inset

    # Grid lines (translucent white)
    lw = max(2, int(size * 0.012))
    line = GRID + (90,)
    for i in (1, 2):
        gx = int(x0 + cell * i)
        gy = int(y0 + cell * i)
        d.line([(gx, y0), (gx, y0 + board)], fill=line, width=lw)
        d.line([(x0, gy), (x0 + board, gy)], fill=line, width=lw)

    def cell_box(r, c, pad):
        cx0 = x0 + cell * c + cell * pad
        cy0 = y0 + cell * r + cell * pad
        cx1 = x0 + cell * (c + 1) - cell * pad
        cy1 = y0 + cell * (r + 1) - cell * pad
        return cx0, cy0, cx1, cy1

    stroke = max(4, int(size * 0.03))

    # Pink X in top-left cell
    ax0, ay0, ax1, ay1 = cell_box(0, 0, 0.20)
    d.line([(ax0, ay0), (ax1, ay1)], fill=PINK + (255,), width=stroke)
    d.line([(ax0, ay1), (ax1, ay0)], fill=PINK + (255,), width=stroke)

    # Cyan O in center cell
    bx0, by0, bx1, by1 = cell_box(1, 1, 0.18)
    d.ellipse([bx0, by0, bx1, by1], outline=CYAN + (255,), width=stroke)

    return img


def main():
    # Full-bleed icons (purpose "any")
    draw_board(512, 0.10).save("icons/icon-512.png")
    draw_board(512, 0.10).resize((192, 192), Image.LANCZOS).save("icons/icon-192.png")
    # Maskable: keep content inside ~80% safe zone
    draw_board(512, 0.20).save("icons/icon-maskable-512.png")
    print("Wrote icons/icon-192.png, icon-512.png, icon-maskable-512.png")


if __name__ == "__main__":
    main()
