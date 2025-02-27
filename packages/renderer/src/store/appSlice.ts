import { createSlice } from "@reduxjs/toolkit";
import { RootState } from ".";

const initialState: AppStore = {
  local: "",
  promptTone: true,
  proxy: "",
  useProxy: false,
  deleteSegments: true,
  openInNewWindow: false,
};

export const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setAppStore(state, { payload }: { payload: Partial<AppStore> }) {
      Object.keys(payload).forEach((key) => {
        if (payload[key] != null) {
          state[key] = payload[key] as never;
        }
      });
    },
  },
});

export const { setAppStore } = appSlice.actions;
export const selectStore = (state: RootState) => state.app;
export default appSlice.reducer;
