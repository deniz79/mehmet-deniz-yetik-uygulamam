import React, { useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import Sidebar from './Sidebar';
import ChatArea from './ChatArea';
import ChatList from './ChatList';
import FriendsList from './FriendsList';
import GroupsList from './GroupsList';
import Profile from './Profile';
import SearchUsers from './SearchUsers';

const DashboardContainer = styled.div`
  display: flex;
  height: 100vh;
  background-color: #f8fafc;
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const ChatLayout = styled.div`
  display: flex;
  height: 100%;
  background: white;
`;

const ChatListSection = styled.div`
  width: 300px;
  border-right: 1px solid #e5e7eb;
  background: white;
`;

const ChatAreaSection = styled.div`
  flex: 1;
  background: white;
`;

const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('chats');
  const [selectedChat, setSelectedChat] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);

  const renderContent = () => {
    switch (activeTab) {
      case 'chats':
        return (
          <ChatLayout>
            <ChatListSection>
              <ChatList 
                selectedChat={selectedChat}
                setSelectedChat={setSelectedChat}
              />
            </ChatListSection>
            <ChatAreaSection>
              <ChatArea 
                selectedChat={selectedChat}
                setSelectedChat={setSelectedChat}
              />
            </ChatAreaSection>
          </ChatLayout>
        );
      case 'friends':
        return <FriendsList setSelectedChat={setSelectedChat} />;
      case 'groups':
        return <GroupsList />;
      case 'search':
        return <SearchUsers />;
      case 'profile':
        return <Profile />;
      default:
        return (
          <ChatLayout>
            <ChatListSection>
              <ChatList 
                selectedChat={selectedChat}
                setSelectedChat={setSelectedChat}
              />
            </ChatListSection>
            <ChatAreaSection>
              <ChatArea 
                selectedChat={selectedChat}
                setSelectedChat={setSelectedChat}
              />
            </ChatAreaSection>
          </ChatLayout>
        );
    }
  };

  return (
    <DashboardContainer>
      <Sidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
      />
      <MainContent>
        {renderContent()}
      </MainContent>
    </DashboardContainer>
  );
};

export default Dashboard; 