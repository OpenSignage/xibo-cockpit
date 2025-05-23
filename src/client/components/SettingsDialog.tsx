import React, { useRef } from 'react';
import { UserSettings } from '../../types';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onSettingsChange: (settings: UserSettings) => void;
  currentTheme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
}

const TIMEZONES = [
  { value: 'Asia/Tokyo', label: 'Tokyo, Japan' },
  { value: 'America/New_York', label: 'New York, USA' },
  { value: 'Europe/London', label: 'London, UK' },
  { value: 'Asia/Shanghai', label: 'Shanghai, China' },
  { value: 'Australia/Sydney', label: 'Sydney, Australia' }
];

const LANGUAGES = [
  { value: 'ja', label: '日本語' },
  { value: 'en', label: 'English' }
];

const DISPLAY_MODES = [
  { value: 'false', label: 'ライトモード' },
  { value: 'true', label: 'ダークモード' }
];

export const SettingsDialog: React.FC<SettingsDialogProps> = ({
  isOpen,
  onClose,
  settings,
  onSettingsChange,
  currentTheme,
  onThemeChange
}) => {
  const formRef = useRef<HTMLFormElement>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRef.current) return;

    const formData = new FormData(formRef.current);
    const newSettings: UserSettings = {
      endpoint: formData.get('endpoint') as string,
      agent: formData.get('agent') as string,
      timezone: formData.get('timezone') as string,
      defaultAdmin: formData.get('defaultAdmin') as string,
      defaultPassword: formData.get('defaultPassword') as string,
      darkMode: formData.get('darkMode') === 'true',
      language: formData.get('language') as string
    };

    onSettingsChange(newSettings);
    onThemeChange(newSettings.darkMode ? 'dark' : 'light');
  };

  return (
    <div className="settings-dialog-overlay" onClick={onClose}>
      <div className="settings-dialog" onClick={e => e.stopPropagation()}>
        <h2>環境設定</h2>
        <form ref={formRef} onSubmit={handleSubmit}>
          <div className="settings-group">
            <label>
              表示モード
              <select name="darkMode" defaultValue={settings.darkMode.toString()}>
                {DISPLAY_MODES.map(mode => (
                  <option key={mode.value} value={mode.value}>
                    {mode.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="settings-group">
            <label>
              表示言語
              <select name="language" defaultValue={settings.language}>
                {LANGUAGES.map(lang => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="settings-group">
            <label>
              タイムゾーン
              <select name="timezone" defaultValue={settings.timezone}>
                {TIMEZONES.map(tz => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="settings-group">
            <label>
              Agentアドレス
              <input
                type="text"
                name="endpoint"
                defaultValue={settings.endpoint}
                placeholder="http://localhost:4111"
              />
            </label>
          </div>

          <div className="settings-group">
            <label>
              Agent名
              <input
                type="text"
                name="agent"
                defaultValue={settings.agent}
                placeholder="xibo"
              />
            </label>
          </div>

          <div className="settings-group">
            <label>
              デフォルト管理者
              <input
                type="text"
                name="defaultAdmin"
                defaultValue={settings.defaultAdmin}
                placeholder="captain"
              />
            </label>
          </div>

          <div className="settings-group">
            <label>
              デフォルトパスワード
              <input
                type="password"
                name="defaultPassword"
                defaultValue={settings.defaultPassword}
                placeholder="administrator"
              />
            </label>
          </div>

          <div className="settings-dialog-buttons">
            <button type="button" onClick={onClose}>キャンセル</button>
            <button type="submit" className="save">保存</button>
          </div>
        </form>
      </div>
    </div>
  );
}; 