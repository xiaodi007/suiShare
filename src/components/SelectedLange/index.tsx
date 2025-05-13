import React from 'react';
import { ConfigProvider, Select } from 'antd';
import { useTranslation } from 'react-i18next';

const SelectedLange = () => {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('i18nextLng', lng); // 手动存储
  };
  return (
      <Select
        value={i18n.language}
        onChange={changeLanguage}
        dropdownStyle={{ width: 80 }}
        options={[
          { value: 'en', label: 'English' },
          { value: 'zh', label: '中文' }
        ]}
        style={{ width: '100%'}}
      />
  );
};

export default SelectedLange;