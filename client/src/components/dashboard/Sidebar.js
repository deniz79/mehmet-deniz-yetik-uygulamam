import React from 'react';
import styled from 'styled-components';
import { 
  FaComments, 
  FaUsers, 
  FaUserFriends, 
  FaSearch, 
  FaUser, 
  FaSignOutAlt 
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../common/Button';

const SidebarContainer = styled.div`
  width: 280px;
  background: white;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 4px rgba(0, 0, 0, 0.1);
`;

const Header = styled.div`
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  color: white;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
`;

const Avatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${props => props.image ? `url(${props.image})` : '#f3f4f6'};
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: #6b7280;
  font-size: 18px;
`;

const UserDetails = styled.div`
  flex: 1;
  
  h3 {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 4px;
  }
  
  p {
    font-size: 14px;
    opacity: 0.9;
  }
`;

const OnlineStatus = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #10b981;
  border: 2px solid white;
`;

const Navigation = styled.nav`
  flex: 1;
  padding: 16px 0;
`;

const NavItem = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 24px;
  background: ${props => props.active ? '#fef2f2' : 'transparent'};
  color: ${props => props.active ? '#dc2626' : '#6b7280'};
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 16px;
  font-weight: 500;
  
  &:hover {
    background: ${props => props.active ? '#fef2f2' : '#f9fafb'};
    color: ${props => props.active ? '#dc2626' : '#374151'};
  }
  
  svg {
    font-size: 18px;
  }
`;

const Footer = styled.div`
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
`;

const Sidebar = ({ activeTab, setActiveTab, user }) => {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const navItems = [
    { id: 'chats', label: 'Sohbetler', icon: FaComments },
    { id: 'friends', label: 'Arkadaşlar', icon: FaUserFriends },
    { id: 'groups', label: 'Gruplar', icon: FaUsers },
    { id: 'search', label: 'Kullanıcı Ara', icon: FaSearch },
    { id: 'profile', label: 'Profil', icon: FaUser },
  ];

  return (
    <SidebarContainer>
      <Header>
        <UserInfo>
          <Avatar image={user?.profilePicture}>
            {!user?.profilePicture && getInitials(user?.name || '')}
          </Avatar>
          <UserDetails>
            <h3>{user?.name}</h3>
            <p>{user?.email}</p>
          </UserDetails>
          <OnlineStatus />
        </UserInfo>
      </Header>
      
      <Navigation>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavItem
              key={item.id}
              active={activeTab === item.id}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon />
              {item.label}
            </NavItem>
          );
        })}
      </Navigation>
      
      <Footer>
        <Button
          variant="ghost"
          fullWidth
          onClick={handleLogout}
          style={{ justifyContent: 'flex-start', gap: '12px' }}
        >
          <FaSignOutAlt />
          Çıkış Yap
        </Button>
      </Footer>
    </SidebarContainer>
  );
};

export default Sidebar; 