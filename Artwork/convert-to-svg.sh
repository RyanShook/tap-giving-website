#!/bin/bash
# ============================================================
# PNG to SVG Converter — Optimized for Church Plate Artwork
# ============================================================
# Handles text, logos, and shapes with high accuracy.
# Uses ImageMagick for preprocessing + Potrace for tracing.
#
# Usage:
#   ./convert-to-svg.sh input.png
#   ./convert-to-svg.sh input.png --color     (preserve colors, multi-pass)
#   ./convert-to-svg.sh input.png --text      (extra text sharpening)
#   ./convert-to-svg.sh *.png                 (batch convert)
#
# Output: creates input.svg next to each input file
# ============================================================

set -e

# Check dependencies
command -v magick >/dev/null 2>&1 || { echo "Error: ImageMagick not found. Run: brew install imagemagick"; exit 1; }
command -v potrace >/dev/null 2>&1 || { echo "Error: potrace not found. Run: brew install potrace"; exit 1; }
command -v mkbitmap >/dev/null 2>&1 || { echo "Error: mkbitmap not found (comes with potrace)"; exit 1; }

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
TEMP_DIR="$SCRIPT_DIR/.tmp_convert"
mkdir -p "$TEMP_DIR"

# Parse flags
COLOR_MODE=false
TEXT_MODE=true
FILES=()

for arg in "$@"; do
    case "$arg" in
        --color) COLOR_MODE=true ;;
        --text)  TEXT_MODE=true ;;
        --help|-h)
            echo "Usage: ./convert-to-svg.sh [options] file1.png [file2.png ...]"
            echo ""
            echo "Options:"
            echo "  --color    Multi-color SVG (separate layer per color)"
            echo "  --text     Extra sharpening for text-heavy designs"
            echo "  --help     Show this help"
            echo ""
            echo "Examples:"
            echo "  ./convert-to-svg.sh plate-design.png"
            echo "  ./convert-to-svg.sh plate-design.png --text"
            echo "  ./convert-to-svg.sh plate-design.png --color"
            echo "  ./convert-to-svg.sh *.png --text"
            exit 0
            ;;
        *) FILES+=("$arg") ;;
    esac
done

