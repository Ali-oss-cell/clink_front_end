/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PLAUSIBLE_DOMAIN?: string;
  readonly VITE_HOTJAR_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
