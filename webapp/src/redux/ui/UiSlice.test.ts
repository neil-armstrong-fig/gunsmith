import {uiSlice} from "@src/redux/ui/UiSlice";

it("starts with the step jumper closed", () => {
  expect(uiSlice.reducer(undefined, {type: "unrelated"}).stepJumperOpen).toBe(false);
});

it("opens the step jumper, then closes it again", () => {
  const open = uiSlice.reducer(undefined, uiSlice.actions.toggleStepJumper());
  const closed = uiSlice.reducer(open, uiSlice.actions.toggleStepJumper());

  expect(open.stepJumperOpen).toBe(true);
  expect(closed.stepJumperOpen).toBe(false);
});
