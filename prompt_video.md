# Prompt para Generar Video de Apertura del Sobre — Gemini

## Instrucciones antes de usar el prompt:
1. Abre Gemini y selecciona generación de video
2. Adjunta la imagen `sobre_cerrado2.png` como referencia visual
3. Copia y pega el prompt de abajo
4. Descarga el video generado
5. Guárdalo como: `public/sobre_apertura.mp4`
6. Si Gemini genera en otro formato (WebM), guárdalo como está

---

## PROMPT (copia desde aquí):

Using the attached reference image as the EXACT starting frame, generate a 5-second slow-motion video.

WHAT HAPPENS IN THE VIDEO:
A dark olive green paper envelope is lying on a warm golden cream satin fabric surface. The envelope is viewed from directly above (flat lay, top-down camera). The envelope is tilted approximately 15 degrees clockwise.

The ONLY thing that moves is the triangular flap (the pointed top flap of the envelope). The flap starts completely CLOSED (flat against the envelope body, as shown in the reference image) and SLOWLY opens — rotating backward along its top hinge line — until it is fully open (folded flat behind the envelope body).

CRITICAL REQUIREMENTS:
- The envelope body (front pocket, left side flap, right side flap, bottom flap) must remain COMPLETELY STATIC the entire video. NOTHING moves except the top triangular flap.
- The flap moves extremely slowly and smoothly — like real paper being gently peeled open by invisible fingers.
- Starting at approximately 20% open, a white/cream colored card becomes visible inside the envelope opening. The card has NO text on it — just plain white/cream paper with subtle linen texture.
- The flap's interior face (visible as it opens) is the same olive green color but with a thin darker border along the edges (the glue strip).
- The flap casts a soft, realistic shadow onto the envelope body as it rotates.
- The background surface is warm golden/champagne colored satin fabric with natural soft folds and wrinkles. It remains completely static.

CAMERA:
- Directly above (top-down flat lay perspective)
- NO camera movement, NO zoom, NO rotation
- Fixed position throughout

LIGHTING:
- Soft studio light from the upper-left
- Consistent throughout, no flickering

STYLE:
- Photorealistic product photography quality
- The paper texture should look real — matte, slightly fibrous
- The envelope color is dark olive/forest green (#3B4332)
- Ultra slow motion, ceremonial pace
- Cinematic quality

TECHNICAL:
- Duration: exactly 5 seconds
- Resolution: 720 x 960 pixels (portrait orientation, 3:4 aspect ratio)
- Frame rate: highest available (60fps preferred)
- The video starts with the flap fully closed and ends with it fully open

---

## PROMPT ALTERNATIVO (más corto, si Gemini no acepta prompts largos):

5-second slow-motion video of a dark olive green envelope opening, top-down flat lay view on golden satin fabric. Only the triangular top flap moves — slowly rotating open from closed to fully open. A white card becomes visible inside at 20% open. Envelope body stays completely still. Photorealistic, 720x960 portrait, cinematic quality, soft lighting from upper-left. Use the attached image as the starting frame.

---

## DESPUÉS DE GENERAR:
1. Revisa que el cuerpo del sobre NO se mueva
2. Revisa que la solapa se abra suavemente
3. Si el fondo no es dorado/seda, está bien — lo ajustaremos en código
4. Guarda como `sobre_apertura.mp4` (o `.webm`) en la carpeta `public/`
