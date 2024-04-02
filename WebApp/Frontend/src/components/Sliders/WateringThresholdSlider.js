import React,{useState} from 'react';
import {
    Slider,
    SliderTrack,
    SliderFilledTrack,
    SliderThumb,
    SliderMark,
    Tooltip
  } from '@chakra-ui/react'

const WateringThresholdSlider = ({disabled, threshold=30, updateThreshold}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <Slider
      ml={"5"}
      w="80%"
      id="slider"
      value={threshold || 30}
      defaultValue={threshold}
      min={0}
      max={100}
      colorScheme="blue"
      isDisabled={disabled}
      onChange={v => updateThreshold(v)}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <SliderMark value={25} mt="1" ml="-2.5" fontSize="sm">
        25%
      </SliderMark>
      <SliderMark value={50} mt="1" ml="-2.5" fontSize="sm">
        50%
      </SliderMark>
      <SliderMark value={75} mt="1" ml="-2.5" fontSize="sm">
        75%
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
        label={`${threshold}%`}
      >
        <SliderThumb />
      </Tooltip>
    </Slider>
  );
};

export default WateringThresholdSlider;
