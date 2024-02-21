import React from 'react';
import { useEffect, useState } from 'react';
import { HStack, VStack, Spacer, Button, Heading, Text } from '@chakra-ui/react';
import { FiCalendar } from 'react-icons/fi';
import { HiLogout } from 'react-icons/hi';
import { BiBell } from 'react-icons/bi';

const Header = () => {
  const daysOfWeek = [
    'Lunes',
    'Martes',
    'Miercoles',
    'Jueves',
    'Viernes',
    'Sábado',
    'Domingo',
  ];
  const months = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];

  const [dateString, setDateString] = useState('Lunes 1 Enero 1999');

  useEffect(() => {
    const date = new Date();
    const dayNumber = date.getDay();
    const monthNumber = date.getMonth();
    const dayOfMonth = date.getDate()

    const dayName = daysOfWeek[dayNumber];
    const monthName = months[monthNumber];
    const year = date.getFullYear();

    setDateString(dayName + " " + dayOfMonth + " " + monthName + " " + year);
  }, []);
  return (
    <HStack w="100%" maxW={'750px'}>
      <HStack mt="5">
        <VStack align="left" spacing="1">
          <Heading fontSize={'2xl'}> ¡Bienvenido de vuelta!</Heading>
          <HStack ml="1">
            <FiCalendar style={{ width: '20px', height: '20px' }} />
            {/* TODO: make dynamic */}
            <Text fontWeight={'light'}>{dateString}</Text>
          </HStack>
        </VStack>
      </HStack>

      <Spacer />

      <HStack>
        {/* Notifications button */}
        <Button w="40px" h="40px" p="0" bgColor={'white'} colorScheme="gray">
          <BiBell style={{ width: '20px', height: '20px', color: 'black' }} />
        </Button>

        {/* Logout button */}
        <Button w="40px" h="40px" p="0" bgColor={'white'} colorScheme="gray">
          <HiLogout style={{ width: '20px', height: '20px', color: 'black' }} />
        </Button>
      </HStack>
    </HStack>
  );
};

export default Header;
