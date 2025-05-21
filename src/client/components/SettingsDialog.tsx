import React, { useState } from 'react';
import { UserSettings } from '../../types';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onSettingsChange: (settings: UserSettings) => void;
  currentTheme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
}

export const SettingsDialog: React.FC<SettingsDialogProps> = ({
  isOpen,
  onClose,
  settings,
  onSettingsChange,
  currentTheme,
  onThemeChange
}) => {
  const [localSettings, setLocalSettings] = useState(settings);
  const [localTheme, setLocalTheme] = useState(currentTheme);

  if (!isOpen) return null;

  const handleSave = () => {
    onSettingsChange(localSettings);
    onThemeChange(localTheme);
    onClose();
  };

  return (
    <>
      <div className="settings-dialog-overlay" onClick={onClose} />
      <div className="settings-dialog">
        <h2>設定</h2>
        
        {/* テーマ設定 */}
        <div>
          <label>テーマ</label>
          <select
            value={localTheme}
            onChange={(e) => setLocalTheme(e.target.value as 'light' | 'dark')}
          >
            <option value="light">ライトモード</option>
            <option value="dark">ダークモード</option>
          </select>
        </div>

        {/* APIエンドポイント設定 */}
        <div>
          <label>APIエンドポイント</label>
          <input
            type="text"
            value={localSettings.endpoint}
            onChange={(e) => setLocalSettings({ ...localSettings, endpoint: e.target.value })}
          />
        </div>

        {/* 言語設定 */}
        <div>
          <label>言語</label>
          <select
            value={localSettings.language}
            onChange={(e) => setLocalSettings({ ...localSettings, language: e.target.value as 'ja' | 'en' })}
          >
            <option value="ja">日本語</option>
            <option value="en">English</option>
          </select>
        </div>

        {/* ボタン */}
        <div className="settings-dialog-buttons">
          <button
            onClick={onClose}
            className="cancel"
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            className="save"
          >
            保存
          </button>
        </div>
      </div>
    </>
  );
}; 