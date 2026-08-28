import sharp from 'sharp';

/**
 * Applies a tasteful, automatic enhancement (exposure/contrast/color/sharpness)
 * and re-encodes to WebP for a smaller file. Never crops, resizes, or otherwise
 * changes the image's composition/dimensions.
 */
export async function enhanceImage(buffer) {
  try {
    const output = await sharp(buffer, { failOn: 'none' })
      .rotate() // apply EXIF orientation, then strip it (avoids sideways photos)
      .normalize({ lower: 1, upper: 99 })
      .modulate({ brightness: 1.03, saturation: 1.1 })
      .gamma(1.05)
      .sharpen({ sigma: 0.6 })
      .webp({ quality: 94, effort: 6 })
      .toBuffer();
    return { buffer: output, contentType: 'image/webp', extension: 'webp' };
  } catch (error) {
    console.error('Erro ao tratar imagem, usando original:', error);
    return null;
  }
}
