import React,{useState,useEffect} from 'react';
import { Grid, GridItem, Text, VStack, Tooltip, Icon, Circle, HStack, Spacer,useToast, Spinner } from '@chakra-ui/react';
import { RiPlantLine } from "react-icons/ri";
import { BsExclamation } from "react-icons/bs";
import { BiDroplet } from "react-icons/bi";
import { BiTestTube } from "react-icons/bi";
import { BiBandAid } from "react-icons/bi";
import useAxios from '../../functions/axiosHook';
import Cookies from 'js-cookie';
import axios from 'axios';

const states = [
  { name: 'Saludable', description: 'La planta aparece vibrante y vigorosa sin signos de estrés o enfermedad.', icon: RiPlantLine, color: 'green.100' },
  { name: 'Estresada', description: 'La planta muestra signos de estrés, que podrían incluir caída, decoloración leve o crecimiento detenido.', icon: BsExclamation, color: 'yellow.100' },
  { name: 'Deshidratada', description: 'La planta parece marchita o tiene bordes secos y crujientes en las hojas, lo que indica una falta de agua.', icon: BiDroplet, color: 'blue.100' },
  { name: 'Exceso de riego', description: 'La planta podría tener hojas amarillentas, manchas blandas en descomposición o un aspecto generalmente empapado.', icon: BiDroplet, color: 'orange.100' },
  { name: 'Deficiencia nutrientes', description: 'Los indicadores podrían incluir clorosis (hojas amarillentas) u otras decoloraciones, a menudo comenzando con las hojas más viejas.', icon: BiTestTube, color: 'purple.100' },
  { name: 'Enferma', description: 'La planta muestra signos de enfermedad, como manchas en las hojas, mildiú polvoriento o crecimientos inusuales.', icon: BiBandAid, color: 'red.100' },
];

const FeedBackBento = ({colSpan,rowSpan}) => {

  const [url, setUrl] = useState('');
  const [responseState, setResponseState] = useState(0)
  const [hasVoted, setHasVoted] = useState(true)
  const [componentLoading, setComponentLoading] = useState(true)
  const [deviceId, setDeviceId] = useState(null)

  const { data, loading, error } = useAxios(url);
  
  const requestResultToast = useToast();

  //Useffect for errors on request
  useEffect(() => {
    if(error && deviceId){
      requestResultToast({
        title: 'Algo ha fallado intentando obtener el voto diario.',
        status: 'error',
        isClosable: true,
      })
    }
  }, [error,deviceId,requestResultToast])

  //Useffect to get cookies and make enpoint calls
  useEffect(() => {
    setTimeout(() => {
      //Get deviceId from cookies and make request by setting url with device_id param
      const deviceId = Cookies.get('deviceId');

      setDeviceId(deviceId)

      if (deviceId === undefined || deviceId === null || deviceId === 'null') return

      setUrl(process.env.REACT_APP_BACKEND_URL + 'ml/vote?device_id=' +  deviceId);
    },250)
  }, []);

  useEffect(() => {

    if(!loading && data !== null && data.hasVotedToday != null){

      setHasVoted(data.hasVotedToday)
      setResponseState(data.vote)
      setComponentLoading(false)
    } 
  }, [data, loading])


  const [selectedVote, setSelectedVote] = useState(-1)
  const [isCardLoading, setIsCardLoading] = useState(false)

  const submitVote = async (state_id) => {
    try {
      setIsCardLoading(true);
      setSelectedVote(state_id);
      // Get the JWT from the '_auth' cookie
      const jwt = Cookies.get('_auth');

      // Set up the Axios headers with the JWT as a bearer token
      const headers = {
        Authorization: `Bearer ${jwt}`,
      };

      const response = await axios.post(
        process.env.REACT_APP_BACKEND_URL + `ml/vote?device_id=${deviceId}&plant_state=${state_id}`, 
        {},
        { headers }
      );

      if (response.status === 200 || response.status === 201) {

        //Show successful change
        requestResultToast({
          title: "Se ha registrado tu voto correctamente",
          status: 'success',
          isClosable: true,
        });

        setHasVoted(true);
        setResponseState(state_id);
      }
    } catch (err) {
      requestResultToast({
        title: "Ha ocurrido un error intentando registrar tu voto",
        status: 'error',
        isClosable: true,
      });
    }

    setIsCardLoading(false);
  }

  return (
    <GridItem
      colSpan={colSpan}
      rowSpan={rowSpan}
      bg="card"
      borderRadius={'10'}
      p="30px"
    >
      <HStack>
        <Text fontSize="xl" mb="2">Seguimiento de tu planta </Text>
        <Spacer/>
        <Text mb="2" color="blackAlpha.600">{hasVoted ? "Ya has votado hoy" : "Aun no has votado hoy"}</Text>
      </HStack>

    <Grid templateColumns="repeat(3, 1fr)" gap={2}>
      {states.map((state, index) => (
        <GridItem w="100%" key={index}>
          <Tooltip hasArrow label={state.description} placement="top" bg='white' borderRadius="xl" color="black" p="3">
            <VStack
              p={5}
              bg="white"
              borderRadius="lg"
              boxShadow="lg" // keeps the box shadow as is
              _hover={hasVoted ? {} : { boxShadow: "xl", bgColor: "gray.100" }} // conditionally apply hover effects
              cursor={hasVoted ? "default" : "pointer"} // conditionally change the cursor
              alignItems="center"
              justifyContent="center"
              height="150px"
              w="130px"
              position="relative" // allows absolute positioning inside
              textAlign={"center"}
              opacity={hasVoted ? 0.5 : 1} // conditionally changes opacity to indicate it's disabled
              pointerEvents={hasVoted ? "none" : "auto"} // conditionally prevents all pointer events
              border={responseState==index && "2px solid green"}
              onClick={() => submitVote(index)}
            >
              <Circle size="64px" bg={state.color} position="absolute" top="40%" left="50%" transform="translate(-50%, -50%)">
                {(componentLoading || (selectedVote == index && isCardLoading)) ? <Spinner/> : <Icon as={state.icon} w={8} h={8} />}
              </Circle>
              <Text fontSize="md" mt="20" userSelect={"none"}>{state.name}</Text>
            </VStack>
          </Tooltip>
        </GridItem>
      ))}
    </Grid>
    </GridItem>
  );
};

export default FeedBackBento;
