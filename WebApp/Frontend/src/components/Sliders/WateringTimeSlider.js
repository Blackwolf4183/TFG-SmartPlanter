import React,{useState} from 'react';
import {
    Slider,
    SliderTrack,
    SliderFilledTrack,
    SliderThumb,
    SliderMark,
    Tooltip
  } from '@chakra-ui/react'

const WateringTimeSlider = ({disabled, everyHours=6, updateEveryHours}) => {
  const [showTooltip, setShowTooltip] = useState(false);  

  return (
    <Slider
      ml={"5"}
      w="80%"
      id="slider"
      value={everyHours || 5}
      defaultValue={everyHours}
      min={1}
      max={12}
      colorScheme="purple"
      isDisabled={disabled}
      onChange={v => updateEveryHours(v)}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      
      <SliderMark value={4} mt="1" ml="-2.5" fontSize="sm">
        3h
      </SliderMark>
      <SliderMark value={7} mt="1" ml="-2.5" fontSize="sm">
        6h
      </SliderMark>
      <SliderMark value={10} mt="1" ml="-2.5" fontSize="sm">
        9h
      </SliderMark>
   
      <SliderTrack bgColor={"rgba(219,219,219,59)"}>
        <SliderFilledTrack/>
      </SliderTrack>
      <Tooltip
        hasArrow
        bg="purple.300"
        color="white"
        placement="top"
        isOpen={showTooltip}
        label={`${everyHours}h`}
      >
        <SliderThumb />
      </Tooltip>
    </Slider>
  );
};

export default WateringTimeSlider;
