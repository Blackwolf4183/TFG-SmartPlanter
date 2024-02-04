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
    fontColor:"white",
    customPurple: "#555DA7",
    customCyan:"#00A0B6",
    customPink:"#E06A9F",
    customBlue:"#376AB2",

};

/* const fonts = {
  heading:'M PLUS Rounded 1c',
  body:'M PLUS Rounded 1c'
}; */

const customTheme = extendTheme({ styles,config,colors });

export default customTheme;