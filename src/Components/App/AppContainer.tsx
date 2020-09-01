import React from "react";
import { graphql } from "react-apollo";
import { IS_LOGGED_IN } from "./AppQueries";
import AppPresenter from "./AppPresenter";
import { ThemeProvider, createGlobalStyle } from "styled-components";
import reset from "styled-reset";
import { theme } from "../../styles/theme";

const GlobalStyle = createGlobalStyle`
  ${reset}
`;

const AppContainer = ({ data }) => (
  <ThemeProvider theme={theme}>
    <GlobalStyle />
    <AppPresenter isLoggedIn={data.auth.isLoggedIn} />
  </ThemeProvider>
);

export default graphql(IS_LOGGED_IN)(AppContainer);
