export interface Bindings {
  NOTION_API_KEY: string;
  CLARO_API_KEY: string;
}

export interface Variables {}

export interface HonoEnv {
  Bindings: Bindings;
  Variables: Variables;
}