// theme/index.ts
import { extendTheme } from '@chakra-ui/react';
import { useEffect, useCallback, useContext } from 'react';

const theme = extendTheme({
  // Customize your Chakra UI theme here
  // For example:
  fonts: {
    heading: 'Inter',
    body: 'Inter',
  },
  colors: {
    primary: {
      500: '#ff7e5f',
    },
    // Add more customizations as needed
  },
});

export default theme;
