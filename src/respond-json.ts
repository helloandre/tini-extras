/**
 * A helper to respond with JSON easier
 * 
 * @param data response object
 * @param status response HTTP code
 * @returns Response
 */
export default function (data: object = { success: true }, status: number = 200) {
  const headers = new Headers();
  headers.append('Content-Type', 'application/json');
  headers.append('Cache-Control', 'no-cache, no-store, must-revalidate');
  headers.append('Expires', '0');

  if (!('success' in data)) {
    data = {
      ...data,
      success: status === 200
    };
  }

  return new Response(JSON.stringify(data), { status, headers });
}
