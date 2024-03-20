import React,{useState, useEffect} from 'react';
import {
    Slider,
    SliderTrack,
    SliderFilledTrack,
    SliderThumb,
    SliderMark,
    Tooltip
  } from '@chakra-ui/react'

const WateringAmountSlider = ({ wateringAmount=80, updateIrrigationAmount}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <Slider
      ml={"5"}
      w="80%"
      id="slider"
      value={wateringAmount || 50}
      defaultValue={wateringAmount}
      min={0}
      max={200}
      colorScheme="blue"
      onChange={v => updateIrrigationAmount(v)}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <SliderMark value={50} mt="1" ml="-2.5" fontSize="sm">
       50ml
      </SliderMark>
      <SliderMark value={100} mt="1" ml="-2.5" fontSize="sm">
        100ml
      </SliderMark>
      <SliderMark value={150} mt="1" ml="-2.5" fontSize="sm">
        150ml
      </SliderMark>
      <SliderTrack bgColor={"rgba(219,219,219,59)"}>
        <SliderFilledTrack/>
      </SliderTrack>
      <Tooltip
        hasArrow
        bg="blue.300"
        color="white"
        placement="top"
        isOpen={showTooltip}
        label={`${wateringAmount}ml`}
      >
        <SliderThumb />
      </Tooltip>
    </Slider>
  );
};

export default WateringAmountSlider;
