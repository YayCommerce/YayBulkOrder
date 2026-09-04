import { BlockConfiguration, registerBlockType } from '@wordpress/blocks';
import { columns } from '@wordpress/icons';

import metadata from './block.json';
import Edit from './edit';
import Save from './save';

registerBlockType(metadata as unknown as BlockConfiguration, {
  icon: columns,
  edit: Edit,
  save: Save,
});

// A `blockEditor.__unstableCanInsertBlockType` filter that hides an
// already-present column type from the inserter was tried here and reverted:
// that hook has no way to tell "inserting a new block of this type" apart
// from "validating a block already at this position while it's being
// dragged" — List View's own drag-and-drop (use-list-view-drop-zone.js)
// calls the very same selector to decide whether a drop target is valid, so
// the filter ended up marking every position in this list as invalid and
// disabled reordering entirely. Not solvable at this level — duplicate
// columns are simply left possible, same as core's own default behavior.
