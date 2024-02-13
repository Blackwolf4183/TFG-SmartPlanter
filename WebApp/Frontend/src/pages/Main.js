import { HStack, VStack, Heading, Text, Spacer, Button, Center } from '@chakra-ui/react';
import { IoIosLogOut,IoIosCalendar } from 'react-icons/io';
import { BiBell } from "react-icons/bi";

const Main = () => {
  return (
    <Center>
      
    <VStack w="100%">
      

      <HStack w="100%" maxW={'750px'}>
        <HStack mt="5">
          <VStack align="left">
            <Heading fontSize={'2xl'}> ¡Bienvenido de vuelta!</Heading>
            <HStack ml="1">
              <IoIosCalendar style={{ width: '20px', height: '20px' }}/>
            {/* TODO: make dynamic */}  
              <Text fontWeight={'light'}>Lunes 3 Enero 2024</Text>
            </HStack>
          </VStack>
        </HStack>

        <Spacer />

        <HStack>
          <Button w="40px" h="40px" p="0">
            <IoIosLogOut style={{ width: '20px', height: '20px' }} />
          </Button>

          <Button w="40px" h="40px" p="0">
            <BiBell style={{ width: '20px', height: '20px' }} />
          </Button>
        </HStack>
      </HStack>
      
      <Heading>Freaking genious</Heading>
      </VStack>
    </Center>
  );
};

export default Main;
