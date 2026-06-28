import { createAppState } from "./state.js";
import { createDemoTiles } from "./tile-synthesis/index.js";
import { createCosmosWorkbench } from "./ui/index.js";

const params = new URLSearchParams(window.location.search);
const config = {
  dev: params.get("dev") === "1" || params.get("mode") === "dev",
};

const state = createAppState();
const tiles = createDemoTiles({ seed: state.seed });
const app = createCosmosWorkbench({ tiles, state, config });

app.init();
window.COSMOS_CQA_APP = app;

