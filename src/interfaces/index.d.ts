export {};

declare global {
  interface Window {
    luckysheet: any;
    [key: string]: any;
  }
}
