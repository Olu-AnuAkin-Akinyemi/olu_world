// functions/api/starboard/manifest.ts

interface Env {
  STARBOARD_API_KEY: string;
}

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const response = await fetch(
    'https://starboard.one-kind.co/api/public/projects/fdf755ab-80a7-40fb-b168-edef1e7ebd9a/manifest',
    {
      headers: {
        authorization: `Bearer ${env.STARBOARD_API_KEY}`,
      },
    }
  );

  return new Response(response.body, {
    status: response.status,
    headers: {
      'content-type': response.headers.get('content-type') ?? 'application/json',
      'cache-control': 'public, max-age=60',
      'access-control-allow-origin': '*',
    },
  });
};
