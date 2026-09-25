Drop your exported car model here as:

  scene.gltf   (+ its .bin and any texture files, if it's not a single .glb)

The app loads it from `/models/scene.gltf` (see components/CarModel.tsx).

## Keep it light — do this before you drop it in

Run the optimize script from the project root (it Draco-compresses geometry
and converts textures to WebP, usually a 70-90% size cut):

  npm run optimize-model -- path/to/your/raw-export/scene.gltf public/models/scene.gltf

That writes the compressed result straight to public/models/scene.gltf
(and public/models/scene.bin + textures alongside it). @react-three/drei's loader already
has Draco/Meshopt decoding wired up, so no extra setup is needed on the
app side — just make sure the file that ends up here is the compressed one.

The car doesn't need to be pre-centered or scaled to any particular size —
CarModel.tsx measures its bounding box on load and auto-centers/auto-scales
it, so whatever units your export uses, it'll fit the camera path.

## Required file layout (this is what was missing)

The gltf JSON references external files, so ALL of these must exist:

  public/models/scene.gltf
  public/models/scene.bin
  public/models/textures/*.png   (35 files, e.g. EXT_RIM_normal.png ...)

Verify: open http://localhost:3000/models/scene.gltf, /models/scene.bin and
/models/textures/EXT_Carpaint_Inst_baseColor.png in the browser — each must
download, not 404.
