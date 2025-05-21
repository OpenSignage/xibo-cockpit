import React, { useState } from 'react';
import { UserSettings } from '../../types';

interface SettingsModalProps {
  settings: UserSettings;
  onSave: (settings: UserSettings) => void;
  onClose: () => void;
  currentTheme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onSave,
  onClose,
  currentTheme,
  onThemeChange
}) => {
  const [formState, setFormState] = useState<UserSettings>({
    ...settings
  });
  const [localTheme, setLocalTheme] = useState(currentTheme);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormState(prev => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked 
        : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formState);
    onThemeChange(localTheme);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">設定</h2>
        
        <form onSubmit={handleSubmit}>
          {/* エンドポイント設定 */}
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 mb-2">
              接続先
            </label>
            <input
              type="text"
              name="endpoint"
              value={formState.endpoint}
              onChange={handleChange}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="例: http://localhost:4111"
            />
          </div>
          
          {/* テーマ設定 */}
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 mb-2">
              テーマ
            </label>
            <select
              value={localTheme}
              onChange={(e) => setLocalTheme(e.target.value as 'light' | 'dark')}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="light">ライトモード</option>
              <option value="dark">ダークモード</option>
            </select>
          </div>
          
          {/* 言語設定 */}
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 mb-2">
              言語
            </label>
            <select
              name="language"
              value={formState.language}
              onChange={handleChange}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="ja">日本語</option>
              <option value="en">English</option>
            </select>
          </div>
          
          {/* ボタン */}
          <div className="flex justify-end space-x-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsModal; 