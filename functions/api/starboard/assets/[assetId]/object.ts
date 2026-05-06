// functions/api/starboard/assets/[assetId]/object.ts

interface Env {
  STARBOARD_API_KEY: string;
}

export const onRequestGet: PagesFunction<Env> = async ({ env, params, request }) => {
  const assetUrl = `https://starboard.one-kind.co/api/public/assets/${encodeURIComponent(
    String(params.assetId)
  )}/object`;

  const headers = new Headers({
    authorization: `Bearer ${env.STARBOARD_API_KEY}`,
  });

  // Range header is required for audio scrubbing
  const range = request.headers.get('range');
  if (range) headers.set('range', range);

  const response = await fetch(assetUrl, { headers });

  return new Response(response.body, {
    status: response.status,
    headers: response.headers,
  });
};
