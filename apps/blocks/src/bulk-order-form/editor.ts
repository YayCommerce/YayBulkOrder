import { BlockConfiguration, registerBlockType } from '@wordpress/blocks';

import metadata from './block.json';
import Edit from './edit';
import Save from './save';
import { Attributes } from './type';

import './style.scss';
import './editor.scss';

registerBlockType<Attributes>(metadata as unknown as BlockConfiguration<Attributes>, {
  edit: Edit,
  save: Save,
});
