import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// LEY OJO DE AGUA -> CLINICA 1 coordinates from KML
const coordinates = [
  [-116.7903937, 32.470373], [-116.7904983, 32.471298], [-116.7938457, 32.4709721],
  [-116.794399, 32.4751036], [-116.7945037, 32.4763862], [-116.7950294, 32.4767347],
  [-116.7959092, 32.4772687], [-116.7974113, 32.4777845], [-116.7982837, 32.4780404],
  [-116.798348, 32.4781943], [-116.8016526, 32.4779454], [-116.8025537, 32.4778503],
  [-116.8037553, 32.4780043], [-116.8045064, 32.4781309], [-116.8049248, 32.4782034],
  [-116.8052574, 32.4784025], [-116.8055311, 32.4786197], [-116.8058797, 32.4788505],
  [-116.8060621, 32.4790587], [-116.8065878, 32.4795293], [-116.8067461, 32.4798257],
  [-116.8069177, 32.4801425], [-116.8069874, 32.4807805], [-116.8066817, 32.4812647],
  [-116.8066086, 32.4814839], [-116.80672, 32.481603], [-116.8068802, 32.481767],
  [-116.8070841, 32.4819706], [-116.8074381, 32.4818213], [-116.8076312, 32.4817625],
  [-116.807819, 32.4816765], [-116.8084761, 32.4814978], [-116.8092217, 32.4813665],
  [-116.8093343, 32.4816561], [-116.8095168, 32.4820092], [-116.8096938, 32.4829097],
  [-116.809683, 32.4837332], [-116.8088785, 32.4857514], [-116.8088355, 32.4861859],
  [-116.8086317, 32.4868103], [-116.8083071, 32.4873872], [-116.8086102, 32.4874144],
  [-116.8090259, 32.4874687], [-116.8100747, 32.4875501], [-116.8130466, 32.4878759],
  [-116.8141302, 32.4879573], [-116.8147525, 32.4868261], [-116.815482, 32.4857989],
  [-116.8165978, 32.4832875], [-116.8171986, 32.4824006], [-116.819677, 32.4811787],
  [-116.8201169, 32.481043], [-116.8205678, 32.4808124], [-116.821517, 32.4818213],
  [-116.8230673, 32.4835952], [-116.8243654, 32.4849798], [-116.8251165, 32.4857762],
  [-116.8262752, 32.4879573], [-116.8282493, 32.4901112], [-116.8297192, 32.4916587],
  [-116.8313714, 32.4922468], [-116.8329866, 32.4927432], [-116.8338342, 32.4929784],
  [-116.8342098, 32.4930599], [-116.83495, 32.4930147], [-116.8357547, 32.4924626],
  [-116.8364735, 32.4909061], [-116.8370851, 32.4895487], [-116.8375196, 32.4891234],
  [-116.837997, 32.488698], [-116.83863, 32.4883994], [-116.8404647, 32.4878112],
  [-116.8412586, 32.4884537], [-116.8424066, 32.4893677], [-116.843179, 32.4899016],
  [-116.8439515, 32.4903993], [-116.8444933, 32.490612], [-116.8451961, 32.4907885],
  [-116.8473526, 32.4906165], [-116.8479534, 32.4905712], [-116.8522235, 32.490146],
  [-116.8534895, 32.4900917], [-116.8537222, 32.4900826], [-116.853987, 32.4900283],
  [-116.854506, 32.4898926], [-116.8555119, 32.4896211], [-116.8574698, 32.48906],
  [-116.8631884, 32.4874672], [-116.867437, 32.4851685], [-116.8688532, 32.4844083],
  [-116.870205, 32.4833766], [-116.8709131, 32.4836119], [-116.872222, 32.4841187],
  [-116.8728014, 32.4780003], [-116.8733378, 32.4718457], [-116.8739064, 32.4664736],
  [-116.874003, 32.4642694], [-116.8737132, 32.4620959], [-116.8804241, 32.4615663],
  [-116.8824626, 32.4614849], [-116.8842598, 32.4610458], [-116.8880364, 32.4601089],
  [-116.8901955, 32.4595747], [-116.8923225, 32.4589093], [-116.8931271, 32.4585268],
  [-116.8933551, 32.4583141], [-116.893571, 32.458261], [-116.8938989, 32.4580329],
  [-116.8941061, 32.457943], [-116.8944749, 32.457969], [-116.8948364, 32.4581043],
  [-116.8956152, 32.4584389], [-116.8958008, 32.4584501], [-116.8965534, 32.458811],
  [-116.8972846, 32.4591267], [-116.8987491, 32.4598396], [-116.8999775, 32.4604212],
  [-116.9009485, 32.4610933], [-116.9019302, 32.4619601], [-116.9023808, 32.4621841],
  [-116.9029306, 32.4623334], [-116.9071015, 32.4622679], [-116.9080778, 32.4622634],
  [-116.9089468, 32.4624127], [-116.9101712, 32.4630214], [-116.9117148, 32.4638611],
  [-116.9132329, 32.4647142], [-116.9147926, 32.4655471], [-116.9154323, 32.4659007],
  [-116.9160184, 32.4663176], [-116.9164516, 32.4668392], [-116.9167527, 32.4676494],
  [-116.9169303, 32.4684482], [-116.9192572, 32.4676584], [-116.920153, 32.4667985],
  [-116.9205554, 32.466346], [-116.9212956, 32.4663439], [-116.9224007, 32.4664935],
  [-116.9228245, 32.4668353], [-116.9232482, 32.4673492], [-116.9240958, 32.4684583],
  [-116.9261985, 32.4722621], [-116.9270997, 32.4742726], [-116.9267403, 32.4745648],
  [-116.9263809, 32.474694], [-116.9260349, 32.4744532], [-116.925646, 32.4745201],
  [-116.9255735, 32.4748042], [-116.9256835, 32.4754504], [-116.9258981, 32.4762156],
  [-116.9259518, 32.476483], [-116.9259359, 32.4765806], [-116.9259492, 32.4766882],
  [-116.925958, 32.4767359], [-116.9259908, 32.476831], [-116.926019, 32.4769807],
  [-116.9260364, 32.4770625], [-116.9260559, 32.4771825], [-116.9260763, 32.477264],
  [-116.9261014, 32.4773501], [-116.9261829, 32.4776989]
];

