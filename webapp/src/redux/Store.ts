import {configureStore} from "@reduxjs/toolkit";
import {uiSlice} from "@src/redux/ui/UiSlice";

/** UI, lobby, library, credits and meta state. The running simulation is not here: it is read in `useFrame`. */
export const store = configureStore({
  reducer: {
    ui: uiSlice.reducer,
  },
});
