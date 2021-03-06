import styled from 'styled-components';
import { pallete } from '../../lib/style/pallete';

export const ErrorMessage = styled.p`
  color: ${pallete.red};
  font-style: normal;
  font-weight: 500;
  font-size: 10px;
  line-height: 14px;

  margin-top: 10px;
`;

export const CleanMessage = styled.p`
  color: ${pallete.orange};
  font-style: normal;
  font-weight: 500;
  font-size: 10px;
  line-height: 14px;

  margin-top: 10px;
`;
