import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

const GOOGLE_VISION_API_KEY = Deno.env.get("GOOGLE_VISION_API_KEY");

export default {
  fetch: withSupabase({ auth: ["publishable"] }, async (req, ctx) => {
    try {
      const { imageBase64 } = await req.json();

      if (!imageBase64) {
        return Response.json({ error: "No image provided" }, { status: 400 });
      }

      const visionResponse = await fetch(
        `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_VISION_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            requests: [
              {
                image: { content: imageBase64 },
                features: [{ type: "TEXT_DETECTION" }],
              },
            ],
          }),
        }
      );

      const visionData = await visionResponse.json();
      const text = visionData.responses?.[0]?.fullTextAnnotation?.text || "";

      return Response.json({ text });
    } catch (err) {
      return Response.json({ error: err.message }, { status: 500 });
    }
  }),
};