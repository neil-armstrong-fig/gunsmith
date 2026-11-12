import {createSlice} from "@reduxjs/toolkit";

interface UiState {
  stepJumperOpen: boolean;
}

const initialState: UiState = {stepJumperOpen: false};

/** Interface state that is not the running match: whether the dev step jumper (backtick menu) is open, and so on. */
export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleStepJumper(state) {
      state.stepJumperOpen = !state.stepJumperOpen;
    },
  },
});
