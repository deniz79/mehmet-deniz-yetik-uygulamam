import React from 'react';
import styled from 'styled-components';

const InputContainer = styled.div`
  position: relative;
  width: 100%;
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  font-size: 16px;
  border: 2px solid ${props => props.hasError ? '#ef4444' : '#e5e7eb'};
  border-radius: 8px;
  background-color: white;
  transition: all 0.2s ease-in-out;
  outline: none;

  &:focus {
    border-color: ${props => props.hasError ? '#ef4444' : '#dc2626'};
    box-shadow: 0 0 0 3px ${props => props.hasError ? 'rgba(239, 68, 68, 0.1)' : 'rgba(220, 38, 38, 0.1)'};
  }

  &:disabled {
    background-color: #f9fafb;
    cursor: not-allowed;
    opacity: 0.6;
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #374151;
  font-size: 14px;
`;

const ErrorMessage = styled.span`
  display: block;
  margin-top: 4px;
  color: #ef4444;
  font-size: 12px;
  font-weight: 500;
`;

const Input = ({
  label,
  error,
  type = 'text',
  placeholder,
  disabled = false,
  required = false,
  ...props
}) => {
  const hasError = !!error;
  
  return (
    <InputContainer>
      {label && (
        <Label>
          {label}
          {required && <span style={{ color: '#ef4444' }}> *</span>}
        </Label>
      )}
      <StyledInput
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        hasError={hasError}
        {...props}
      />
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </InputContainer>
  );
};

export default Input; 