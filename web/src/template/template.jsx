import React from 'react';
import { createMuiTheme } from '@material-ui/core/styles';
import { ThemeProvider } from '@material-ui/styles';
import Sidebar from './sidebar';
import Main from './main';
import SnackMessage from '../components/snackMessage';
import CssBaseline from '@material-ui/core/CssBaseline';

const theme = createMuiTheme({
  typography: {
    fontFamily: ['Montserrat']
  },
  palette: {
    primary: {
      main: '#131313'
    },
    secondary: {
      main: '#f9d525'
    }
  }
});

export default function Template(props) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackMessage />
      <Sidebar />
      <Main open={open} {...props}>
        {props.children}
      </Main>
    </ThemeProvider>
  );
}
