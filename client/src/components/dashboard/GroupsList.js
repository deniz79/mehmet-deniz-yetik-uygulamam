import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaUsers, FaPlus, FaTrash, FaSignOutAlt } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../common/Button';

const Container = styled.div`
  padding: 24px;
  height: 100%;
  overflow-y: auto;
`;

const Header = styled.div`
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
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

const CreateGroupButton = styled.button`
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    background: #b91c1c;
    transform: translateY(-1px);
  }
`;

const GroupsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
`;

const GroupCard = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 24px;
  transition: all 0.2s ease;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
`;

const GroupHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
`;

const GroupAvatar = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 12px;
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 20px;
`;

const GroupInfo = styled.div`
  flex: 1;
  
  h4 {
    font-size: 18px;
    font-weight: 600;
    color: #111827;
    margin-bottom: 4px;
  }
  
  p {
    font-size: 14px;
    color: #6b7280;
    margin-bottom: 4px;
  }
  
  .member-count {
    font-size: 12px;
    color: #9ca3af;
  }
`;

const GroupActions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 16px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 48px 24px;
  color: #6b7280;
  
  h3 {
    font-size: 20px;
    margin-bottom: 8px;
    color: #374151;
  }
  
  p {
    font-size: 16px;
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  padding: 32px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  margin-bottom: 24px;
  
  h3 {
    font-size: 20px;
    font-weight: 600;
    color: #111827;
    margin-bottom: 8px;
  }
  
  p {
    color: #6b7280;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const GroupsList = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/groups/my-groups');
      setGroups(response.data.groups);
    } catch (error) {
      toast.error('Gruplar yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    try {
      await axios.post('/api/groups/create', {
        name: newGroupName.trim(),
        description: newGroupDescription.trim()
      });
      
      toast.success('Grup başarıyla oluşturuldu');
      setShowCreateModal(false);
      setNewGroupName('');
      setNewGroupDescription('');
      loadGroups();
    } catch (error) {
      toast.error('Grup oluşturulurken bir hata oluştu');
    }
  };

  const handleLeaveGroup = async (groupId) => {
    if (!window.confirm('Bu gruptan ayrılmak istediğinizden emin misiniz?')) return;

    try {
      await axios.post(`/api/groups/${groupId}/leave`);
      toast.success('Gruptan ayrıldınız');
      loadGroups();
    } catch (error) {
      toast.error('Gruptan ayrılırken bir hata oluştu');
    }
  };

  if (loading) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '48px' }}>
          Yükleniyor...
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <div>
          <h2>Gruplarım</h2>
          <p>Katıldığınız grupları yönetin</p>
        </div>
        <CreateGroupButton onClick={() => setShowCreateModal(true)}>
          <FaPlus />
          Yeni Grup
        </CreateGroupButton>
      </Header>

      {groups.length > 0 ? (
        <GroupsGrid>
          {groups.map((group) => (
            <GroupCard key={group._id}>
              <GroupHeader>
                <GroupAvatar>
                  {group.name.charAt(0).toUpperCase()}
                </GroupAvatar>
                <GroupInfo>
                  <h4>{group.name}</h4>
                  <p>{group.description || 'Açıklama yok'}</p>
                  <p className="member-count">
                    {group.members.length} üye
                  </p>
                </GroupInfo>
              </GroupHeader>
              
              <GroupActions>
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() => handleLeaveGroup(group._id)}
                >
                  <FaSignOutAlt />
                  Gruptan Ayrıl
                </Button>
              </GroupActions>
            </GroupCard>
          ))}
        </GroupsGrid>
      ) : (
        <EmptyState>
          <h3>Henüz grubunuz yok</h3>
          <p>Yeni grup oluşturarak arkadaşlarınızla grup sohbeti başlatın</p>
        </EmptyState>
      )}

      {showCreateModal && (
        <Modal onClick={() => setShowCreateModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h3>Yeni Grup Oluştur</h3>
              <p>Arkadaşlarınızla grup sohbeti başlatın</p>
            </ModalHeader>
            
            <Form onSubmit={handleCreateGroup}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                  Grup Adı
                </label>
                <input
                  type="text"
                  placeholder="Grup adını girin"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    fontSize: '16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    outline: 'none'
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                  Açıklama (İsteğe bağlı)
                </label>
                <input
                  type="text"
                  placeholder="Grup açıklaması"
                  value={newGroupDescription}
                  onChange={(e) => setNewGroupDescription(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    fontSize: '16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    outline: 'none'
                  }}
                />
              </div>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <Button
                  type="submit"
                  fullWidth
                  disabled={!newGroupName.trim()}
                >
                  Grup Oluştur
                </Button>
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => setShowCreateModal(false)}
                >
                  İptal
                </Button>
              </div>
            </Form>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default GroupsList; 