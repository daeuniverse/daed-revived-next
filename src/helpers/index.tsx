export const randomUnsplashImageURL = (sig: string, width: number, height: number) =>
  `https://source.unsplash.com/random/${width}x${height}?goose&sig=${sig}`
