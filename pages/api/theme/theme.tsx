import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: true,
};

const theme = extendTheme({
  config,
  colors: {
    brand: {
      50: '#f5f3ff',
      100: '#ede9fe',
      500: '#6b46c1',
      900: '#21135c',
    },
    // Custom colors for hospital theme
    hospitalPrimary: {
      50: '#e6f2ff',
      100: '#b3e0ff',
      500: '#0077be',
      900: '#003366',
    },
    hospitalSecondary: {
      50: '#e6f7f0',
      100: '#b3ebd1',
      500: '#2ecc71',
      900: '#1a8041',
    }
  },
  fonts: {
    heading: 'Inter, sans-serif',
    body: 'Inter, sans-serif',
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'bold',
        borderRadius: 'md',
      },
      variants: {
        solid: {
          bg: 'hospitalPrimary.500',
          color: 'white',
          _hover: {
            bg: 'hospitalPrimary.600',
          }
        },
        outline: {
          borderColor: 'hospitalPrimary.500',
          color: 'hospitalPrimary.500',
          _hover: {
            bg: 'hospitalPrimary.50',
          }
        }
      }
    },
    Input: {
      defaultProps: {
        focusBorderColor: 'hospitalPrimary.500',
      }
    }
  },
  styles: {
    global: {
      body: {
        bg: 'gray.50',
        color: 'gray.800',
      }
    }
  }
});

export default theme;