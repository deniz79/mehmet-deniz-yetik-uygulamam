import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import styled from 'styled-components';
import { FaSearch, FaUserPlus, FaCheck, FaTimes } from 'react-icons/fa';

const SearchContainer = styled.div`
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
`;

const SearchForm = styled.form`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 16px;
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: #dc2626;
  }
`;

const SearchButton = styled.button`
  padding: 12px 24px;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: #b91c1c;
  }

  &:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }
`;

const UserCard = styled.div`
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
`;

const Avatar = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #dc2626;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
`;

const UserDetails = styled.div`
  flex: 1;
`;

const UserName = styled.h3`
  margin: 0 0 4px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
`;

const UserEmail = styled.p`
  margin: 0 0 4px 0;
  color: #6b7280;
  font-size: 14px;
`;

const UserPhone = styled.p`
  margin: 0;
  color: #6b7280;
  font-size: 14px;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
`;

const ActionButton = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;

  &.primary {
    background: #dc2626;
    color: white;

    &:hover {
      background: #b91c1c;
    }

    &:disabled {
      background: #9ca3af;
      cursor: not-allowed;
    }
  }

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

const StatusBadge = styled.span`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;

  &.friend {
    background: #d1fae5;
    color: #065f46;
  }

  &.pending {
    background: #fef3c7;
    color: #92400e;
  }

  &.sent {
    background: #dbeafe;
    color: #1e40af;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #6b7280;
`;

const SearchUsers = () => {
  const [phone, setPhone] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!phone.trim()) {
      toast.error('Lütfen telefon numarası girin');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`/api/users/search?phone=${phone.trim()}`);
      setSearchResult(response.data);
    } catch (error) {
      console.error('Search error:', error);
      const message = error.response?.data?.message || 'Arama yapılırken bir hata oluştu';
      toast.error(message);
      setSearchResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async () => {
    if (!searchResult?.user) return;

    setActionLoading(true);
    try {
      await axios.post('/api/users/send-friend-request', {
        receiverId: searchResult.user._id
      });
      toast.success('Arkadaşlık isteği gönderildi');
      // Refresh search result to update status
      const response = await axios.get(`/api/users/search?phone=${phone.trim()}`);
      setSearchResult(response.data);
    } catch (error) {
      console.error('Send request error:', error);
      const message = error.response?.data?.message || 'İstek gönderilirken bir hata oluştu';
      toast.error(message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAcceptRequest = async () => {
    if (!searchResult?.user) return;

    setActionLoading(true);
    try {
      await axios.post('/api/users/accept-friend-request', {
        senderId: searchResult.user._id
      });
      toast.success('Arkadaşlık isteği kabul edildi');
      // Refresh search result to update status
      const response = await axios.get(`/api/users/search?phone=${phone.trim()}`);
      setSearchResult(response.data);
    } catch (error) {
      console.error('Accept request error:', error);
      const message = error.response?.data?.message || 'İstek kabul edilirken bir hata oluştu';
      toast.error(message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectRequest = async () => {
    if (!searchResult?.user) return;

    setActionLoading(true);
    try {
      await axios.post('/api/users/reject-friend-request', {
        senderId: searchResult.user._id
      });
      toast.success('Arkadaşlık isteği reddedildi');
      // Refresh search result to update status
      const response = await axios.get(`/api/users/search?phone=${phone.trim()}`);
      setSearchResult(response.data);
    } catch (error) {
      console.error('Reject request error:', error);
      const message = error.response?.data?.message || 'İstek reddedilirken bir hata oluştu';
      toast.error(message);
    } finally {
      setActionLoading(false);
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const renderActionButtons = () => {
    if (!searchResult) return null;

    const { user, isFriend, hasSentRequest, hasReceivedRequest } = searchResult;

    if (isFriend) {
      return (
        <ActionButton className="success" disabled>
          <FaCheck /> Arkadaş
        </ActionButton>
      );
    }

    if (hasSentRequest) {
      return (
        <ActionButton className="secondary" disabled>
          İstek Gönderildi
        </ActionButton>
      );
    }

    if (hasReceivedRequest) {
      return (
        <ActionButtons>
          <ActionButton 
            className="success" 
            onClick={handleAcceptRequest}
            disabled={actionLoading}
          >
            <FaCheck /> Kabul Et
          </ActionButton>
          <ActionButton 
            className="danger" 
            onClick={handleRejectRequest}
            disabled={actionLoading}
          >
            <FaTimes /> Reddet
          </ActionButton>
        </ActionButtons>
      );
    }

    return (
      <ActionButton 
        className="primary" 
        onClick={handleSendRequest}
        disabled={actionLoading}
      >
        <FaUserPlus /> Arkadaşlık İsteği Gönder
      </ActionButton>
    );
  };

  const renderStatusBadge = () => {
    if (!searchResult) return null;

    const { isFriend, hasSentRequest, hasReceivedRequest } = searchResult;

    if (isFriend) {
      return <StatusBadge className="friend">Arkadaş</StatusBadge>;
    }

    if (hasSentRequest) {
      return <StatusBadge className="sent">İstek Gönderildi</StatusBadge>;
    }

    if (hasReceivedRequest) {
      return <StatusBadge className="pending">İstek Bekliyor</StatusBadge>;
    }

    return null;
  };

  return (
    <SearchContainer>
      <h2>Kullanıcı Ara</h2>
      <p style={{ color: '#6b7280', marginBottom: '20px' }}>
        Telefon numarası ile kullanıcı arayın ve arkadaşlık isteği gönderin
      </p>

      <SearchForm onSubmit={handleSearch}>
        <SearchInput
          type="text"
          placeholder="Telefon numarası girin (örn: 5054134012)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          disabled={loading}
        />
        <SearchButton type="submit" disabled={loading}>
          {loading ? 'Aranıyor...' : <><FaSearch /> Ara</>}
        </SearchButton>
      </SearchForm>

      {searchResult && searchResult.user && (
        <UserCard>
          <UserInfo>
            <Avatar>
              {searchResult.user.profilePicture ? (
                <img 
                  src={searchResult.user.profilePicture} 
                  alt={searchResult.user.name}
                  style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                getInitials(searchResult.user.name)
              )}
            </Avatar>
            <UserDetails>
              <UserName>{searchResult.user.name}</UserName>
              <UserEmail>{searchResult.user.email}</UserEmail>
              <UserPhone>{searchResult.user.phone}</UserPhone>
              {renderStatusBadge()}
            </UserDetails>
          </UserInfo>
          {renderActionButtons()}
        </UserCard>
      )}

      {searchResult === null && !loading && (
        <EmptyState>
          <p>Kullanıcı aramak için telefon numarası girin</p>
        </EmptyState>
      )}
    </SearchContainer>
  );
};

export default SearchUsers; 