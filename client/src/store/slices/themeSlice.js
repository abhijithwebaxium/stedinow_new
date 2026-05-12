import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  colorScheme: 'default', // 'default' or 'neutral'
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setColorScheme: (state, action) => {
      state.colorScheme = action.payload;
      localStorage.setItem('colorScheme', action.payload);
    },
    loadColorSchemeFromStorage: (state) => {
      const storedColorScheme = localStorage.getItem('colorScheme');
      if (storedColorScheme) {
        state.colorScheme = storedColorScheme;
      }
    },
  },
});

export const { setColorScheme, loadColorSchemeFromStorage } = themeSlice.actions;

export const selectColorScheme = (state) => state.theme.colorScheme;

export default themeSlice.reducer;
