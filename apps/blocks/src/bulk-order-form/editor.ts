import { BlockConfiguration, registerBlockType } from "@wordpress/blocks";

import "./style.scss";
import "./editor.scss";

import Edit from "./edit";
import metadata from "./block.json";
import { Attributes } from "./type";
import Save from "./save";

registerBlockType<Attributes>(
  metadata as unknown as BlockConfiguration<Attributes>,
  {
    edit: Edit,
    save: Save,
  },
);
