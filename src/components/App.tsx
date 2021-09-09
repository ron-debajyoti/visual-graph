import React from 'react';
import styled from 'styled-components';
import Process from './Main';
import '../styles/App.css';

const Wrapper = styled.div`
  display: flex;
  flex-flow: column;
  height: 100%;
  width: 100%;
  overflow: auto;
`;

const Header = styled.h1``;

const App = () => (
  <Wrapper>
    <Header> GitTreees </Header>
    <Process />
  </Wrapper>
);

export default App;