const stops = [
  { name: "Terminal Ley Ojo de Agua", latitude: 32.470373, longitude: -116.7903937, order_index: 1 },
  { name: "Soriana Florido", latitude: 32.4582988, longitude: -116.8930807, order_index: 2 },
  { name: "Iglesia de la Curva", latitude: 32.4758726, longitude: -116.8731149, order_index: 3 },
  { name: "Plaza 2000", latitude: 32.489601, longitude: -116.855494, order_index: 4 },
  { name: "Gasolinera Terrazas", latitude: 32.4878075, longitude: -116.8404515, order_index: 5 },
  { name: "Terminal Clínica 1", latitude: 32.477431, longitude: -116.9261039, order_index: 6 }
];

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Starting Ruta 22 update...');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get Ruta 22 ID
    console.log('📍 Finding Ruta 22...');
    const { data: route, error: routeError } = await supabase
      .from('routes')
      .select('id')
      .eq('name', 'Ruta 22')
      .single();

    if (routeError || !route) {
      console.error('❌ Error finding Ruta 22:', routeError);
      throw new Error('No se encontró la Ruta 22');
    }

    const routeId = route.id;
    console.log('✅ Found Ruta 22:', routeId);

    // Delete old route points
    console.log('🗑️ Deleting old route points...');
    const { error: deletePointsError } = await supabase
      .from('route_points')
      .delete()
      .eq('route_id', routeId);

    if (deletePointsError) {
      console.error('❌ Error deleting route points:', deletePointsError);
      throw deletePointsError;
    }
    console.log('✅ Old route points deleted');

    // Delete old stops
    console.log('🗑️ Deleting old stops...');
    const { error: deleteStopsError } = await supabase
      .from('stops')
      .delete()
      .eq('route_id', routeId);

    if (deleteStopsError) {
      console.error('❌ Error deleting stops:', deleteStopsError);
      throw deleteStopsError;
    }
    console.log('✅ Old stops deleted');

    // Insert new route points
    console.log('📍 Inserting new route points...');
    const newPoints = coordinates.map(([longitude, latitude], index) => ({
      route_id: routeId,
      latitude,
      longitude,
      order_index: index + 1
    }));

    const { error: insertPointsError } = await supabase
      .from('route_points')
      .insert(newPoints);

    if (insertPointsError) {
      console.error('❌ Error inserting route points:', insertPointsError);
      throw insertPointsError;
    }
    console.log(`✅ Inserted ${newPoints.length} new route points`);

    // Insert new stops
    console.log('🚏 Inserting new stops...');
    const stopsToInsert = stops.map(stop => ({
      ...stop,
      route_id: routeId
    }));

    const { error: insertStopsError } = await supabase
      .from('stops')
      .insert(stopsToInsert);

    if (insertStopsError) {
      console.error('❌ Error inserting stops:', insertStopsError);
      throw insertStopsError;
    }
    console.log(`✅ Inserted ${stopsToInsert.length} new stops`);

    console.log('🎉 Ruta 22 update completed successfully!');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Ruta 22 actualizada exitosamente',
        points: newPoints.length,
        stops: stopsToInsert.length
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('❌ Error updating Ruta 22:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Error al actualizar la Ruta 22'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
