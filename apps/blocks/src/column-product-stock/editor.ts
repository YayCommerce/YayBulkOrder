import { BlockConfiguration, registerBlockType } from "@wordpress/blocks";

import metadata from "./block.json";
import Edit from "./edit";
import Save from "./save";

registerBlockType(metadata as unknown as BlockConfiguration, {
  edit: Edit,
  save: Save,
});
