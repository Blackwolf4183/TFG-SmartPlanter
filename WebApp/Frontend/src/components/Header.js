import React from 'react';
import { useEffect, useState } from 'react';
import {
  HStack,
  VStack,
  Spacer,
  Button,
  Heading,
  Text,
} from '@chakra-ui/react';
import { FiCalendar } from 'react-icons/fi';
import { HiLogout } from 'react-icons/hi';
import { BiBell } from 'react-icons/bi';
import { useSignOut } from 'react-auth-kit';
import { useNavigate } from 'react-router-dom';

import Cookies from 'js-cookie';
import { getHeaderDate } from '../functions/utility';

const Header = () => {

  const [dateString, setDateString] = useState('Lunes 1 Enero 1999');
  const [headerUsername, setHeaderUsername] = useState("")

  useEffect(() => {
    setDateString(getHeaderDate());

    setTimeout(() => {
      const userAuthDataString = Cookies.get('_auth_state');
      const { username } = JSON.parse(userAuthDataString);
  
      setHeaderUsername(username)
    }, 250);

  }, []);

  const signOut = useSignOut();
  const navigate = useNavigate();

  const logout = () => {
    signOut();
    navigate('/auth');
  };

  return (
    <HStack w="100%" maxW={'850px'}>
      <HStack mt="5">
        <VStack align="left" spacing="1">
          <Heading fontSize={'3xl'}> ¡Bienvenido de vuelta {headerUsername}!</Heading>
          <HStack ml="1">
            <FiCalendar style={{ width: '20px', height: '20px' }} />
            <Text fontSize={"xl"} fontWeight={'light'}>{dateString}</Text>
          </HStack>
        </VStack>
      </HStack>

      <Spacer />

      <HStack>
        {/* Notifications button */}
        <Button w="50px" h="50px" p="0" bgColor={'white'} colorScheme="gray">
          <BiBell style={{ width: '25px', height: '25px', color: 'black' }} />
        </Button>

        {/* Logout button */}
        <Button
          w="50px"
          h="50px"
          p="0"
          bgColor={'white'}
          colorScheme="gray"
          onClick={logout}
        >
          <HiLogout style={{ width: '25px', height: '25px', color: 'black' }} />
        </Button>
      </HStack>
    </HStack>
  );
};

export default Header;
