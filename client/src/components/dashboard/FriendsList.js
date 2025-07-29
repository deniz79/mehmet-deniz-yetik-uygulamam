import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import styled from 'styled-components';
import { FaUser, FaCheck, FaTimes, FaUserPlus } from 'react-icons/fa';

const Container = styled.div`
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: 24px;
  
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

const Section = styled.div`
  margin-bottom: 32px;
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const UserCard = styled.div`
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.2s;
  cursor: pointer;

  &:hover {
    border-color: #dc2626;
    box-shadow: 0 4px 12px rgba(220, 38, 38, 0.1);
  }
`;

const Avatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #dc2626;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: bold;
  flex-shrink: 0;
`;

const UserInfo = styled.div`
  flex: 1;
`;

const UserName = styled.h4`
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
`;

const UserEmail = styled.p`
  margin: 0 0 2px 0;
  color: #6b7280;
  font-size: 14px;
`;

const UserPhone = styled.p`
  margin: 0;
  color: #6b7280;
  font-size: 14px;
`;

const OnlineStatus = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => props.online ? '#10b981' : '#9ca3af'};
  flex-shrink: 0;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  flex-shrink: 0;
`;

const ActionButton = styled.button`
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 4px;

  &.success {
    background: #10b981;
    color: white;

    &:hover {
      background: #059669;
    }
  }

  &.danger {
    background: #ef4444;
    color: white;

    &:hover {
      background: #dc2626;
    }
  }

  &.secondary {
    background: #6b7280;
    color: white;

    &:hover {
      background: #4b5563;
    }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #6b7280;
  
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
  text-align: center;
  padding: 40px 20px;
  color: #6b7280;
`;

const FriendsList = ({ setSelectedChat }) => {
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const loadFriendsData = async () => {
    try {
      const response = await axios.get('/api/users/friends/list');
      setFriends(response.data.friends);
      setFriendRequests(response.data.friendRequests);
      setSentRequests(response.data.sentRequests);
    } catch (error) {
      console.error('Load friends error:', error);
      toast.error('Arkadaş listesi yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFriendsData();
  }, []);

  const handleAcceptRequest = async (senderId) => {
    setActionLoading(true);
    try {
      const response = await axios.post('/api/users/accept-friend-request', { senderId });
      toast.success('Arkadaşlık isteği kabul edildi');
      
      // Set the selected chat to the new friend
      if (response.data.sender) {
        setSelectedChat({
          id: response.data.sender._id,
          name: response.data.sender.name,
          email: response.data.sender.email,
          phone: response.data.sender.phone,
          profilePicture: response.data.sender.profilePicture,
          isOnline: response.data.sender.isOnline
        });
      }
      
      loadFriendsData();
    } catch (error) {
      console.error('Accept request error:', error);
      toast.error('İstek kabul edilirken bir hata oluştu');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectRequest = async (senderId) => {
    setActionLoading(true);
    try {
      await axios.post('/api/users/reject-friend-request', { senderId });
      toast.success('Arkadaşlık isteği reddedildi');
      loadFriendsData();
    } catch (error) {
      console.error('Reject request error:', error);
      toast.error('İstek reddedilirken bir hata oluştu');
    } finally {
      setActionLoading(false);
    }
  };

  const handleFriendClick = (friend) => {
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
        <LoadingSpinner>Yükleniyor...</LoadingSpinner>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <h2>Arkadaşlarım</h2>
        <p>Arkadaşlarınızı yönetin ve yeni istekleri görüntüleyin</p>
      </Header>

      {/* Friend Requests */}
      {friendRequests.length > 0 && (
        <Section>
          <SectionTitle>
            <FaUserPlus /> Gelen Arkadaşlık İstekleri ({friendRequests.length})
          </SectionTitle>
          {friendRequests.map((request) => (
            <UserCard key={request.from._id}>
              <Avatar>
                {request.from.profilePicture ? (
                  <img 
                    src={request.from.profilePicture} 
                    alt={request.from.name}
                    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                  />
                ) : (
                  getInitials(request.from.name)
                )}
              </Avatar>
              <UserInfo>
                <UserName>{request.from.name}</UserName>
                <UserEmail>{request.from.email}</UserEmail>
                <UserPhone>{request.from.phone}</UserPhone>
              </UserInfo>
              <OnlineStatus online={request.from.isOnline} />
              <ActionButtons>
                <ActionButton 
                  className="success" 
                  onClick={() => handleAcceptRequest(request.from._id)}
                  disabled={actionLoading}
                >
                  <FaCheck /> Kabul Et
                </ActionButton>
                <ActionButton 
                  className="danger" 
                  onClick={() => handleRejectRequest(request.from._id)}
                  disabled={actionLoading}
                >
                  <FaTimes /> Reddet
                </ActionButton>
              </ActionButtons>
            </UserCard>
          ))}
        </Section>
      )}

      {/* Friends */}
      <Section>
        <SectionTitle>
          <FaUser /> Arkadaşlarım ({friends.length})
        </SectionTitle>
        {friends.length > 0 ? (
          friends.map((friend) => (
            <UserCard 
              key={friend._id}
              onClick={() => handleFriendClick(friend)}
            >
              <Avatar>
                {friend.profilePicture ? (
                  <img 
                    src={friend.profilePicture} 
                    alt={friend.name}
                    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                  />
                ) : (
                  getInitials(friend.name)
                )}
              </Avatar>
              <UserInfo>
                <UserName>{friend.name}</UserName>
                <UserEmail>{friend.email}</UserEmail>
                <UserPhone>{friend.phone}</UserPhone>
              </UserInfo>
              <OnlineStatus online={friend.isOnline} />
            </UserCard>
          ))
        ) : (
          <EmptyState>
            <h3>Henüz arkadaşınız yok</h3>
            <p>Kullanıcı arama özelliğini kullanarak yeni arkadaşlar ekleyin</p>
          </EmptyState>
        )}
      </Section>

      {/* Sent Requests */}
      {sentRequests.length > 0 && (
        <Section>
          <SectionTitle>
            <FaUserPlus /> Gönderilen İstekler ({sentRequests.length})
          </SectionTitle>
          {sentRequests.map((user) => (
            <UserCard key={user._id}>
              <Avatar>
                {user.profilePicture ? (
                  <img 
                    src={user.profilePicture} 
                    alt={user.name}
                    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                  />
                ) : (
                  getInitials(user.name)
                )}
              </Avatar>
              <UserInfo>
                <UserName>{user.name}</UserName>
                <UserEmail>{user.email}</UserEmail>
                <UserPhone>{user.phone}</UserPhone>
              </UserInfo>
              <OnlineStatus online={user.isOnline} />
              <ActionButton className="secondary" disabled>
                İstek Gönderildi
              </ActionButton>
            </UserCard>
          ))}
        </Section>
      )}
    </Container>
  );
};

export default FriendsList; 