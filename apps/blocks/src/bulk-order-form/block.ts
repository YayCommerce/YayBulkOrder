import { BlockConfiguration, registerBlockType } from "@wordpress/blocks";

import "./style.scss";
import "./block.scss";

import Edit from "./edit";
import metadata from "./block.json";
import { Attributes } from "./type";

registerBlockType<Attributes>(
  metadata as unknown as BlockConfiguration<Attributes>,
  {
    edit: Edit,
  },
);
