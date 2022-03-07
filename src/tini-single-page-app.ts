import { getAssetFromKV, serveSinglePageApp, Options } from '@cloudflare/kv-asset-handler';

type TiniSPAOptions = Options & {
  // path relative to bucket as set in wrangler.toml
  notFoundPath: string

  // if you want api-friendly responses instead of generic responses
  apiFriendly: boolean
}

/**
 * A simple route for handling single page apps with @helloandre/tini
 * 
 * @param options TiniSPAOptions
 * @returns (request: Request) => Response
 */
export default function (options?: Partial<TiniSPAOptions>) {
  return async function (request: Request) {
    // we have to slightly fake an event object, but it's mostly harmless
    const event = { request, waitUntil: () => { } }

    try {
      return await getAssetFromKV(
        event,
        {
          mapRequestToAsset: serveSinglePageApp,
          ...options
        }
      );
    } catch (e) {
      // if an error is thrown try to serve the asset at 404.html
      try {
        if (options.notFoundPath) {
          let notFoundResponse = await getAssetFromKV(event, {
            mapRequestToAsset: req => new Request(`${new URL(req.url).origin}/${options.notFoundPath.replace(/^\//, '')}`, req),
          });

          return new Response(notFoundResponse.body, { ...notFoundResponse, status: 404 });
        } else if (options.apiFriendly) {
          return new Response(JSON.stringify({ success: false }), { status: 404 });
        } else {
          return new Response("Not Found", { status: 404 });
        }
      } catch (e) {
        if (options.apiFriendly) {
          return new Response(JSON.stringify({ success: false }), { status: 500 });
        } else {
          return new Response("Server Error", { status: 500 });
        }
      }
    }
  }
};
