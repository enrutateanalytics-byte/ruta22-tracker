import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { auth: { persistSession: false } }
    )

    const { method } = req
    const url = new URL(req.url)
    const pathSegments = url.pathname.split('/').filter(Boolean)
    const routeId = pathSegments[pathSegments.length - 1]

    switch (method) {
      case 'GET':
        if (routeId && routeId !== 'routes') {
          // Get specific route with stops and points
          return await getRouteDetails(supabase, routeId)
        } else {
          // Get all active routes
          return await getRoutes(supabase)
        }

      case 'POST':
        return await createRoute(supabase, req)

      case 'PUT':
        return await updateRoute(supabase, req, routeId)

      case 'DELETE':
        return await deleteRoute(supabase, routeId)

      default:
        return new Response('Method not allowed', { 
          status: 405, 
          headers: corsHeaders 
        })
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

async function getRoutes(supabase: any) {
  const { data: routes, error } = await supabase
    .from('routes')
    .select(`
      *,
      stops (
        id,
        name,
        latitude,
        longitude,
        order_index
      ),
      route_points (
        id,
        latitude,
        longitude,
        order_index
      )
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  // Sort stops and points by order_index
  routes?.forEach((route: any) => {
    if (route.stops) {
      route.stops.sort((a: any, b: any) => a.order_index - b.order_index)
    }
    if (route.route_points) {
      route.route_points.sort((a: any, b: any) => a.order_index - b.order_index)
    }
  })

  return new Response(JSON.stringify(routes), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function getRouteDetails(supabase: any, routeId: string) {
  const { data: route, error } = await supabase
    .from('routes')
    .select(`
      *,
      stops (
        id,
        name,
        latitude,
        longitude,
        order_index
      ),
      route_points (
        id,
        latitude,
        longitude,
        order_index
      )
    `)
    .eq('id', routeId)
    .eq('is_active', true)
    .single()

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  // Sort stops and points by order_index
  if (route.stops) {
    route.stops.sort((a: any, b: any) => a.order_index - b.order_index)
  }
  if (route.route_points) {
    route.route_points.sort((a: any, b: any) => a.order_index - b.order_index)
  }

  return new Response(JSON.stringify(route), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function createRoute(supabase: any, req: Request) {
  const { route, stops, points } = await req.json()

  // Start transaction
  const { data: newRoute, error: routeError } = await supabase
    .from('routes')
    .insert([route])
    .select()
    .single()

  if (routeError) {
    return new Response(JSON.stringify({ error: routeError.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  // Insert stops with route_id
  if (stops && stops.length > 0) {
    const stopsWithRoute = stops.map((stop: any) => ({
      ...stop,
      route_id: newRoute.id
    }))

    const { error: stopsError } = await supabase
      .from('stops')
      .insert(stopsWithRoute)

    if (stopsError) {
      return new Response(JSON.stringify({ error: stopsError.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
  }

  // Insert route points
  if (points && points.length > 0) {
    const routePoints = points.map((point: any) => ({
      ...point,
      route_id: newRoute.id
    }))

    const { error: pointsError } = await supabase
      .from('route_points')
      .insert(routePoints)

    if (pointsError) {
      return new Response(JSON.stringify({ error: pointsError.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
  }

  return new Response(JSON.stringify({ success: true, route: newRoute }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function updateRoute(supabase: any, req: Request, routeId: string) {
  const { route, stops, points } = await req.json()

  // Update route
  const { error: routeError } = await supabase
    .from('routes')
    .update(route)
    .eq('id', routeId)

  if (routeError) {
    return new Response(JSON.stringify({ error: routeError.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  // Delete existing stops and route_points
  await supabase.from('stops').delete().eq('route_id', routeId)
  await supabase.from('route_points').delete().eq('route_id', routeId)

  // Re-insert stops with route_id
  if (stops && stops.length > 0) {
    const stopsWithRoute = stops.map((stop: any) => ({
      ...stop,
      route_id: routeId
    }))

    const { error: stopsError } = await supabase
      .from('stops')
      .insert(stopsWithRoute)

    if (stopsError) {
      return new Response(JSON.stringify({ error: stopsError.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
  }

  // Re-insert route points
  if (points && points.length > 0) {
    const routePoints = points.map((point: any) => ({
      ...point,
      route_id: routeId
    }))

    const { error: pointsError } = await supabase
      .from('route_points')
      .insert(routePoints)

    if (pointsError) {
      return new Response(JSON.stringify({ error: pointsError.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function deleteRoute(supabase: any, routeId: string) {
  const { error } = await supabase
    .from('routes')
    .update({ is_active: false })
    .eq('id', routeId)

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}