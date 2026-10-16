export function GET(request: Request) {
  return Response.redirect(new URL("/ru/opengraph-image", request.url), 307);
}
