export type WpPattern = {
  id: number;
  title: { raw: string; rendered: string };
  content: { raw: string; rendered: string };
  status: string;
};

export type WooProduct = {
  id: number;
  name: string;
  images?: Array<{ src?: string }>;
};
