import React, { useState } from 'react';
import styled from 'styled-components/macro';

const InputDiv = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  margin: 2vh;
`;

const Header = styled.h1``;

const Button = styled.button`
  align-self: flex-start;
  font-size: 1em;
  font-weight: 200;
  min-width: 50px;
  width: auto;
  margin: 2vh;
`;

type InputSectionProps = {
  handleOnSubmit: Function;
};

const InputSection = ({ handleOnSubmit }: InputSectionProps): JSX.Element => {
  const [inputField, setInputField] = useState('');

  return (
    <InputDiv className="div-input">
      <Header> Radial Git Trees </Header>
      <Label htmlFor="enter-repo">
        Enter repository:
        <input
          placeholder="ron-debajyoti/easy-visualify"
          type="text"
          name="enter-repo"
          onChange={(event) => setInputField(event.target.value)}
        />
      </Label>
      <Button type="button" onClick={(event) => handleOnSubmit(event, inputField)}>
        {' '}
        Submit{' '}
      </Button>
    </InputDiv>
  );
};

export default InputSection;
