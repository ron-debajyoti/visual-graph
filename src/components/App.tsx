import React, { useState } from 'react';
import styled from 'styled-components';
import Process from './Main';
import InputSection from './InputSection';
import '../styles/App.css';

const Wrapper = styled.div`
  display: flex;
  flex-flow: row;
  height: 100%;
  width: 100%;
  overflow: auto;
`;

const App = () => {
  const [input, setInput] = useState<string>('');

  const handleOnSubmit = (
    event: React.MouseEvent<HTMLInputElement, MouseEvent>,
    inputField: string
  ): void => {
    event.preventDefault();
    setInput(inputField);
  };

  return (
    <Wrapper>
      <InputSection handleOnSubmit={handleOnSubmit} />
      <Process inputVal={input} />
    </Wrapper>
  );
};

export default App;
