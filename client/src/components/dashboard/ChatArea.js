import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { FaPaperPlane, FaSmile } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import Button from '../common/Button';

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: white;
`;

const ChatHeader = styled.div`
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  background: white;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => props.image ? `url(${props.image})` : '#f3f4f6'};
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: #6b7280;
  font-size: 14px;
`;

const ChatInfo = styled.div`
  flex: 1;
  
  h3 {
    font-size: 16px;
    font-weight: 600;
    color: #111827;
    margin-bottom: 2px;
  }
  
  p {
    font-size: 14px;
    color: #6b7280;
  }
`;

const OnlineStatus = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${props => props.online ? '#10b981' : '#9ca3af'};
`;

const MessagesContainer = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: #f8fafc;
  display: flex;
  flex-direction: column;
  gap: 12px;
  scroll-behavior: smooth;
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }
`;

const Message = styled.div`
  display: flex;
  justify-content: ${props => props.isOwn ? 'flex-end' : 'flex-start'};
  margin-bottom: 8px;
  flex-direction: column;
`;

const MessageSender = styled.div`
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 4px;
  text-align: ${props => props.isOwn ? 'right' : 'left'};
  font-weight: 500;
`;

const MessageBubble = styled.div`
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 18px;
  background: ${props => props.isOwn ? '#dc2626' : 'white'};
  color: ${props => props.isOwn ? 'white' : '#111827'};
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  word-wrap: break-word;
  
  .message-time {
    font-size: 12px;
    opacity: 0.7;
    margin-top: 4px;
  }
`;

const MessageInputContainer = styled.div`
  padding: 20px 24px;
  border-top: 1px solid #e5e7eb;
  background: white;
  display: flex;
  gap: 12px;
  align-items: flex-end;
`;

const InputWrapper = styled.div`
  flex: 1;
`;

const SendButton = styled.button`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #dc2626;
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover {
    background: #b91c1c;
    transform: scale(1.05);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
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
  
  h3 {
    font-size: 20px;
    margin-bottom: 8px;
    color: #374151;
  }
  
  p {
    font-size: 16px;
  }
`;

const ChatArea = ({ selectedChat, setSelectedChat }) => {
  const { user } = useAuth();
  const { socket, sendMessage } = useSocket();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load messages when selectedChat changes
  useEffect(() => {
    if (selectedChat && selectedChat.id) {
      loadMessages();
      loadChatUser();
    } else {
      setMessages([]);
    }
  }, [selectedChat?.id]); // Only depend on selectedChat.id, not the entire object

  const loadChatUser = async () => {
    if (!selectedChat || !selectedChat.id) return;
    
    try {
      const response = await axios.get(`/api/users/${selectedChat.id}`);
      if (response.data && response.data.user) {
        setSelectedChat(prev => ({
          ...prev,
          name: response.data.user.name,
          profilePicture: response.data.user.profilePicture,
          isOnline: response.data.user.isOnline
        }));
      }
    } catch (error) {
      console.error('Error loading chat user:', error);
      // Don't update selectedChat if there's an error
    }
  };

  // Socket event listener - only set up once
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (data) => {
      // Check if the message is for the current chat
      if (selectedChat && selectedChat.id && (
        (data.sender === selectedChat.id && data.recipient === user.id) ||
        (data.sender === user.id && data.recipient === selectedChat.id)
      )) {
        setMessages(prev => {
          // Check if message already exists to avoid duplicates
          const messageExists = prev.some(msg => msg._id === data._id);
          if (messageExists) {
            return prev;
          }
          const newMessages = [...prev, data];
          
          // Scroll to bottom after receiving message
          setTimeout(() => {
            scrollToBottom();
          }, 100);
          
          return newMessages;
        });
      }
    };

    socket.on('receive_message', handleReceiveMessage);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
    };
  }, [socket, user.id]); // Only depend on socket and user.id

  const loadMessages = async () => {
    if (!selectedChat || !selectedChat.id) return;
    
    try {
      setLoading(true);
      const response = await axios.get(`/api/messages/conversation/${selectedChat.id}`);
      
      if (response.data && response.data.messages) {
        setMessages(response.data.messages);
        // Scroll to bottom after loading messages
        setTimeout(() => {
          scrollToBottom();
        }, 100);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error('Load messages error:', error);
      toast.error('Mesajlar yüklenirken bir hata oluştu');
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;

    const messageContent = newMessage.trim();
    setNewMessage(''); // Clear input immediately for better UX

    try {
      const messageData = {
        recipientId: selectedChat.id,
        content: messageContent,
        messageType: 'text'
      };

      const response = await axios.post('/api/messages/send', messageData);
      
      // Add the new message to the list immediately
      setMessages(prev => {
        // Check if message already exists to avoid duplicates
        const messageExists = prev.some(msg => msg._id === response.data.data._id);
        if (messageExists) {
          return prev;
        }
        return [...prev, response.data.data];
      });
      
      // Scroll to bottom after sending message
      setTimeout(() => {
        scrollToBottom();
      }, 100);
      
    } catch (error) {
      console.error('Send message error:', error);
      toast.error('Mesaj gönderilirken bir hata oluştu');
      // Restore the message in input if sending failed
      setNewMessage(messageContent);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!selectedChat) {
    return (
      <ChatContainer>
        <EmptyState>
          <h3>Sohbet Seçin</h3>
          <p>Mesajlaşmak için bir arkadaşınızı seçin</p>
        </EmptyState>
      </ChatContainer>
    );
  }

  return (
    <ChatContainer>
      <ChatHeader>
        <Avatar image={selectedChat.profilePicture}>
          {!selectedChat.profilePicture && getInitials(selectedChat.name)}
        </Avatar>
        <ChatInfo>
          <h3>{selectedChat.name}</h3>
          <p>{selectedChat.isOnline ? 'Çevrimiçi' : 'Çevrimdışı'}</p>
        </ChatInfo>
        <OnlineStatus online={selectedChat.isOnline} />
      </ChatHeader>
      
      <MessagesContainer>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            Mesajlar yükleniyor...
          </div>
        ) : (
          messages.map((message) => {
            // Handle both string and object formats for sender
            const senderId = typeof message.sender === 'string' ? message.sender : message.sender._id;
            const isOwn = senderId === user.id;
            const senderName = isOwn ? user.name : selectedChat.name;
            
            return (
              <Message key={message._id} isOwn={isOwn}>
                <MessageSender isOwn={isOwn}>
                  {senderName}
                </MessageSender>
                <MessageBubble isOwn={isOwn}>
                  {message.content}
                  <div className="message-time">
                    {formatTime(message.createdAt)}
                  </div>
                </MessageBubble>
              </Message>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </MessagesContainer>
      
      <MessageInputContainer>
        <InputWrapper>
          <input
            type="text"
            placeholder="Mesajınızı yazın..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '16px',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
          />
        </InputWrapper>
        <SendButton
          onClick={handleSendMessage}
          disabled={!newMessage.trim()}
        >
          <FaPaperPlane />
        </SendButton>
      </MessageInputContainer>
    </ChatContainer>
  );
};

export default ChatArea; 