import { BlockConfiguration, registerBlockType } from "@wordpress/blocks";
import { columns } from "@wordpress/icons";

import "./style.scss";
import metadata from "./block.json";
import Edit from "./edit";
import Save from "./save";

registerBlockType(metadata as unknown as BlockConfiguration, {
  icon: columns,
  edit: Edit,
  save: Save,
});
