import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

const GOOGLE_VISION_API_KEY = Deno.env.get("GOOGLE_VISION_API_KEY");

export default {
  fetch: withSupabase({ auth: ["publishable"] }, async (req, ctx) => {
    try {
      const { imageBase64 } = await req.json();

      if (!imageBase64) {
        console.log("No image provided in request");
        return Response.json({ error: "No image provided" }, { status: 400 });
      }

      console.log("Image received, length:", imageBase64.length);

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
      console.log("Vision API raw response:", JSON.stringify(visionData));

      if (visionData.responses?.[0]?.error) {
        console.log("Vision API returned an error:", visionData.responses[0].error);
        return Response.json({ error: visionData.responses[0].error.message }, { status: 500 });
      }

      const text = visionData.responses?.[0]?.fullTextAnnotation?.text || "";
      console.log("Extracted text length:", text.length);

      return Response.json({ text });
    } catch (err) {
      console.log("Function error:", err.message);
      return Response.json({ error: err.message }, { status: 500 });
    }
  }),
};