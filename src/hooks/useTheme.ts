import { useContext } from 'react';
import { ThemeContext } from '../context/themeContextDef';

export const useTheme = () => useContext(ThemeContext);
