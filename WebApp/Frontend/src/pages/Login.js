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
} from '@chakra-ui/react';
import React, { useState } from 'react';
import { Field, Form, Formik } from 'formik';
import axios, { AxiosError } from 'axios';
import { useSignIn } from 'react-auth-kit';
import qs from 'qs';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const signIn = useSignIn();

  const navigate = useNavigate();
  return (
    <Center h="100vh">
      <HStack maxW={'850px'} bgColor={'white'} h="500px">
        <VStack
          bgColor="loginBg"
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
            Monitoriza y riega tu planta desde la comodidad de tu móvil
          </Text>
        </VStack>

        <VStack color="fontColor" w="400px">
          <Text fontSize={'2xl'} fontWeight={'bold'} userSelect={'none'}>
            SmartPlanter
          </Text>
          <Text fontWeight={'light'} userSelect={'none'}>
            Inicia sesión
          </Text>

          <Formik
            initialValues={{ username: '', password: '' }}
            onSubmit={(values, actions) => {
              setError('');
              setLoading(true);

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
                  signIn({
                    token: res.data.access_token,
                    expiresIn: 120,
                    tokenType: 'Bearer',
                    authState: { username: values.username },
                  });

                  //redirect to main page
                  navigate('/', { replace: true });
                })
                .catch(err => {
                  if (err && err.response && err.response.status === 422) {
                    setError('Invalid username or password.'); // Provide a user-friendly error message for status code 422
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
                        placeholder="Username"
                        mt="5"
                        mb="2"
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

                <Field name="password">
                  {({ field, form }) => (
                    <FormControl
                      isInvalid={form.errors.password && form.touched.password}
                    >
                      <Input
                        {...field}
                        pr="4.5rem"
                        type={'password'}
                        placeholder="Password"
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
        </VStack>
      </HStack>
    </Center>
  );
};

export default Login;
