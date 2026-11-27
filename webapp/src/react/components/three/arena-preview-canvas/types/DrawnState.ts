/** What says a preview has been drawn: a screenshot once its picture is kept, a live one once its canvas is made and the pictures it draws have loaded. */
export interface DrawnState {
  isScreenshot: boolean;
  created: boolean;
  picturesReady: boolean;
  picture: string | undefined;
}
