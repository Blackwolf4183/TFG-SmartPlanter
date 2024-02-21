import { extendTheme } from "@chakra-ui/react";

const config = {
    initialColorMode: 'light',
    useSystemColorMode: false
}

const styles = {
    global: props => ({
      body: {
        bg: '#E8F1EE'
      }
    })
  }

const colors = {
    fontColor:"#57685F",
    lightGreenBg: "#E8F1EE",
    card:"#FEFEFE",
    darkBg:"#183136",
    loginBg:"#A4C4B5",
    error: "#DA7676",
    advice: "#78DA76"

};

const fonts = {
  heading:'Fredoka',
  body:'Fredoka'
};

const customTheme = extendTheme({ styles,config,colors });

export default customTheme;