if [ ${#FILES[@]} -eq 0 ]; then
    echo "Error: No input files specified."
    echo "Usage: ./convert-to-svg.sh input.png [--color] [--text]"
    exit 1
fi

# --------------------------------------------------------
# Convert a single color layer to SVG paths
# Args: input_bmp output_svg color_hex
# --------------------------------------------------------
trace_layer() {
    local input="$1"
    local output="$2"
    local color="$3"

    potrace "$input" \
        --svg \
        --output "$output" \
        --color "$color" \
        --turdsize 4 \
        --alphamax 1.0 \
        --opttolerance 0.2 \
        --resolution 300 \
        --tight
}

# --------------------------------------------------------
# Single-color (black/white) conversion
# Best for: text on solid background, simple logos
# --------------------------------------------------------
convert_bw() {
    local input="$1"
    local output="$2"
    local basename_noext="$(basename "${input%.*}")"

    echo "  Preprocessing..."

    # Step 1: Upscale small images for better tracing
    local width=$(magick identify -format "%w" "$input")
    local scale_input="$TEMP_DIR/${basename_noext}_scaled.png"
    if [ "$width" -lt 2000 ]; then
        magick "$input" -resize 4000x4000\> -filter Lanczos "$scale_input"
        echo "    Upscaled from ${width}px to $(magick identify -format '%w' "$scale_input")px"
    else
        cp "$input" "$scale_input"
    fi

    # Step 2: Preprocessing pipeline for clean edges
    local preprocessed="$TEMP_DIR/${basename_noext}_preprocessed.png"
    if [ "$TEXT_MODE" = true ]; then
        # Text mode: aggressive sharpening + high contrast threshold
        magick "$scale_input" \
            -colorspace Gray \
            -normalize \
            -sharpen 0x2 \
            -unsharp 0x5+1.5+0 \
            -threshold 50% \
            -morphology Close Disk:1 \
            "$preprocessed"
        echo "    Applied text-optimized sharpening"
    else
        # Standard mode: clean threshold
        magick "$scale_input" \
            -colorspace Gray \
            -normalize \
            -threshold 50% \
            "$preprocessed"
        echo "    Applied standard threshold"
    fi

    # Step 3: Convert to PBM (potrace input format)
    local pbm="$TEMP_DIR/${basename_noext}.pbm"
    magick "$preprocessed" "$pbm"

    # Step 4: Use mkbitmap for additional cleanup (potrace's own preprocessor)
    local cleaned_pbm="$TEMP_DIR/${basename_noext}_clean.pbm"
    mkbitmap "$pbm" -o "$cleaned_pbm" -s 2 -t 0.48

    # Step 5: Trace to SVG
    echo "  Tracing..."
    potrace "$cleaned_pbm" \
        --svg \
        --output "$output" \
        --turdsize 4 \
        --alphamax 1.0 \
        --opttolerance 0.2 \
        --resolution 300 \
        --tight

    echo "  Done: $output"
}

# --------------------------------------------------------
# Multi-color conversion
# Extracts dominant colors and traces each as a layer
# --------------------------------------------------------
convert_color() {
    local input="$1"
    local output="$2"
    local basename_noext="$(basename "${input%.*}")"

    echo "  Extracting colors..."

    # Step 1: Upscale if needed
    local width=$(magick identify -format "%w" "$input")
    local scale_input="$TEMP_DIR/${basename_noext}_scaled.png"
    if [ "$width" -lt 2000 ]; then
        magick "$input" -resize 4000x4000\> -filter Lanczos "$scale_input"
    else
        cp "$input" "$scale_input"
    fi

    # Step 2: Quantize to find dominant colors (max 8)
    local colors=$(magick "$scale_input" -colors 8 -depth 8 -format "%c" histogram:info: \
        | sort -rn \
        | head -8 \
        | grep -oE '#[0-9A-Fa-f]{6}')

    local layer_count=0
    local svg_layers=()

    for color in $colors; do
        # Skip near-white and near-transparent colors (background)
        local r=$(printf "%d" "0x${color:1:2}")
        local g=$(printf "%d" "0x${color:3:2}")
        local b=$(printf "%d" "0x${color:5:2}")
        local brightness=$(( (r + g + b) / 3 ))
        if [ "$brightness" -gt 240 ]; then
            continue
        fi

        layer_count=$((layer_count + 1))
        echo "  Layer $layer_count: $color"

        # Isolate this color (with fuzz tolerance)
        local layer_png="$TEMP_DIR/${basename_noext}_layer_${layer_count}.png"
        magick "$scale_input" \
            -fuzz 15% \
            -fill white -opaque "$color" \
            -fill black +opaque white \
            -colorspace Gray \
            -threshold 50% \
            -negate \
            "$layer_png"

        # Convert to PBM and trace
        local layer_pbm="$TEMP_DIR/${basename_noext}_layer_${layer_count}.pbm"
        magick "$layer_png" "$layer_pbm"

        local layer_svg="$TEMP_DIR/${basename_noext}_layer_${layer_count}.svg"
        trace_layer "$layer_pbm" "$layer_svg" "$color"
        svg_layers+=("$layer_svg")
    done

    # Step 3: Merge SVG layers into one file
    if [ ${#svg_layers[@]} -eq 0 ]; then
        echo "  Warning: No colors extracted. Falling back to B&W."
        convert_bw "$input" "$output"
        return
    fi

    echo "  Merging $layer_count layers..."

    # Get dimensions from first layer
    local svg_width=$(grep -oE 'width="[^"]*"' "${svg_layers[0]}" | head -1)
    local svg_height=$(grep -oE 'height="[^"]*"' "${svg_layers[0]}" | head -1)
    local svg_viewbox=$(grep -oE 'viewBox="[^"]*"' "${svg_layers[0]}" | head -1)

    # Build combined SVG
    {
        echo '<?xml version="1.0" encoding="UTF-8"?>'
        echo "<svg xmlns=\"http://www.w3.org/2000/svg\" $svg_width $svg_height $svg_viewbox>"

        for layer_svg in "${svg_layers[@]}"; do
            # Extract paths from each layer SVG
            sed -n '/<g/,/<\/g>/p' "$layer_svg"
        done

        echo '</svg>'
    } > "$output"

    echo "  Done: $output ($layer_count color layers)"
}

# --------------------------------------------------------
# Main loop
# --------------------------------------------------------
for file in "${FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo "Warning: '$file' not found, skipping."
        continue
    fi

    # Get output path (same location, .svg extension)
    output="${file%.*}.svg"
    echo "Converting: $file"

    if [ "$COLOR_MODE" = true ]; then
        convert_color "$file" "$output"
    else
        convert_bw "$file" "$output"
    fi

    # Show file size comparison
    input_size=$(du -h "$file" | cut -f1)
    output_size=$(du -h "$output" | cut -f1)
    echo "  Size: $input_size (PNG) → $output_size (SVG)"
    echo ""
done

# Cleanup temp files
rm -rf "$TEMP_DIR"

echo "All done!"
