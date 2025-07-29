import React from 'react';
import styled from 'styled-components';

const StyledButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: ${props => props.size === 'small' ? '8px 16px' : props.size === 'large' ? '16px 32px' : '12px 24px'};
  font-size: ${props => props.size === 'small' ? '14px' : props.size === 'large' ? '18px' : '16px'};
  font-weight: 600;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  text-decoration: none;
  min-width: ${props => props.fullWidth ? '100%' : 'auto'};
  
  ${props => {
    switch (props.variant) {
      case 'primary':
        return `
          background-color: #dc2626;
          color: white;
          &:hover {
            background-color: #b91c1c;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
          }
          &:active {
            transform: translateY(0);
          }
        `;
      case 'secondary':
        return `
          background-color: transparent;
          color: #dc2626;
          border: 2px solid #dc2626;
          &:hover {
            background-color: #dc2626;
            color: white;
            transform: translateY(-1px);
          }
        `;
      case 'outline':
        return `
          background-color: transparent;
          color: #6b7280;
          border: 2px solid #e5e7eb;
          &:hover {
            border-color: #dc2626;
            color: #dc2626;
          }
        `;
      case 'ghost':
        return `
          background-color: transparent;
          color: #6b7280;
          &:hover {
            background-color: #f3f4f6;
            color: #dc2626;
          }
        `;
      default:
        return `
          background-color: #dc2626;
          color: white;
          &:hover {
            background-color: #b91c1c;
          }
        `;
    }
  }}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
    box-shadow: none !important;
  }
`;

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'medium', 
  fullWidth = false,
  disabled = false,
  onClick,
  type = 'button',
  ...props 
}) => {
  return (
    <StyledButton
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      disabled={disabled}
      onClick={onClick}
      type={type}
      {...props}
    >
      {children}
    </StyledButton>
  );
};

export default Button; 