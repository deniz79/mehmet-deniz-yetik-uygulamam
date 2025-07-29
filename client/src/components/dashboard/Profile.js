import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import styled from 'styled-components';
import { FaUser, FaEnvelope, FaPhone, FaCamera } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../common/Button';
import Input from '../common/Input';

const Container = styled.div`
  padding: 24px;
  height: 100%;
  overflow-y: auto;
`;

const Header = styled.div`
  margin-bottom: 32px;
  
  h2 {
    font-size: 24px;
    font-weight: 700;
    color: #111827;
    margin-bottom: 8px;
  }
  
  p {
    color: #6b7280;
    font-size: 16px;
  }
`;

const ProfileCard = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  max-width: 600px;
`;

const ProfileHeader = styled.div`
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  color: white;
  padding: 32px;
  text-align: center;
  position: relative;
`;

const AvatarContainer = styled.div`
  position: relative;
  display: inline-block;
  margin-bottom: 16px;
`;

const Avatar = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: ${props => props.image ? `url(${props.image})` : '#f3f4f6'};
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: #6b7280;
  font-size: 36px;
  border: 4px solid white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`;

const CameraButton = styled.button`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #dc2626;
  color: white;
  border: 2px solid white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover {
    background: #b91c1c;
    transform: scale(1.1);
  }
`;

const ProfileInfo = styled.div`
  h3 {
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 8px;
  }
  
  p {
    font-size: 16px;
    opacity: 0.9;
  }
`;

const FormSection = styled.div`
  padding: 32px;
`;

const FormGrid = styled.div`
  display: grid;
  gap: 20px;
  margin-bottom: 24px;
`;

const InfoSection = styled.div`
  padding: 32px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  .icon {
    width: 20px;
    color: #6b7280;
  }
  
  .label {
    font-weight: 600;
    color: #374151;
    min-width: 100px;
  }
  
  .value {
    color: #6b7280;
  }
`;

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      profilePicture: ''
    }
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const result = await updateProfile(data.name, imagePreview || user?.profilePicture);
      if (result.success) {
        toast.success('Profil başarıyla güncellendi');
        setImagePreview(null);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Profil güncellenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Container>
      <Header>
        <h2>Profil Ayarları</h2>
        <p>Kişisel bilgilerinizi güncelleyin</p>
      </Header>

      <ProfileCard>
        <ProfileHeader>
          <AvatarContainer>
            <Avatar image={imagePreview || user?.profilePicture}>
              {!imagePreview && !user?.profilePicture && getInitials(user?.name || '')}
            </Avatar>
            <CameraButton onClick={() => document.getElementById('profile-image').click()}>
              <FaCamera />
            </CameraButton>
            <input
              id="profile-image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />
          </AvatarContainer>
          <ProfileInfo>
            <h3>{user?.name}</h3>
            <p>Profil bilgilerinizi düzenleyin</p>
          </ProfileInfo>
        </ProfileHeader>

        <FormSection>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FormGrid>
              <Input
                label="Ad Soyad"
                placeholder="Adınız ve soyadınız"
                error={errors.name?.message}
                {...register('name', {
                  required: 'Ad soyad gereklidir',
                  minLength: {
                    value: 2,
                    message: 'Ad soyad en az 2 karakter olmalıdır'
                  }
                })}
              />
            </FormGrid>
            
            <Button
              type="submit"
              fullWidth
              disabled={loading}
              size="large"
            >
              {loading ? 'Güncelleniyor...' : 'Profili Güncelle'}
            </Button>
          </form>
        </FormSection>

        <InfoSection>
          <InfoItem>
            <FaUser className="icon" />
            <span className="label">Ad Soyad:</span>
            <span className="value">{user?.name}</span>
          </InfoItem>
          
          <InfoItem>
            <FaEnvelope className="icon" />
            <span className="label">E-posta:</span>
            <span className="value">{user?.email}</span>
          </InfoItem>
          
          <InfoItem>
            <FaPhone className="icon" />
            <span className="label">Telefon:</span>
            <span className="value">{user?.phone}</span>
          </InfoItem>
        </InfoSection>
      </ProfileCard>
    </Container>
  );
};

export default Profile; 