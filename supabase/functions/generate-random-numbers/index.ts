import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { topicCount } = await req.json()
    const RANDOM_API_KEY = Deno.env.get('RANDOM_API_KEY')

    if (!RANDOM_API_KEY) {
      throw new Error('RANDOM_API_KEY is not set')
    }

    const res = await fetch('https://api.random.org/json-rpc/4/invoke', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'generateIntegers',
        params: {
          apiKey: RANDOM_API_KEY,
          n: 2,
          min: 1,
          max: topicCount,
          replacement: false,
          base: 10
        },
        id: Math.ceil(Math.random() * 1000)
      })
    })

    const randomAPI = await res.json()

    if (randomAPI.error) {
      throw new Error(randomAPI.error.message || 'Error from random.org API')
    }

    const data = randomAPI.result.random.data

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
