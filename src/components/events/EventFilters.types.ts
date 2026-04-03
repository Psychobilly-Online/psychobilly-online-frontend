export interface Country {
  id: number;
  name: string;
  print_name?: string;
  iso?: string;
  iso3?: string;
  numcode?: number;
}

export interface Category {
  id: number;
  name: string;
}
