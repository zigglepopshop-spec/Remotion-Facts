const express = require("express");
const cors = require("cors");
const { bundle } = require("@remotion/bundler");
const { renderMedia, selectComposition } = require("@remotion/renderer");
const path = require("path");
const fs = require("fs");
const os = require("os");

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "Space Facts Remotion Server" });
});

// Main render endpoint
app.post("/render", async (req, res) => {
  const { hook, body, cta, title, audioUrl } = req.body;

  if (!hook || !body || !cta) {
    return res.status(400).json({ error: "Missing required fields: hook, body, cta" });
  }

  console.log(`\n[RENDER] Starting: "${title}"`);
  const startTime = Date.now();

  try {
    // Bundle the Remotion project
    const bundleLocation = await bundle({
      entryPoint: path.resolve("./src/index.tsx"),
      webpackOverride: (config) => config,
    });

    // Select the composition
    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: "SpaceFacts",
      inputProps: { hook, body, cta, title, audioUrl },
    });

    // Output path
    const outputDir = path.join(os.tmpdir(), "space-facts-renders");
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const filename = `space-fact-${Date.now()}.mp4`;
    const outputPath = path.join(outputDir, filename);

    // Render the video
    await renderMedia({
      composition,
      serveUrl: bundleLocation,
      codec: "h264",
      outputLocation: outputPath,
      inputProps: { hook, body, cta, title, audioUrl },
      onProgress: ({ progress }) => {
        process.stdout.write(`\r[RENDER] Progress: ${Math.round(progress * 100)}%`);
      },
    });

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n[RENDER] Done in ${elapsed}s: ${outputPath}`);

    // Serve the file back
    const fileBuffer = fs.readFileSync(outputPath);
    const base64 = fileBuffer.toString("base64");

    // Clean up
    fs.unlinkSync(outputPath);

    res.json({
      success: true,
      video_base64: base64,
      filename,
      duration_seconds: elapsed,
    });

  } catch (error) {
    console.error("[RENDER ERROR]", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Serve rendered video as file (alternative endpoint)
app.post("/render-file", async (req, res) => {
  const { hook, body, cta, title, audioUrl } = req.body;

  try {
    const bundleLocation = await bundle({
      entryPoint: path.resolve("./src/index.tsx"),
      webpackOverride: (config) => config,
    });

    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: "SpaceFacts",
      inputProps: { hook, body, cta, title, audioUrl },
    });

    const outputDir = path.join(os.tmpdir(), "space-facts-renders");
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const filename = `space-fact-${Date.now()}.mp4`;
    const outputPath = path.join(outputDir, filename);

    await renderMedia({
      composition,
      serveUrl: bundleLocation,
      codec: "h264",
      outputLocation: outputPath,
      inputProps: { hook, body, cta, title, audioUrl },
    });

    res.download(outputPath, filename, () => {
      fs.unlinkSync(outputPath);
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 Space Facts Remotion Server running on port ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health`);
  console.log(`   Render: POST http://localhost:${PORT}/render\n`);
});
