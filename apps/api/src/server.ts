import { createApp } from "./app.js";
import { env } from "./config/env.js";

const app = createApp();

app.listen(env.apiPort, () => {
  console.log(`FragmentAudio API listening on port ${env.apiPort}`);
  console.log(`Health check available at http://localhost:${env.apiPort}/health`);
});
