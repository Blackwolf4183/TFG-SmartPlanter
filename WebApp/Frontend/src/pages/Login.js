import {
  Center,
  Input,
  Button,
  FormControl,
  FormErrorMessage,
  Text,
  HStack,
  VStack,
  Image,
  Box,
} from '@chakra-ui/react';
import React, { useState } from 'react';
import { Field, Form, Formik } from 'formik';
import axios, { AxiosError } from 'axios';
import { useSignIn } from 'react-auth-kit';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import qs from 'qs';

const Login = () => {
  const [isLoginPage, setIsLoginPage] = useState(true);

  const handleRegisterClick = () => {
    setIsLoginPage(!isLoginPage);
  };

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const signIn = useSignIn();

  const navigate = useNavigate();
  return (
    <Center h="100vh">
      <HStack maxW={'850px'} bgColor={'white'} h="500px">
        <VStack
          bgColor="loginBg"
          color="white"
          h="100%"
          w="60%"
          justify={'center'}
          userSelect={'none'}
        >
          <Image src="./HappyPlant.png" />

          <Text
            textAlign={'center'}
            fontSize={'xl'}
            fontWeight={'bold'}
            maxW="300px"
          >
            Gestión inteligente de tu planta de forma online
          </Text>
          <Text textAlign={'center'} fontWeight={'light'} maxW="300px">
            Monitoriza y riega tu planta desde la comodidad de tu ordenador
          </Text>
        </VStack>

        <VStack color="fontColor" w="400px">
          <Text fontSize={'2xl'} fontWeight={'bold'} userSelect={'none'}>
            SmartPlanter
          </Text>
          <Text fontWeight={'light'} userSelect={'none'}>
            {isLoginPage ? 'Inicia sesión' : 'Crea tu cuenta'}
          </Text>

          <Formik
            initialValues={{
              username: '',
              password: '',
              email: '',
              repeatPassword: '',
            }}
            onSubmit={(values) => {
              setError('');
              setLoading(true);

              if (isLoginPage) {
                //Login flow
                axios
                  .post(
                    process.env.REACT_APP_BACKEND_URL + 'auth/token',
                    qs.stringify({
                      username: values.username,
                      password: values.password,
                    }),
                    {
                      headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                      },
                    }
                  )
                  .then(res => {
                    //AUTH

                    // Decode the JWT token to access its payload
                    const decodedToken = jwtDecode(res.data.access_token);
                    const { sub, deviceID } = decodedToken;

                    signIn({
                      token: res.data.access_token,
                      expiresIn: 120,
                      tokenType: 'Bearer',
                      authState: {
                        username: sub,
                        deviceId: deviceID,
                      },
                    });

                    //redirect to main page
                    navigate('/', { replace: true });
                  })
                  .catch(err => {
                    if (err && err.response && err.response.status === 422) {
                      setError('Contraseña o usuario no válidos.'); // Provide a user-friendly error message for status code 422
                    } else {
                      if (err && err instanceof AxiosError) {
                        if (err.response?.data?.detail)
                          setError(err.response.data.detail);
                        else setError(err.message);
                      } else if (err && err instanceof Error)
                        setError(err.message);
                    }

                    console.log('Error: ', err);
                  })
                  .finally(() => {
                    setLoading(false);
                  });
              } else {
                //Register flow

                if (values.password !== values.repeatPassword) {
                  setError('Las contraseñas deben coincidir');
                  setLoading(false);
                } else {
                  axios
                    .post(
                      process.env.REACT_APP_BACKEND_URL + 'auth/register',
                      qs.stringify({
                        username: values.username,
                        password: values.password,
                        email: values.email,
                      }),
                      {
                        headers: {
                          'Content-Type': 'application/x-www-form-urlencoded',
                        },
                      }
                    )
                    .then(res => {
                      //AUTH
                      setIsLoginPage(true)
                    })
                    .catch(err => {
                      if (err && err.response && err.response.status === 422) {
                        setError('Algo ha ido mal, revisa los campos');
                      } else {
                        if (err && err instanceof AxiosError) {
                          if (err.response?.data?.detail)
                            setError(err.response.data.detail);
                          else setError(err.message);
                        } else if (err && err instanceof Error)
                          setError(err.message);
                      }

                      console.log('Error: ', err);
                    })
                    .finally(() => {
                      setLoading(false);
                    });
                }
              }
            }}
          >
            {props => (
              <Form>
                <Field name="username">
                  {({ field, form }) => (
                    <FormControl
                      isInvalid={form.errors.username && form.touched.username}
                    >
                      <Input
                        {...field}
                        placeholder="Usuario"
                        mt="5"
                        mb={isLoginPage && '2'}
                        size="lg"
                        variant={'flushed'}
                        borderColor={'blackAlpha.300'}
                        _placeholder={{ color: 'rgba(87,104,95,0.47)' }}
                        autoComplete="off"
                      />
                      <FormErrorMessage>
                        {form.errors.username}
                      </FormErrorMessage>
                    </FormControl>
                  )}
                </Field>

                {!isLoginPage && (
                  <Field name="email">
                    {({ field, form }) => (
                      <FormControl
                        isInvalid={form.errors.email && form.touched.email}
                      >
                        <Input
                          {...field}
                          placeholder="Email"
                          mb="2"
                          size="lg"
                          variant={'flushed'}
                          borderColor={'blackAlpha.300'}
                          _placeholder={{ color: 'rgba(87,104,95,0.47)' }}
                          autoComplete="off"
                        />
                        <FormErrorMessage>{form.errors.email}</FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>
                )}

                <Field name="password">
                  {({ field, form }) => (
                    <FormControl
                      isInvalid={form.errors.password && form.touched.password}
                    >
                      <Input
                        {...field}
                        pr="4.5rem"
                        type={'password'}
                        mb="2"
                        placeholder="Contraseña"
                        variant={'flushed'}
                        borderColor={'blackAlpha.300'}
                        _placeholder={{ color: 'rgba(87,104,95,0.47)' }}
                      />

                      <FormErrorMessage>
                        {form.errors.password}
                      </FormErrorMessage>
                    </FormControl>
                  )}
                </Field>

                {!isLoginPage && (
                  <Field name="repeatPassword">
                    {({ field, form }) => (
                      <FormControl
                        isInvalid={
                          form.errors.repeatPassword &&
                          form.touched.repeatPassword
                        }
                      >
                        <Input
                          {...field}
                          pr="4.5rem"
                          type={'password'}
                          placeholder="Repite Contraseña"
                          variant={'flushed'}
                          borderColor={'blackAlpha.300'}
                          _placeholder={{ color: 'rgba(87,104,95,0.47)' }}
                        />

                        <FormErrorMessage>
                          {form.errors.repeatPasswords}
                        </FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>
                )}

                <Text mt="5" color="red.400">
                  {error ? error : null}
                </Text>

                <Button
                  mt="5"
                  colorScheme="green"
                  type="submit"
                  isLoading={loading}
                >
                  Entrar
                </Button>
              </Form>
            )}
          </Formik>
          <HStack w="80%" mt="5">
            <Box h="1px" bgColor="lightFontColor" w="100%" />
            <Text fontWeight={'light'} fontSize={'sm'}>
              o
            </Text>
            <Box h="1px" bgColor="lightFontColor" w="100%" />
          </HStack>

          <Text
            fontWeight={'light'}
            fontSize={'sm'}
            onClick={handleRegisterClick}
            cursor="pointer"
          >
            Registrate
          </Text>
        </VStack>
      </HStack>
    </Center>
  );
};

export default Login;
