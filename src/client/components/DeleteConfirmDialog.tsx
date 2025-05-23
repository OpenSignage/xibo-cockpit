import React from 'react';

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleteAll?: boolean;
}

const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm,
  isDeleteAll = false 
}) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="delete-dialog-overlay" onClick={onClose} />
      <div className="delete-dialog">
        <h3>{isDeleteAll ? '全ての会話履歴の削除' : '会話履歴の削除'}</h3>
        <p>
          {isDeleteAll 
            ? '全ての会話履歴を削除します。この操作は取り消せません。本当に削除しますか？'
            : 'この会話履歴を削除します。この操作は取り消せません。本当に削除しますか？'
          }
        </p>
        <div className="delete-dialog-buttons">
          <button
            onClick={onClose}
            className="cancel"
          >
            キャンセル
          </button>
          <button
            onClick={onConfirm}
            className="delete"
          >
            削除
          </button>
        </div>
      </div>
    </>
  );
};

export default DeleteConfirmDialog; 