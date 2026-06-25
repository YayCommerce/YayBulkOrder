export interface BulkOrderFormAttributes {
  queryId: number;
  forcePageReload: boolean;
}

export type QueryContext = {
  page: number;
  filter: 'all' | 'in-stock' | 'on-sale';
};
