import {
  Center,
  VStack,
  InputGroup,
  Input,
  Button,
  InputRightElement,
  Box,
  FormControl,
  FormErrorMessage,
  Text,
} from '@chakra-ui/react';
import React, { useState } from 'react';
import { Field, Form, Formik } from 'formik';
import axios, { AxiosError } from 'axios';
import { FaUser } from 'react-icons/fa';
import { useSignIn } from 'react-auth-kit';
import qs from 'qs';
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [show, setShow] = useState(false);
  const handleShowClick = () => setShow(!show);

  const [error, setError] = useState('');
  const signIn = useSignIn();

  const navigate = useNavigate();
  return (
    <Center h="100vh">
      <VStack width={'300px'} bgColor={'white'} borderRadius={'15px'} p={10}>
        <Box
          w="80px"
          h="80px"
          bgColor={'customPink'}
          borderRadius={'100%'}
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <FaUser style={{ color: 'white', width: '30px', height: '30px' }} />
        </Box>

        <Formik
          initialValues={{ username: '', password: '' }}
          onSubmit={(values, actions) => {
            setError('');

            axios
              .post(
                'http://localhost:8000/auth/token',
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
                if (err && err instanceof AxiosError)
                  setError(err.response?.data.message);
                else if (err && err instanceof Error) setError(err.message);

                console.log('Error: ', err);
              });

            actions.setSubmitting(false);
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
                    />
                    <FormErrorMessage>{form.errors.username}</FormErrorMessage>
                  </FormControl>
                )}
              </Field>

              <Field name="password">
                {({ field, form }) => (
                  <FormControl
                    isInvalid={form.errors.password && form.touched.password}
                  >
                    <InputGroup size="lg">
                      <Input
                        {...field}
                        pr="4.5rem"
                        type={show ? 'text' : 'password'}
                        placeholder="Password"
                      />
                      <InputRightElement width="4.5rem">
                        <Button
                          h="1.75rem"
                          size="sm"
                          onClick={() => {
                            handleShowClick();
                            field.onChange(field.name, ''); // Add this line to ensure password value is captured
                          }}
                        >
                          {show ? 'Hide' : 'Show'}
                        </Button>
                      </InputRightElement>
                    </InputGroup>
                    <FormErrorMessage>{form.errors.password}</FormErrorMessage>
                  </FormControl>
                )}
              </Field>

              <Text mt="5" color="red.400">
                {error}
              </Text>

              <Button
                mt="5"
                bgColor="customPink"
                color="white"
                type="submit"
                isLoading={props.isSubmitting}
              >
                Login
              </Button>
            </Form>
          )}
        </Formik>
      </VStack>
    </Center>
  );
};

export default Login;
