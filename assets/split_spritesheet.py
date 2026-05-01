from PIL import Image
import os
import json
import argparse


def remove_white_background(image, white_threshold=245):
    image = image.convert("RGBA")
    pixels = image.load()
    width, height = image.size

    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            if r >= white_threshold and g >= white_threshold and b >= white_threshold:
                pixels[x, y] = (255, 255, 255, 0)

    return image


def remove_isolated_pixels(image, min_size=8):
    """去除与主体不连通的孤立小像素块（如法杖尖端碎片）"""
    from PIL import ImageFilter

    alpha = image.split()[3]
    mask = alpha.point(lambda p: 255 if p > 0 else 0)

    bbox = mask.getbbox()
    if not bbox:
        return image

    flood = Image.new("L", image.size, 0)

    seeds = []
    cx = (bbox[0] + bbox[2]) // 2
    cy = (bbox[1] + bbox[3]) // 2
    for dy in range(-2, 3):
        for dx in range(-2, 3):
            sx, sy = cx + dx, cy + dy
            if 0 <= sx < image.width and 0 <= sy < image.height:
                if mask.getpixel((sx, sy)) == 255:
                    seeds.append((sx, sy))
                    break
        if seeds:
            break

    if not seeds:
        seeds = [(bbox[0], bbox[1])]

    visited = set()
    stack = list(seeds)
    while stack:
        x, y = stack.pop()
        if (x, y) in visited:
            continue
        visited.add((x, y))
        flood.putpixel((x, y), 255)
        for dx, dy in [(0, -1), (0, 1), (-1, 0), (1, 0)]:
            nx, ny = x + dx, y + dy
            if 0 <= nx < image.width and 0 <= ny < image.height:
                if (nx, ny) not in visited and mask.getpixel((nx, ny)) == 255:
                    stack.append((nx, ny))

    r, g, b, a = image.split()
    a = Image.composite(a, Image.new("L", image.size, 0), flood)
    return Image.merge("RGBA", (r, g, b, a))


def trim_transparent(image):
    bbox = image.getbbox()
    if bbox:
        return image.crop(bbox)
    return image


def fit_to_canvas_bottom_center(image, canvas_size=256, bottom_margin=18):
    image = trim_transparent(image)
    iw, ih = image.size
    max_size = canvas_size - 24
    scale = min(max_size / iw, max_size / ih, 1.0)
    new_w = int(iw * scale)
    new_h = int(ih * scale)
    image = image.resize((new_w, new_h), Image.LANCZOS)

    canvas = Image.new("RGBA", (canvas_size, canvas_size), (255, 255, 255, 0))
    x = (canvas_size - new_w) // 2
    y = canvas_size - new_h - bottom_margin
    canvas.alpha_composite(image, (x, y))
    return canvas


def split_spritesheet(
    input_file,
    output_dir,
    names,
    grid_cols=3,
    grid_rows=2,
    canvas_size=256,
    white_threshold=245,
    bottom_margin=18,
    remove_white=True,
):
    os.makedirs(output_dir, exist_ok=True)
    img = Image.open(input_file).convert("RGBA")
    w, h = img.size

    x_edges = [0]
    for i in range(1, grid_cols):
        x_edges.append(int(w * i / grid_cols))
    x_edges.append(w)

    y_edges = [0]
    for i in range(1, grid_rows):
        y_edges.append(int(h * i / grid_rows))
    y_edges.append(h)

    index = 0
    outputs = []

    for row in range(grid_rows):
        for col in range(grid_cols):
            if index >= len(names):
                break
            left = x_edges[col]
            right = x_edges[col + 1]
            top = y_edges[row]
            bottom = y_edges[row + 1]

            tile = img.crop((left, top, right, bottom))
            if remove_white:
                tile = remove_white_background(tile, white_threshold)
            tile = remove_isolated_pixels(tile)
            tile = fit_to_canvas_bottom_center(tile, canvas_size, bottom_margin)

            output_path = os.path.join(output_dir, names[index])
            tile.save(output_path)
            outputs.append(output_path)
            print(f"Saved: {output_path}")
            index += 1

    return outputs


def main():
    parser = argparse.ArgumentParser(description="Split game spritesheet into individual sprites")
    parser.add_argument("--input", "-i", required=True, help="Input spritesheet file path")
    parser.add_argument("--output-dir", "-o", required=True, help="Output directory for sprites")
    parser.add_argument("--names", "-n", nargs="+", required=True, help="Output filenames for each sprite")
    parser.add_argument("--cols", "-c", type=int, default=3, help="Number of columns in grid (default: 3)")
    parser.add_argument("--rows", "-r", type=int, default=2, help="Number of rows in grid (default: 2)")
    parser.add_argument("--canvas", type=int, default=256, help="Output canvas size (default: 256)")
    parser.add_argument("--threshold", "-t", type=int, default=245, help="White background removal threshold (default: 245)")
    parser.add_argument("--margin", "-m", type=int, default=18, help="Bottom margin for canvas placement (default: 18)")
    parser.add_argument("--no-remove-white", action="store_true", help="Skip white background removal")
    args = parser.parse_args()

    split_spritesheet(
        input_file=args.input,
        output_dir=args.output_dir,
        names=args.names,
        grid_cols=args.cols,
        grid_rows=args.rows,
        canvas_size=args.canvas,
        white_threshold=args.threshold,
        bottom_margin=args.margin,
        remove_white=not args.no_remove_white,
    )
    print("Done.")


if __name__ == "__main__":
    main()
