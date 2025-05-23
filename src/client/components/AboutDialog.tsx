import React from 'react';
import { VERSION, BUILD_INFO } from '../../config/version';

interface AboutDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const AboutDialog: React.FC<AboutDialogProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  // ビルド日時をフォーマット
  const buildDate = new Date(BUILD_INFO.buildTime).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="settings-dialog-overlay" onClick={onClose}>
      <div className="settings-dialog" onClick={e => e.stopPropagation()}>
        <div className="about-dialog-content">
          <div className="about-header">
            <img src="/images/logo.jpg" alt="Xibo Cockpit Logo" className="about-logo" />
            <h2>xibo-Cockpit</h2>
            <div className="version-info">
              Version: {VERSION}<br />
              Build: {buildDate}
            </div>
          </div>
          
          <div className="about-copyright">
            Copyright 2025 © All rights reserved<br />
            Open Source Digital Signage Initiative
          </div>

          <div className="about-section">
            <h3>License:</h3>
            <p>
              Elastic License 2.0 (ELv2)<br />
              <a href="https://www.elastic.co/licensing/elastic-license" target="_blank" rel="noopener noreferrer">
                https://www.elastic.co/licensing/elastic-license
              </a>
            </p>
          </div>

          <div className="about-section">
            <h3>Github:</h3>
            <p>
              <a href="https://github.com/OpenSignage/xibo-cockpit" target="_blank" rel="noopener noreferrer">
                https://github.com/OpenSignage/xibo-cockpit
              </a>
            </p>
          </div>

          <div className="about-section">
            <h3>Official web site:</h3>
            <p>
              <a href="https://www.open-signage.org" target="_blank" rel="noopener noreferrer">
                https://www.open-signage.org
              </a>
            </p>
          </div>

          <div className="about-trademark">
            Xibo is trademark of Xibo Signage Ltd.<br />
            <a href="https://xibosignage.com/" target="_blank" rel="noopener noreferrer">
              https://xibosignage.com/
            </a>
          </div>
        </div>

        <div className="settings-dialog-buttons">
          <button className="save" onClick={onClose}>閉じる</button>
        </div>
      </div>
    </div>
  );
};

export { AboutDialog }; 