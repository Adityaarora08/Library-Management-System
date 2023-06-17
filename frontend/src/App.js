import React, { Suspense } from "react"
import { BrowserRouter as Router } from "react-router-dom"
import { Container } from "@mui/material"
import { NotificationContainer } from "react-notifications"
import { AppLayout } from "./components/layout/app-layout"
import { UserProvider } from "./context/user-context"
import { ThemeProvider } from "styled-components";
import books from "./components/bookz.png";

const theme = {
  primary: {
    main: "#29b6f6",
    light: "#dcf3fa",
    dark: "#0086c3",
    TextColor: "#000",
    danger: "#e91e63",
    dangerDark: "#8c0101",
  },
  secondary: {
    main: "#9e9e9e",
    light: "#cfcfcf",
    dark: "#707070",
    TextColor: "#fff",
  },
};
export const App = () => (
  <ThemeProvider theme={theme} >
  <UserProvider >
    <Suspense fallback={null} >
      <div style = {{
      backgroundImage:
      `url(${books})`,
      backgroundRepeat: 'repeat-y',
      backgroundPosition: 'center',
      backgroundSize: 'cover',
      width:'100vw',
      height:'100vh',
      position:'absolute'
   }}>
      <Container className="page-container" >
        <Router>
          <AppLayout />
          <NotificationContainer />
        </Router>
      </Container>
      </div>
    </Suspense>
  </UserProvider>
  </ThemeProvider>
)
