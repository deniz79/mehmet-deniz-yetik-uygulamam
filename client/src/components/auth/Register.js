import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../common/Button';

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  padding: 20px;
`;

const Card = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  padding: 48px;
  width: 100%;
  max-width: 400px;
`;

const Title = styled.h1`
  text-align: center;
  font-size: 32px;
  font-weight: 800;
  color: #dc2626;
  margin-bottom: 8px;
`;

const Subtitle = styled.p`
  text-align: center;
  color: #6b7280;
  font-size: 16px;
  margin-bottom: 32px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-weight: 600;
  color: #374151;
  font-size: 14px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  font-size: 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  background-color: white;
  transition: all 0.2s ease-in-out;
  outline: none;

  &:focus {
    border-color: #dc2626;
    box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const LinkText = styled.p`
  text-align: center;
  margin-top: 24px;
  color: #6b7280;
  
  a {
    color: #dc2626;
    text-decoration: none;
    font-weight: 600;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name || !email || !phone || !password || !confirmPassword) {
      toast.error('Lütfen tüm alanları doldurun');
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error('Şifreler eşleşmiyor');
      return;
    }
    
    if (password.length < 6) {
      toast.error('Şifre en az 6 karakter olmalıdır');
      return;
    }
    
    console.log('Register form submitted:', { name, email, phone, password });
    setLoading(true);
    
    try {
      const result = await registerUser(name, email, phone, password);
      console.log('Register result:', result);
      
      if (result.success) {
        toast.success('Başarıyla kayıt olundu!');
        navigate('/');
      } else {
        toast.error(result.error || 'Kayıt başarısız');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Kayıt olurken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Card>
        <Title>Yazışma</Title>
        <Subtitle>Hesap oluşturun</Subtitle>
        
        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <Label>Ad Soyad</Label>
            <Input
              type="text"
              placeholder="Adınız ve soyadınız"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </InputGroup>
          
          <InputGroup>
            <Label>E-posta</Label>
            <Input
              type="email"
              placeholder="ornek@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </InputGroup>
          
          <InputGroup>
            <Label>Telefon Numarası</Label>
            <Input
              type="tel"
              placeholder="5054134012"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </InputGroup>
          
          <InputGroup>
            <Label>Şifre</Label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </InputGroup>
          
          <InputGroup>
            <Label>Şifre Tekrar</Label>
            <Input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </InputGroup>
          
          <Button
            type="submit"
            fullWidth
            disabled={loading}
            size="large"
          >
            {loading ? 'Kayıt olunuyor...' : 'Kayıt Ol'}
          </Button>
        </Form>
        
        <LinkText>
          Zaten hesabınız var mı?{' '}
          <Link to="/login">Giriş yapın</Link>
        </LinkText>
      </Card>
    </Container>
  );
};

export default Register; 