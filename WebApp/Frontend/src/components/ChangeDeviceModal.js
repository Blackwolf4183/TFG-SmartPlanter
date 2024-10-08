import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  Image,
  ModalBody,
  Button,
  Input,
  VStack,
  HStack,
  ModalCloseButton,
  useToast,
} from '@chakra-ui/react';
import { useState } from 'react';
import axios, { AxiosError } from 'axios';
import Cookies from 'js-cookie';

const ChangeDeviceModal = ({ isOpen, onClose }) => {
  const requestResultToast = useToast();

  const [clientId, setClientId] = useState('');
  const [password, setPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  const handleChangeClientId = e => {
    setClientId(e.target.value);
  };

  const handleChangePassword = e => {
    setPassword(e.target.value);
  };

  const handleSubmitDeviceCredentials = async () => {
    try {
      setIsLoading(true);
      // Get the JWT from the '_auth' cookie
      const jwt = Cookies.get('_auth');

      // Set up the Axios headers with the JWT as a bearer token
      const headers = {
        Authorization: `Bearer ${jwt}`,
      };

      const response = await axios.patch(
        process.env.REACT_APP_BACKEND_URL + 'devices/',
        {
          client_id: clientId,
          device_password: password,
        },
        { headers }
      );

      if (response.status === 200 || response.status === 201) {
        // Set the updated cookie for device Id
        Cookies.set('deviceId', response.data?.deviceId);

        // Refresh the page
        window.location.reload();
      }
    } catch (err) {
      console.error('Error occurred:', err);
      if (err && err instanceof AxiosError) {
        if (err.response?.data?.message)
          requestResultToast({
            title: err.response.data.message,
            status: 'error',
            isClosable: true,
          });
        else {
          requestResultToast({
            title: err.message,
            status: 'error',
            isClosable: true,
          });
        }
      } else if (err && err instanceof Error) {
        requestResultToast({
          title: err.message,
          status: 'error',
          isClosable: true,
        });
      }
    }

    setIsLoading(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} closeOnOverlayClick={false}>
      <ModalOverlay />
      <ModalContent p="5" bgColor={'white'} color="fontColor">
        <ModalHeader>Cambia tu dispositivo</ModalHeader>
        <ModalCloseButton />
        <ModalBody color="fontColor">
          <HStack spacing="10">
            <VStack mb="10" align={'left'}>
              <Input
                placeholder="Client ID"
                mt="10"
                size="lg"
                w="200px"
                variant={'flushed'}
                borderColor={'fontColor'}
                autoComplete="off"
                _placeholder={{ color: 'rgba(87,104,95,0.47)' }}
                onChange={handleChangeClientId}
              />

              <Input
                placeholder="Contraseña"
                size="lg"
                w="200px"
                variant={'flushed'}
                type="password"
                borderColor={'fontColor'}
                autoComplete="off"
                _placeholder={{ color: 'rgba(87,104,95,0.47)' }}
                onChange={handleChangePassword}
              />

              <Button
                isLoading={isLoading}
                w="100px"
                colorScheme="green"
                mt="5"
                onClick={handleSubmitDeviceCredentials}
              >
                Acceder
              </Button>
            </VStack>

            <Image mb="5" src="./HappyPlant2.png" />
          </HStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ChangeDeviceModal;
