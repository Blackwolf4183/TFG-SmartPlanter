import React, { useState } from 'react';
import { HStack, Box, Image, VStack, Text, Spinner } from '@chakra-ui/react';

const PlantCard = ({ plant, selectPlant, plantId }) => {
  const [isLoading, setIsLoading] = useState(true);

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  return (
    <HStack
      borderRadius="lg"
      borderColor={plantId === plant.plantId ? "green.400" : "gray.200"} // Change border color based on condition
      borderWidth={plantId === plant.plantId ? "3px" : "1px"}
      p="4"
      w="300px"
      boxShadow="md"
      alignItems="center"
      mb="4"
      spacing={'5'}
      bgColor={'white'}
      _hover={{
        transform: 'translateY(-4px)',
        transition: 'transform 0.3s ease, border-color 0.3s ease', // Add transition effect for border color
        boxShadow: 'lg',
      }}
      cursor={"pointer"}
      onClick={() => {selectPlant(plant.plantId)}}
    >
      <Box borderRadius="full" overflow="hidden" w="70px" h="70px" >
        {isLoading && <Spinner size="md" mt="10px" ml="10px"/>}
        <Image
          src={plant.imageUrl}
          alt={plant.commonName}
          w="70px" // Fixed width
          h="70px" // Fixed height
          objectFit="cover" // Ensure the entire image is visible
          onLoad={handleImageLoad}
          display={isLoading ? 'none' : 'block'}
        />
      </Box>
      <VStack spacing="1" align={'left'}>
        <Text fontWeight="bold">{plant.commonName}</Text>
        <Text>{plant.scientificName}</Text>
      </VStack>
    </HStack>
  );
};

export default PlantCard;
