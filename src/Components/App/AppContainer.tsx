import React from "react";
import { graphql } from "react-apollo";
import { IS_LOGGED_IN } from "./AppQueries";
import AppPresenter from "./AppPresenter";
import { ThemeProvider } from "styled-components";
import { theme } from "../../styles/theme";
import GlobalStyle from "../../styles/global-styles";
import "react-toastify/dist/ReactToastify.min.css";
import StyledToastContainer from "../StyledToastContainer";

const AppContainer = ({ data }) => (
  <>
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <AppPresenter isLoggedIn={data.auth.isLoggedIn} />
    </ThemeProvider>
    <StyledToastContainer draggable={true} position={"bottom-center"} />
  </>
);

export default graphql(IS_LOGGED_IN)(AppContainer);
