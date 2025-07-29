import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import styled from 'styled-components';
import { FaUser, FaCircle } from 'react-icons/fa';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: white;
`;

const Header = styled.div`
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  background: white;
  
  h2 {
    font-size: 20px;
    font-weight: 600;
    color: #111827;
    margin-bottom: 4px;
  }
  
  p {
    font-size: 14px;
    color: #6b7280;
  }
`;

const ChatListContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0;
`;

const ChatItem = styled.div`
  padding: 16px 24px;
  border-bottom: 1px solid #f3f4f6;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 12px;
  
  &:hover {
    background: #f8fafc;
  }
  
  &.active {
    background: #fef2f2;
    border-left: 4px solid #dc2626;
  }
`;

const Avatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${props => props.image ? `url(${props.image})` : '#dc2626'};
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: white;
  font-size: 16px;
  position: relative;
`;

const OnlineIndicator = styled.div`
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => props.online ? '#10b981' : '#9ca3af'};
  border: 2px solid white;
`;

const ChatInfo = styled.div`
  flex: 1;
  
  h3 {
    font-size: 16px;
    font-weight: 600;
    color: #111827;
    margin-bottom: 4px;
  }
  
  p {
    font-size: 14px;
    color: #6b7280;
    margin: 0;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #6b7280;
  text-align: center;
  padding: 40px 20px;
  
  h3 {
    font-size: 18px;
    margin-bottom: 8px;
    color: #374151;
  }
  
  p {
    font-size: 14px;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #6b7280;
`;

const ChatList = ({ selectedChat, setSelectedChat }) => {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadFriends = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/users/friends/list');
      setFriends(response.data.friends || []);
    } catch (error) {
      console.error('Load friends error:', error);
      toast.error('Arkadaş listesi yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Load friends on mount only
  useEffect(() => {
    loadFriends();
  }, []);

  // Remove all other refresh effects

  const handleChatSelect = (friend) => {
    setSelectedChat({
      id: friend._id,
      name: friend.name,
      email: friend.email,
      phone: friend.phone,
      profilePicture: friend.profilePicture,
      isOnline: friend.isOnline
    });
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <Container>
        <Header>
          <h2>Sohbetler</h2>
          <p>Arkadaşlarınızla sohbet edin</p>
        </Header>
        <LoadingSpinner>Yükleniyor...</LoadingSpinner>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <h2>Sohbetler</h2>
        <p>Arkadaşlarınızla sohbet edin</p>
      </Header>
      
      <ChatListContainer>
        {friends.length > 0 ? (
          friends.map((friend) => (
            <ChatItem
              key={friend._id}
              onClick={() => handleChatSelect(friend)}
              className={selectedChat?.id === friend._id ? 'active' : ''}
            >
              <Avatar image={friend.profilePicture}>
                {!friend.profilePicture && getInitials(friend.name)}
                <OnlineIndicator online={friend.isOnline} />
              </Avatar>
              <ChatInfo>
                <h3>{friend.name}</h3>
                <p>{friend.isOnline ? 'Çevrimiçi' : 'Çevrimdışı'}</p>
              </ChatInfo>
            </ChatItem>
          ))
        ) : (
          <EmptyState>
            <h3>Henüz arkadaşınız yok</h3>
            <p>Kullanıcı arama özelliğini kullanarak yeni arkadaşlar ekleyin</p>
          </EmptyState>
        )}
      </ChatListContainer>
    </Container>
  );
};

export default ChatList; 